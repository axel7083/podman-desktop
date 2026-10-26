/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { Configuration } from '@desktop-framework/extension-api';
import type Electron from 'electron';
import { app, BrowserWindow, Menu, screen } from 'electron';
import { afterEach, assert, beforeEach, describe, expect, test, vi } from 'vitest';

import { ApplicationMenuBuilder } from './application-menu-builder.js';
import { DevelopmentModeTracker } from './development-mode-tracker.js';
import { MainWindow } from './mainWindow.js';
import { OpenDevTools } from './open-dev-tools.js';
import { ApiSender } from './plugin/api-sender.js';
import type { ConfigurationRegistry } from './plugin/configuration-registry.js';
import { ZoomLevelHandler } from './plugin/zoom-level-handler.js';
import { WindowHandler } from './system/window/window-handler.js';
import * as util from './util.js';

vi.mock(import('electron-context-menu'), async () => ({
  default: vi.fn(),
}));
vi.mock(import('electron-util/main'), () => ({ aboutMenuItem: vi.fn() }));
vi.mock(import('./application-menu-builder.js'));
vi.mock(import('./development-menu-builder.js'));
vi.mock(import('./development-mode-tracker.js'));
vi.mock(import('./navigation-items-menu-builder.js'));
vi.mock(import('./open-dev-tools.js'));
vi.mock(import('./plugin/app-ready/app-identity-plugin.js'));
vi.mock(import('./plugin/zoom-level-handler.js'));
vi.mock(import('./system/window/window-handler.js'));

vi.mock(import('./util.js'), async () => ({
  isLinux: vi.fn().mockReturnValue(false),
  isMac: vi.fn().mockReturnValue(false),
  isWindows: vi.fn().mockReturnValue(false),
  stoppedExtensions: { val: true },
}));

let originalArgv: string[] = [];
let preferences: Record<string, unknown>;
let configurationRegistry: ConfigurationRegistry;
let mainWindowDeferred: PromiseWithResolvers<BrowserWindow>;

beforeEach(() => {
  originalArgv = process.argv;
  vi.resetAllMocks();
  process.argv = [...originalArgv];

  // Re-setup default mock implementations after reset
  vi.mocked(app.getPath).mockReturnValue('/Applications/Podman Desktop.app');
  vi.mocked(app.getLoginItemSettings).mockReturnValue({
    wasOpenedAtLogin: false,
  } as Electron.LoginItemSettings);
  vi.mocked(util.isMac).mockReturnValue(false);
  vi.mocked(util.isLinux).mockReturnValue(false);

  vi.mocked(screen.getCursorScreenPoint).mockReturnValue({ x: 0, y: 0 });
  vi.mocked(screen.getDisplayNearestPoint).mockReturnValue({
    workArea: { x: 0, y: 0, width: 1920, height: 1080 },
  } as Electron.Display);

  vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([]);

  // Set up BrowserWindow instance methods via prototype
  BrowserWindow.prototype.loadURL = vi.fn().mockResolvedValue(undefined);
  BrowserWindow.prototype.setBounds = vi.fn();
  BrowserWindow.prototype.on = vi.fn() as unknown as typeof BrowserWindow.prototype.on;
  BrowserWindow.prototype.show = vi.fn();
  BrowserWindow.prototype.focus = vi.fn();
  BrowserWindow.prototype.isMinimized = vi.fn().mockReturnValue(false);
  BrowserWindow.prototype.isDestroyed = vi.fn().mockReturnValue(false);
  BrowserWindow.prototype.destroy = vi.fn();
  BrowserWindow.prototype.hide = vi.fn();
  Object.defineProperty(BrowserWindow.prototype, 'webContents', {
    value: { send: vi.fn(), on: vi.fn(), once: vi.fn() },
    configurable: true,
  });

  // Re-setup auto-mocked class prototypes after reset
  DevelopmentModeTracker.prototype.onDidChangeDevelopmentMode = vi.fn();
  DevelopmentModeTracker.prototype.init = vi.fn();
  OpenDevTools.prototype.open = vi.fn();

  preferences = {};
  configurationRegistry = {
    getConfiguration: vi.fn().mockReturnValue({
      get: vi.fn((key: string) => preferences[key]),
    } as unknown as Configuration),
  } as unknown as ConfigurationRegistry;
  mainWindowDeferred = Promise.withResolvers<BrowserWindow>();
});

afterEach(() => {
  process.argv = originalArgv;
});

// Helper: extract an event handler registered via .on() by event name
function getHandler(mockOnFn: ReturnType<typeof vi.fn>, eventName: string): (...args: unknown[]) => void {
  const call = vi.mocked(mockOnFn).mock.calls.find((c: unknown[]) => c[0] === eventName);
  assert(call, `Expected handler for '${eventName}' to be registered`);
  return call[1] as (...args: unknown[]) => void;
}

// Helper: create the main window through MainWindow and wait for its page to be loaded
async function createMainWindow(): Promise<void> {
  new MainWindow(configurationRegistry, new ApiSender(), mainWindowDeferred, {}).init();
  await mainWindowDeferred.promise;
}

describe('MainWindow', () => {
  test('should deliver the api sender events to the page of the window', async () => {
    const apiSender = new ApiSender();
    new MainWindow(configurationRegistry, apiSender, mainWindowDeferred, {}).init();
    await mainWindowDeferred.promise;
    const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
    assert(bwInstance);

    bwInstance.webContents.isDestroyed = vi.fn().mockReturnValue(false);
    apiSender.markReady();
    getHandler(bwInstance.webContents.on, 'dom-ready')();
    apiSender.send('foo', 'hello-world');

    expect(bwInstance.webContents.send).toHaveBeenCalledWith('api-sender', 'foo', 'hello-world');
  });

  test('should restore its bounds, set its zoom level and the application menu once the page is loaded', async () => {
    const menu = {} as Menu;
    vi.mocked(ApplicationMenuBuilder.prototype.build).mockReturnValue(menu);

    await createMainWindow();
    const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
    assert(bwInstance);

    expect(WindowHandler).toHaveBeenCalledWith(configurationRegistry, bwInstance);
    expect(WindowHandler.prototype.restore).toHaveBeenCalledWith(expect.objectContaining({ width: 1050, height: 700 }));
    expect(ZoomLevelHandler).toHaveBeenCalledWith(bwInstance, configurationRegistry);
    expect(ZoomLevelHandler.prototype.init).toHaveBeenCalled();
    expect(Menu.setApplicationMenu).toHaveBeenCalledWith(menu);
  });

  test('should save its bounds when it is moved or resized', async () => {
    await createMainWindow();
    const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
    assert(bwInstance);

    getHandler(bwInstance.on, 'move')();
    getHandler(bwInstance.on, 'resize')();

    expect(WindowHandler.prototype.savePositionAndSize).toHaveBeenCalledTimes(2);
  });

  test('should create a window on macOS activate when there is none', async () => {
    await createMainWindow();
    vi.mocked(BrowserWindow).mockClear();

    getHandler(vi.mocked(app.on), 'activate')({}, true);

    await vi.waitFor(() => expect(BrowserWindow).toHaveBeenCalledOnce());
  });

  test('should show window on normal launch', async () => {
    await createMainWindow();

    const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
    assert(bwInstance);

    const readyToShow = getHandler(bwInstance.on, 'ready-to-show');
    readyToShow();

    expect(bwInstance.show).toHaveBeenCalled();
    expect(app.dock?.hide).not.toHaveBeenCalled();
  });

  test('should hide dock on macOS when started with --minimize flag', async () => {
    vi.mocked(util.isMac).mockReturnValue(true);
    process.argv = ['electron', '--minimize'];

    await createMainWindow();

    const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
    assert(bwInstance);

    const readyToShow = getHandler(bwInstance.on, 'ready-to-show');
    readyToShow();

    expect(bwInstance.show).not.toHaveBeenCalled();
    expect(app.dock?.hide).toHaveBeenCalled();
  });

  test.each([
    { minimize: false, shown: true },
    { minimize: true, shown: false },
  ])('macOS login item launch with login.minimize=$minimize', async ({ minimize, shown }) => {
    vi.mocked(util.isMac).mockReturnValue(true);
    vi.mocked(app.getLoginItemSettings).mockReturnValue({
      wasOpenedAtLogin: true,
    } as Electron.LoginItemSettings);
    preferences['login.minimize'] = minimize;

    await createMainWindow();
    const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
    assert(bwInstance);

    // Nothing should happen before the first paint, which is what the `show: false` window option is for
    expect(bwInstance.show).not.toHaveBeenCalled();

    const readyToShow = getHandler(bwInstance.on, 'ready-to-show');
    readyToShow();

    expect(bwInstance.show).toHaveBeenCalledTimes(shown ? 1 : 0);
    expect(app.dock?.hide).toHaveBeenCalledTimes(shown ? 0 : 1);
  });

  test('should not defer on non-macOS even if wasOpenedAtLogin is true', async () => {
    vi.mocked(util.isMac).mockReturnValue(false);
    vi.mocked(app.getLoginItemSettings).mockReturnValue({
      wasOpenedAtLogin: true,
    } as Electron.LoginItemSettings);

    await createMainWindow();

    const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
    assert(bwInstance);

    const readyToShow = getHandler(bwInstance.on, 'ready-to-show');
    readyToShow();

    // Window should be shown immediately (no deferral on non-macOS)
    expect(bwInstance.show).toHaveBeenCalled();
  });

  test('should force quit on close when tray is disabled', async () => {
    vi.mocked(util.isLinux).mockReturnValue(true);
    preferences['ExitOnClose'] = false;
    preferences['ShowTrayIcon'] = false;

    await createMainWindow();

    const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
    assert(bwInstance);

    // Now trigger the close event
    const closeHandler = getHandler(bwInstance.on, 'close');
    const mockEvent = { preventDefault: vi.fn() };

    closeHandler(mockEvent);

    // Should quit (destroy + app.quit) even though ExitOnClose is false, because tray is hidden
    expect(bwInstance.destroy).toHaveBeenCalled();
    expect(app.quit).toHaveBeenCalled();
  });

  describe('Linux did-finish-load (replaces ready-to-show)', () => {
    beforeEach(() => {
      vi.mocked(util.isLinux).mockReturnValue(true);
    });

    afterEach(() => {
      delete process.env['WAYLAND_DISPLAY'];
    });

    test('should show window via did-finish-load on Linux X11', async () => {
      await createMainWindow();

      const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
      assert(bwInstance);

      const didFinishLoad = getHandler(bwInstance.webContents.once, 'did-finish-load');
      didFinishLoad();

      expect(bwInstance.show).toHaveBeenCalled();
    });

    test('should show window via did-finish-load on Linux Wayland', async () => {
      process.env['WAYLAND_DISPLAY'] = 'wayland-0';

      await createMainWindow();

      const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
      assert(bwInstance);

      const didFinishLoad = getHandler(bwInstance.webContents.once, 'did-finish-load');
      didFinishLoad();

      expect(bwInstance.show).toHaveBeenCalled();
    });

    test('should not register ready-to-show on Linux (avoids Wayland show() feedback loop)', async () => {
      await createMainWindow();

      const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
      assert(bwInstance);

      const registeredEvents = vi.mocked(bwInstance.on).mock.calls.map((c: unknown[]) => c[0]);
      expect(registeredEvents).not.toContain('ready-to-show');
    });

    test('should not register did-finish-load handler when not on Linux', async () => {
      vi.mocked(util.isLinux).mockReturnValue(false);

      await createMainWindow();

      const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
      assert(bwInstance);

      expect(bwInstance.webContents.once).not.toHaveBeenCalledWith('did-finish-load', expect.any(Function));
    });

    test('should not show window via did-finish-load when --minimize flag is set', async () => {
      process.argv = ['electron', '--minimize'];

      await createMainWindow();

      const bwInstance = vi.mocked(BrowserWindow).mock.results[0]?.value;
      assert(bwInstance);

      const didFinishLoad = getHandler(bwInstance.webContents.once, 'did-finish-load');
      didFinishLoad();

      expect(bwInstance.show).not.toHaveBeenCalled();
    });
  });
});
