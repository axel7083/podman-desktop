/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import { join } from 'node:path';
import { URL } from 'node:url';

import type { BrowserWindowConstructorOptions, Rectangle } from 'electron';
import { app, autoUpdater, BrowserWindow, ipcMain, Menu, nativeTheme, screen } from 'electron';
import contextMenu from 'electron-context-menu';
import { inject, injectable, optional, postConstruct } from 'inversify';

import { ApiSender } from '/@/app/api-sender.js';
import { AppIdentity } from '/@/app/app-identity.js';
import { ApplicationMenuBuilder } from '/@/application-menu-builder.js';
import { buildDevelopmentMenu } from '/@/development-menu-builder.js';
import { DevelopmentModeTracker } from '/@/development-mode-tracker.js';
import { NavigationItemsMenuBuilder } from '/@/navigation-items-menu-builder.js';
import { OpenDevTools } from '/@/open-dev-tools.js';
import { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { ZoomLevelHandler } from '/@/plugin/zoom-level-handler.js';
import { isLinux, isMac, stoppedExtensions } from '/@/util.js';

import { LoginMinimizeHandler } from './login-minimize-handler.js';
import { RendererV2Configuration } from './renderer-v2-configuration.js';
import { WindowHandler } from './window-handler.js';

const openDevTools = new OpenDevTools();
const loginMinimizeHandler = new LoginMinimizeHandler();
let navigationItemsMenuBuilder: NavigationItemsMenuBuilder;

// development mode for extensions
export interface WindowConfig {
  icon?: Electron.NativeImage;
  // load packages/renderer-v2 instead of packages/renderer
  useRendererV2?: boolean;
}

let isExtensionsDevelopmentModeEnabled = false;

async function createWindow(
  configurationRegistry: ConfigurationRegistry,
  apiSender: ApiSender,
  config?: WindowConfig,
): Promise<BrowserWindow> {
  const INITIAL_APP_WIDTH = 1050;
  const INITIAL_APP_MIN_WIDTH = 640;
  const INITIAL_APP_HEIGHT = 700;
  const INITIAL_APP_MIN_HEIGHT = 600;

  // We have a "dark" background color in order to avoid the white flash when loading the app
  // this only occurs if the user clicks on the app icon milliseconds before the app is fully loaded.
  // We use the native theme to determine if we should use a dark background color or not.
  const INITIAL_APP_BACKGROUND_COLOR = nativeTheme.shouldUseDarkColors ? '#18181b' : '#ffffff';

  const browserWindowConstructorOptions: BrowserWindowConstructorOptions = {
    show: false, // Use 'ready-to-show' event to show window
    autoHideMenuBar: true, // This makes Podman Desktop look more like a native app
    width: INITIAL_APP_WIDTH,
    minWidth: INITIAL_APP_MIN_WIDTH,
    minHeight: INITIAL_APP_MIN_HEIGHT,
    height: INITIAL_APP_HEIGHT,
    backgroundColor: INITIAL_APP_BACKGROUND_COLOR,
    ...(config?.icon && { icon: config.icon }),
    webPreferences: {
      webSecurity: false,
      //nativeWindowOpen: true,
      webviewTag: true, // The webview tag is not recommended. Consider alternatives like iframe or Electron's BrowserView. https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(__dirname, '../../preload/dist/index.cjs'),
    },
  };

  // On Wayland, frame: false strips all native decorations and the compositor has no
  // server-side decoration protocol to fall back on, so the window appears borderless.
  // Use titleBarStyle: 'hidden' instead to keep the native compositor frame (border,
  // resize handles, shadow) while still letting the app render its own title bar chrome.
  // On X11 Linux, frame: false is fine because the window manager draws decorations.
  if (isLinux() && !isWayland()) {
    browserWindowConstructorOptions.frame = false;
  } else {
    browserWindowConstructorOptions.titleBarStyle = 'hidden';
  }

  if (isMac()) {
    // change position of traffic light buttons
    // renderer-v2 has a 36px title bar: center the 14px high buttons in it, clear of its logo
    browserWindowConstructorOptions.trafficLightPosition = config?.useRendererV2 ? { x: 12, y: 11 } : { x: 20, y: 13 };
  }

  const browserWindow = new BrowserWindow(browserWindowConstructorOptions);
  // the page has not started loading yet, so the api sender does not miss its dom-ready event
  apiSender.attach(browserWindow.webContents);

  const { getCursorScreenPoint, getDisplayNearestPoint } = screen;
  const workArea = getDisplayNearestPoint(getCursorScreenPoint()).workArea;

  const x = Math.round(workArea.width / 2 - INITIAL_APP_WIDTH / 2 + workArea.x);
  const y = Math.round(workArea.height / 2 - INITIAL_APP_HEIGHT / 2);

  const initialBounds: Rectangle = {
    x: x,
    y: y,
    width: INITIAL_APP_WIDTH,
    height: INITIAL_APP_HEIGHT,
  };
  browserWindow.setBounds(initialBounds);

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  // Shared show logic used by both ready-to-show and the Wayland did-finish-load fallback.
  const handleWindowShow = (): void => {
    // If started with --minimize flag (Windows login item or manual CLI), hide the window
    if (isStartedMinimize()) {
      if (isMac()) {
        app.dock?.hide();
      }
    } else if (isMac() && app.getLoginItemSettings().wasOpenedAtLogin) {
      // On macOS, app.setLoginItemSettings() does not support passing CLI args,
      // so the preferences.login.minimize setting decides whether to show the window
      loginMinimizeHandler.apply(browserWindow, configurationRegistry);
    } else {
      browserWindow.show();
    }
  };

  // On Linux, ready-to-show is not reliably fired by Electron (affects both X11 and Wayland).
  // On Wayland specifically, calling show() from within ready-to-show also re-triggers the
  // event causing a feedback loop. Use did-finish-load for all Linux sessions to avoid both.
  if (isLinux()) {
    browserWindow.webContents.once('did-finish-load', handleWindowShow);
  } else {
    browserWindow.on('ready-to-show', handleWindowShow);
  }

  // refresh the value of the development mode config property
  const developmentModeTracker = new DevelopmentModeTracker(configurationRegistry);
  developmentModeTracker.onDidChangeDevelopmentMode(enabled => {
    isExtensionsDevelopmentModeEnabled = enabled;
  });
  developmentModeTracker.init();

  navigationItemsMenuBuilder = new NavigationItemsMenuBuilder(configurationRegistry);

  // open dev tools (if required)
  openDevTools.open(browserWindow, configurationRegistry);

  // receive the navigation items
  ipcMain.handle('navigation:sendNavigationItems', (_, data) => {
    navigationItemsMenuBuilder?.receiveNavigationItems(data);
  });

  // receive the message because an update is in progress and we need to quit the app
  let quitAfterUpdate = false;
  autoUpdater.on('before-quit-for-update', () => {
    quitAfterUpdate = true;
  });

  browserWindow.on('close', e => {
    if (quitAfterUpdate) {
      browserWindow.destroy();
      app.quit();
      return;
    }

    const closeBehaviorConfiguration = configurationRegistry.getConfiguration('preferences');
    const exitonclose =
      closeBehaviorConfiguration.get<boolean>('ExitOnClose') === true ||
      closeBehaviorConfiguration.get<boolean>('ShowTrayIcon') === false;

    e.preventDefault();
    if (!exitonclose) {
      browserWindow.hide();
      if (isMac()) {
        app.dock?.hide();
      }
    } else {
      browserWindow.destroy();
      app.quit();
    }
  });

  let destroyed = false;
  app.on('before-quit', () => {
    if (destroyed || !stoppedExtensions.val) {
      return;
    }
    browserWindow.destroy();
    destroyed = true;
  });

  contextMenu({
    showLearnSpelling: false,
    showLookUpSelection: false,
    showSearchWithGoogle: false,
    showCopyImage: false,
    showCopyImageAddress: false,
    showSaveImage: false,
    showSaveImageAs: false,
    showSaveLinkAs: false,
    showInspectElement: import.meta.env.DEV,
    showServices: false,
    prepend: (_defaultActions, parameters) => {
      return buildDevelopmentMenu(parameters, browserWindow, isExtensionsDevelopmentModeEnabled);
    },
    append: (_defaultActions, parameters) => {
      return navigationItemsMenuBuilder?.buildNavigationMenu(parameters) ?? [];
    },
    onClose: () => {
      browserWindow.webContents.send('context-menu:visible', false);
    },
    onShow: () => {
      browserWindow.webContents.send('context-menu:visible', true);
    },
  });

  await browserWindow.loadURL(getRendererUrl(config?.useRendererV2 ?? false));

  // save and restore the window position and size
  const windowHandler = new WindowHandler(configurationRegistry, browserWindow);
  windowHandler.init();
  windowHandler.restore(initialBounds);
  browserWindow.on('resize', () => windowHandler.savePositionAndSize());
  browserWindow.on('move', () => windowHandler.savePositionAndSize());

  const zoomLevelHandler = new ZoomLevelHandler(browserWindow, configurationRegistry);
  zoomLevelHandler.init();

  const menu = new ApplicationMenuBuilder(zoomLevelHandler).build();
  if (menu) {
    Menu.setApplicationMenu(menu);
  }

  return browserWindow;
}

/**
 * URL for main window.
 * Vite dev server for development.
 * `file://../renderer/dist/index.html` for production and test,
 * `file://../renderer-v2/dist/index.html` when the experimental renderer v2 is enabled.
 */
export function getRendererUrl(useRendererV2: boolean): string {
  const devServerUrl = useRendererV2 ? import.meta.env.VITE_DEV_SERVER_URL_V2 : import.meta.env.VITE_DEV_SERVER_URL;
  if (import.meta.env.DEV && devServerUrl !== undefined) {
    return devServerUrl;
  }
  const rendererFolder = useRendererV2 ? 'renderer-v2' : 'renderer';
  return new URL(`../${rendererFolder}/dist/index.html`, 'file://' + __dirname).toString();
}

// Create a new window if there is no existing window
export async function createNewWindow(
  configurationRegistry: ConfigurationRegistry,
  apiSender: ApiSender,
  config?: WindowConfig,
): Promise<BrowserWindow> {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  window ??= await createWindow(configurationRegistry, apiSender, config);
  return window;
}

/**
 * Creates the main window once the configuration registry is available, and gives access to it once its page
 * is loaded. It is a startup service of the plugin system container.
 */
@injectable()
export class MainWindow {
  #browserWindow: BrowserWindow | undefined;

  constructor(
    @inject(ConfigurationRegistry)
    private readonly configurationRegistry: ConfigurationRegistry,
    @inject(ApiSender)
    private readonly apiSender: ApiSender,
    @inject(AppIdentity)
    @optional()
    private readonly appIdentity: AppIdentity | undefined,
    @inject(RendererV2Configuration)
    private readonly rendererV2Configuration: RendererV2Configuration,
  ) {}

  @postConstruct()
  init(): void {
    this.createWindow();

    // Platforms: macOS
    // Required for macOS to start the app correctly (this is will be shown in the dock)
    // We use 'activate' within whenReady in order to gracefully start on macOS, see this link:
    // https://www.electronjs.org/docs/latest/tutorial/quick-start#open-a-window-if-none-are-open-macos
    app.on('activate', (_event, hasVisibleWindows) => {
      this.createWindow();

      // try to restore the window if it's not visible
      // for example user click on the dock icon
      if (isMac() && !hasVisibleWindows) {
        restoreWindow().catch((error: unknown) => {
          console.error('Error restoring window', error);
        });
      }
    });
  }

  /** The main window, once its page is loaded. */
  get browserWindow(): BrowserWindow | undefined {
    return this.#browserWindow;
  }

  protected createWindow(): void {
    createNewWindow(this.configurationRegistry, this.apiSender, {
      icon: this.appIdentity?.getWindowIcon(),
      useRendererV2: this.rendererV2Configuration.isEnabled(),
    })
      .then(browserWindow => {
        this.#browserWindow = browserWindow;
      })
      .catch((error: unknown) => {
        console.error('Error creating window', error);
      });
  }
}

// Restore the window if it is minimized / not shown / there is already another instance running
export async function restoreWindow(): Promise<void> {
  const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  // Only restore the window if we were able to find it
  if (window) {
    if (window.isMinimized()) {
      window.restore();
    }

    window.show();
    window.focus();
  }
}

// Checks process args if it was started with the --minimize flag
function isStartedMinimize(): boolean {
  // We convert to string only because sometimes [node] will be the first argument in a packaged
  // environment, so instead of checking each element, simply convert to string and see if --minimize was included.
  const argv = process.argv.toString();
  return argv.includes('--minimize');
}

// Detects whether the current session is running under Wayland.
// XDG_SESSION_TYPE is checked first as it can be overridden by the user;
// WAYLAND_DISPLAY is used as a fallback (set by the Wayland compositor).
function isWayland(): boolean {
  return process.env['XDG_SESSION_TYPE'] === 'wayland' || !!process.env['WAYLAND_DISPLAY'];
}
