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
import { app } from 'electron';

import { restoreWindow } from '/@/mainWindow.js';
import type { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';

import { type AdditionalData, Main } from './main.js';
import type { ConfigurationRegistry } from './plugin/configuration-registry.js';
import { Emitter } from './plugin/events/emitter.js';
import { PluginSystem } from './plugin/index.js';
import { isWindows, stoppedExtensions } from './util.js';

let extensionLoader: ExtensionLoader | undefined;

// Main startup
const podmanDesktopMain = new Main(app);
podmanDesktopMain.main(process.argv);

// TODO: remove when index.spec.ts tests are migrated in podmanDesktopMain-main.spec
export const mainWindowDeferred = podmanDesktopMain.mainWindowDeferred;

// do not use _args as it may contain additional arguments
app.on('second-instance', (_event, _args, _workingDirectory, additionalData: unknown) => {
  // if we are on Windows, we need to handle the protocol
  if (isWindows() && additionalData && (additionalData as AdditionalData).argv) {
    podmanDesktopMain.protocolLauncher.handleAdditionalProtocolLauncherArgs((additionalData as AdditionalData).argv);
  }

  restoreWindow().catch((error: unknown) => {
    console.error('Error restoring window', error);
  });
});

app.once('before-quit', event => {
  if (!extensionLoader) {
    stoppedExtensions.val = true;
    return;
  }
  event.preventDefault();
  extensionLoader
    .asyncDispose()
    .then(() => {
      console.log('Stopped all extensions');
    })
    .catch((error: unknown) => {
      console.log('Error stopping extensions', error);
    })
    .finally(() => {
      stoppedExtensions.val = true;
      app.quit();
    });
});

// Handle the open-url event (macOS/Linux). For Windows, it needs to be handle in the second-instance event
app.on('will-finish-launching', () => {
  app.on('open-url', (event, url) => {
    event.preventDefault();
    // delegate to the handler
    podmanDesktopMain.protocolLauncher.handleOpenUrl(url);
  });
});

app.whenReady().then(
  async () => {
    const _onDidCreatedConfigurationRegistry = new Emitter<ConfigurationRegistry>();

    // Start extensions
    const pluginSystem = new PluginSystem(podmanDesktopMain.mainWindowDeferred, podmanDesktopMain.windowConfig);

    extensionLoader = await pluginSystem.initExtensions(_onDidCreatedConfigurationRegistry);
  },
  (e: unknown) => console.error('Failed to start app:', e),
);
