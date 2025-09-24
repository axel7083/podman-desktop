#!/usr/bin/env node

/**********************************************************************
 * Copyright (C) 2022-2025 Red Hat, Inc.
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

import { createServer, build, createLogger } from 'vite';
import electronPath from 'electron';
import { spawn } from 'child_process';
import { generateAsync } from 'dts-for-context-bridge';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync } from 'node:fs';
import { delimiter, join } from 'node:path';
import type { InlineConfig, LogLevel, ResolvedServerOptions, WebSocketServer } from 'vite';
import type { OutputPlugin } from 'rollup';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mode: string = (process.env.MODE = process.env.MODE || 'development');

const LOG_LEVEL: LogLevel = 'info';

const sharedConfig: InlineConfig = {
  mode,
  build: {
    watch: {},
  },
  logLevel: LOG_LEVEL,
};

/** Messages on stderr that match any of the contained patterns will be stripped from output */
const stderrFilterPatterns = [
  // warning about devtools extension
  // https://github.com/cawa-93/vite-electron-builder/issues/492
  // https://github.com/MarshallOfSound/electron-devtools-installer/issues/143
  /ExtensionLoadWarning/,
];

const getWatcher = ({
  name,
  configFile,
  writeBundle,
}: {
  name: string;
  configFile: string;
  writeBundle: OutputPlugin['writeBundle'];
}) => {
  return build({
    ...sharedConfig,
    configFile,
    plugins: [{ name, writeBundle }],
  });
};

const EXTENSION_OPTION = '--extension-folder';

/**
 * Start or restart App when source files are changed
 */
const setupMainPackageWatcher = (
  { config: { server } }: { config: { server: ResolvedServerOptions } },
  extensions: Array<string>,
) => {
  // Create VITE_DEV_SERVER_URL environment variable to pass it to the main process.
  {
    const protocol = server.https ? 'https:' : 'http:';
    const host = server.host || 'localhost';
    const port = server.port; // Vite searches for and occupies the first free port: 3000, 3001, 3002 and so on
    const path = '/';
    process.env.VITE_DEV_SERVER_URL = `${protocol}//${host}:${port}${path}`;
  }

  const logger = createLogger(LOG_LEVEL, {
    prefix: '[main]',
  });

  let spawnProcess: ChildProcessWithoutNullStreams | undefined = undefined;

  return getWatcher({
    name: 'reload-app-on-main-package-change',
    configFile: 'packages/main/vite.config.js',
    writeBundle() {
      if (spawnProcess !== undefined) {
        spawnProcess.off('exit', process.exit);
        spawnProcess.kill('SIGINT');
        spawnProcess = undefined;
      }

      const extensionArgs: Array<string> = [];
      extensions.forEach(extension => {
        extensionArgs.push(EXTENSION_OPTION);
        extensionArgs.push(extension);
      });
      spawnProcess = spawn(String(electronPath), ['--remote-debugging-port=9223', '.', ...extensionArgs], {
        env: { ...process.env, ELECTRON_IS_DEV: '1' },
      });

      spawnProcess.stdout.on('data', d => d.toString().trim() && logger.warn(d.toString(), { timestamp: true }));
      spawnProcess.stderr.on('data', d => {
        const data = d.toString().trim();
        if (!data) return;
        const mayIgnore = stderrFilterPatterns.some(r => r.test(data));
        if (mayIgnore) return;
        logger.error(data, { timestamp: true });
      });

      // Stops the watch script when the application has been quit
      spawnProcess.on('exit', process.exit);
    },
  });
};

const setupUiPackageWatcher = () => {
  const logger = createLogger(LOG_LEVEL, {
    prefix: '[ui]',
  });

  const dirname = join(__dirname, '..', 'node_modules', '.bin');
  const exe = 'svelte-package'.concat(process.platform === 'win32' ? '.cmd' : '');
  const newPath = `${process.env.PATH}${delimiter}${dirname}`;
  const spawnProcess: ChildProcessWithoutNullStreams = spawn(exe, ['-w'], {
    cwd: './packages/ui/',
    env: { PATH: newPath, ...process.env },
    shell: process.platform === 'win32',
  });

  spawnProcess.stdout.on('data', d => d.toString().trim() && logger.warn(d.toString(), { timestamp: true }));
  spawnProcess.stderr.on('data', d => {
    const data = d.toString().trim();
    if (!data) return;
    const mayIgnore = stderrFilterPatterns.some(r => r.test(data));
    if (mayIgnore) return;
    logger.error(data, { timestamp: true });
  });

  // Stops the watch script when the application has been quit
  spawnProcess.on('exit', process.exit);
};

/**
 * Start or restart App when source files are changed
 */
const setupPreloadPackageWatcher = ({ ws }: { ws: WebSocketServer }) =>
  getWatcher({
    name: 'reload-page-on-preload-package-change',
    configFile: 'packages/preload/vite.config.js',
    writeBundle() {
      // Generating exposedInMainWorld.d.ts when preload package is changed.
      generateAsync({
        input: 'packages/preload/tsconfig.json',
        output: 'packages/preload/exposedInMainWorld.d.ts',
      });
      if (ws) {
        ws.send({
          type: 'full-reload',
        });
      }
    },
  });

const setupPreloadDockerExtensionPackageWatcher = ({ ws }: { ws: WebSocketServer }) =>
  getWatcher({
    name: 'reload-page-on-preload-docker-extension-package-change',
    configFile: 'packages/preload-docker-extension/vite.config.js',
    writeBundle() {
      // Generating exposedInMainWorld.d.ts when preload package is changed.
      generateAsync({
        input: 'packages/preload-docker-extension/tsconfig.json',
        output: 'packages/preload-docker-extension/exposedInDockerExtension.d.ts',
      });

      if (ws) {
        ws.send({
          type: 'full-reload',
        });
      }
    },
  });

const setupPreloadWebviewPackageWatcher = ({ ws }: { ws: WebSocketServer }) =>
  getWatcher({
    name: 'reload-page-on-preload-webview-package-change',
    configFile: 'packages/preload-webview/vite.config.js',
    writeBundle() {
      // Generating exposedInWebview.d.ts when preload package is changed.
      generateAsync({
        input: 'packages/preload-webview/tsconfig.json',
        output: 'packages/preload-webview/exposedInWebview.d.ts',
      });

      if (ws) {
        ws.send({
          type: 'full-reload',
        });
      }
    },
  });

/**
 * Start or restart App when source files are changed
 */
const setupExtensionApiWatcher = (name: string) => {
  let spawnProcess;
  const folderName = resolve(name);

  console.log('dirname is', folderName);
  spawnProcess = spawn('pnpm', ['watch'], { cwd: folderName, shell: process.platform === 'win32' });

  spawnProcess.stdout.on('data', d => d.toString().trim() && console.warn(d.toString(), { timestamp: true }));
  spawnProcess.stderr.on('data', d => {
    const data = d.toString().trim();
    if (!data) return;
    console.error(data, { timestamp: true });
  });

  // Stops the watch script when the application has been quit
  spawnProcess.on('exit', process.exit);
};

(async () => {
  try {
    const extensions: Array<string> = [];
    for (let index = 0; index < process.argv.length; index++) {
      if (process.argv[index] === EXTENSION_OPTION && index < process.argv.length - 1) {
        extensions.push(resolve(process.argv[++index]));
      }
    }
    const viteDevServer = await createServer({
      ...sharedConfig,
      configFile: 'packages/renderer/vite.config.js',
    });

    await viteDevServer.listen();

    // get extensions folder
    const extensionsFolder = resolve(__dirname, '../extensions/');

    // Loop on all subfolders from the extensions folder.
    // If package.json is present it is an extension without API.
    // If package.json is missing look into packages/extension folder
    // and if package.json is present it is na extension with API.
    readdirSync(extensionsFolder, { withFileTypes: true })
      .filter(
        dirent =>
          dirent.isDirectory() &&
          (existsSync(join(extensionsFolder, dirent.name, 'package.json')) || existsSync(extensionsFolder)),
      )
      .forEach(dirent => {
        const apiExtPath = join(extensionsFolder, dirent.name, 'packages', 'extension');
        if (existsSync(join(apiExtPath, 'package.json'))) {
          setupExtensionApiWatcher(apiExtPath);
        } else if (existsSync(join(extensionsFolder, dirent.name, 'package.json'))) {
          setupExtensionApiWatcher(join(extensionsFolder, dirent.name));
        }
      });

    for (const extension of extensions) {
      setupExtensionApiWatcher(extension);
    }
    await setupPreloadPackageWatcher(viteDevServer);
    await setupPreloadDockerExtensionPackageWatcher(viteDevServer);
    await setupPreloadWebviewPackageWatcher(viteDevServer);
    await setupUiPackageWatcher();
    await setupMainPackageWatcher(viteDevServer, extensions);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
