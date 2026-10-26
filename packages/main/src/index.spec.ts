/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import { app, BrowserWindow } from 'electron';
import { afterEach, assert, beforeEach, expect, test, vi } from 'vitest';

import type { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';

import { mainWindowDeferred } from './index.js';
import { PluginSystem } from './plugin/index.js';

const consoleLogMock = vi.fn();
const originalConsoleLog = console.log;

const constants = vi.hoisted(() => {
  let resolveFn: ((value: void | PromiseLike<void>) => void) | undefined = undefined;
  return {
    appReadyDeferredPromise: new Promise<void>(resolve => {
      resolveFn = resolve;
    }),
    resolveFn,
  };
});

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable import/no-extraneous-dependencies */
vi.mock(import('electron-is-dev'), async () => {
  return {};
});
vi.mock(import('electron-context-menu'), async () => {
  return {
    default: vi.fn(),
  };
});
vi.mock(import('electron-util/main'), async () => {
  return {
    aboutMenuItem: vi.fn().mockReturnValue({ label: 'foo' }),
  };
});

const fakeWindow = {
  isDestroyed: vi.fn(),
  isMinimized: vi.fn().mockReturnValue(false),
  show: vi.fn(),
  focus: vi.fn(),
  restore: vi.fn(),
  webContents: {
    send: vi.fn(),
  },
} as unknown as BrowserWindow;

const extensionLoader = {
  getConfigurationRegistry: vi.fn(),
} as unknown as ExtensionLoader;

vi.mock(import('/@/plugin/app-ready/app-identity-plugin.js'));
vi.mock(import('./index.js'), async importOriginal => {
  const electron = await import('electron');
  vi.mocked(electron.app.whenReady).mockReturnValue(constants.appReadyDeferredPromise);
  vi.mocked(electron.app.requestSingleInstanceLock).mockReturnValue(true);
  return importOriginal();
});
vi.mock(import('./plugin/index.js'));
vi.mock(import('./util.js'), () => ({
  isWindows: vi.fn().mockReturnValue(false),
  isMac: vi.fn().mockReturnValue(false),
  isLinux: vi.fn().mockReturnValue(false),
}));

beforeEach(() => {
  console.log = consoleLogMock;
  vi.clearAllMocks();

  vi.mocked(PluginSystem.prototype.initExtensions).mockResolvedValue(extensionLoader);

  vi.mocked(app.whenReady).mockReturnValue(constants.appReadyDeferredPromise);
  vi.mocked(app.getPath).mockReturnValue('');
  vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([fakeWindow]);
  const newDefer = Promise.withResolvers<BrowserWindow>();
  if (mainWindowDeferred.promise !== undefined) {
    mainWindowDeferred.resolve = newDefer.resolve;
    mainWindowDeferred.promise = newDefer.promise;
    mainWindowDeferred.reject = newDefer.reject;
  }
  mainWindowDeferred.resolve(fakeWindow);
});

afterEach(() => {
  console.log = originalConsoleLog;
});

test('app-ready event starts the plugin system with the main window config', async () => {
  if (constants.resolveFn) {
    const appReady: (value: void | Promise<void>) => void = constants.resolveFn;
    appReady();
  } else {
    assert.fail('constants.resolveFn is undefined');
  }
  await vi.waitFor(() => expect(PluginSystem.prototype.initExtensions).toHaveBeenCalledOnce());

  expect(PluginSystem).toHaveBeenCalledWith(mainWindowDeferred, expect.any(Object));
});
