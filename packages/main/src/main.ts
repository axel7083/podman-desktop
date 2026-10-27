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
import type { App as ElectronApp } from 'electron';
import { Container } from 'inversify';

import { module as appModule } from '/@/app/$module.js';
import { ProtocolLauncher } from '/@/app/protocol-launcher.js';
import { ElectronApp as ElectronAppSymbol, StartupSymbol } from '/@/inject/symbol.js';
import type { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import { restoreWindow } from '/@/system/window/main-window.js';
import { isLinux, isMac, isWindows, stoppedExtensions } from '/@/util.js';
import product from '/@product.json' with { type: 'json' };

import { PluginSystem } from './plugin/index.js';

export type AdditionalData = {
  argv: string[];
};

/**
 * The main Podman Desktop entry point
 */
export class Main {
  // TODO: should be renamed to #app
  public app: ElectronApp;
  // TODO: should be renamed to #protocolLauncher
  public protocolLauncher: ProtocolLauncher;

  // application scope container, the plugin system works in a child container
  readonly #container = new Container();

  #extensionLoader: ExtensionLoader | undefined;

  constructor(app: ElectronApp) {
    this.app = app;
    this.app.name = product.name;
    this.#container.bind<ElectronApp>(ElectronAppSymbol).toConstantValue(app);
    this.#container.load(appModule);
    this.protocolLauncher = this.#container.get<ProtocolLauncher>(ProtocolLauncher);
  }

  main(args: string[]): void {
    // parse argv
    const argv = args.slice(2);
    const additionalData: AdditionalData = {
      argv: argv,
    };

    try {
      this.init(additionalData);
    } catch (err: unknown) {
      console.error(`failed to init ${product.name}`, err);
    }
  }

  protected init(additionalData: AdditionalData): void {
    // instantiate the startup services (e.g. the security restrictions), before the single instance lock
    this.#container.getAll(StartupSymbol);

    /**
     * Prevent multiple instances
     */
    const isSingleInstance = this.app.requestSingleInstanceLock(additionalData);
    if (!isSingleInstance) {
      console.warn(`An instance of ${product.name} is already running. Stopping`);
      this.app.quit();
      process.exit(0);
    }

    /**
     * Disable Hardware Acceleration for more power-save
     */
    this.app.disableHardwareAcceleration();

    /**
     *  @see https://www.electronjs.org/docs/latest/api/app#appsetappusermodelidid-windows
     */
    if (isWindows()) {
      this.app.setAppUserModelId(product.appId);
    }

    /**
     * Since electron v36
     * references
     * - https://github.com/electron/electron/issues/46538
     * - https://chromium-review.googlesource.com/c/chromium/src/+/6310469
     */
    if (isLinux()) {
      this.app.commandLine.appendSwitch('gtk-version', '3');
    }

    /**
     * Setup {@link ElectronApp.on} listeners
     */
    this.app.on('second-instance', this.onSecondInstance.bind(this));
    this.app.on('will-finish-launching', this.onWillFinishLaunching.bind(this));
    this.app.on('window-all-closed', this.onWindowAllClosed.bind(this));
    this.app.once('before-quit', this.onBeforeQuitStopExtensions.bind(this));

    this.app
      .whenReady()
      .then(this.startPluginSystem.bind(this), (e: unknown) => console.error('Failed to start app:', e));
  }

  /**
   * Starts the plugin system, once {@link ElectronApp#whenReady} resolved
   */
  protected async startPluginSystem(): Promise<void> {
    // Start extensions
    const pluginSystem = new PluginSystem(this.#container);

    this.#extensionLoader = await pluginSystem.initExtensions();
  }

  /**
   * Listener for the first {@link ElectronApp.on('before-quit')} event
   * Stops the extensions before quitting again
   */
  protected onBeforeQuitStopExtensions(event: { preventDefault: () => void }): void {
    if (!this.#extensionLoader) {
      stoppedExtensions.val = true;
      return;
    }
    event.preventDefault();
    this.#extensionLoader
      .asyncDispose()
      .then(() => {
        console.log('Stopped all extensions');
      })
      .catch((error: unknown) => {
        console.log('Error stopping extensions', error);
      })
      .finally(() => {
        stoppedExtensions.val = true;
        this.app.quit();
      });
  }

  /**
   * Listener for {@link ElectronApp.on('second-instance')} event
   * do not use _args as it may contain additional arguments
   */
  protected onSecondInstance(
    _event: unknown,
    _args: string[],
    _workingDirectory: string,
    additionalData: unknown,
  ): void {
    // if we are on Windows, we need to handle the protocol
    if (isWindows() && additionalData && (additionalData as AdditionalData).argv) {
      this.protocolLauncher.handleAdditionalProtocolLauncherArgs((additionalData as AdditionalData).argv);
    }

    restoreWindow().catch((error: unknown) => {
      console.error('Error restoring window', error);
    });
  }

  /**
   * Listener for {@link ElectronApp.on('will-finish-launching')} event
   * Handle the open-url event (macOS/Linux). For Windows, it needs to be handle in the second-instance event
   */
  protected onWillFinishLaunching(): void {
    this.app.on('open-url', (event, url) => {
      event.preventDefault();
      // delegate to the handler
      this.protocolLauncher.handleOpenUrl(url);
    });
  }

  /**
   * Listener for {@link ElectronApp.on('window-all-closed')} event
   * Shout down background process if all windows was closed
   */
  protected onWindowAllClosed(): void {
    if (!isMac()) {
      this.app.quit();
    }
  }
}
