/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { isWindows } from '/@/util.js';
import product from '/@product.json' with { type: 'json' };

import { DefaultProtocolClient } from './default-protocol-client.js';

vi.mock(import('/@/util.js'));
vi.mock(import('/@product.json'));

const ELECTRON_APP_MOCK: ElectronApp = {
  setAsDefaultProtocolClient: vi.fn(),
  whenReady: vi.fn(),
} as unknown as ElectronApp;

let whenReady: PromiseWithResolvers<void>;

let originalExecPath: string;
let originalProcessArgv: string[];

let client: DefaultProtocolClient;
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(product).urlProtocol = 'test-protocol';

  originalExecPath = process.execPath;
  originalProcessArgv = process.argv;
  process.execPath = '/foo/bar';
  process.argv = ['foo', 'bar'];

  // mock import.meta.env.PROD env
  vi.stubEnv('PROD', true);

  whenReady = Promise.withResolvers<void>();
  vi.mocked(ELECTRON_APP_MOCK.whenReady).mockReturnValue(whenReady.promise);

  client = new DefaultProtocolClient(ELECTRON_APP_MOCK);
  client.init();
});

afterEach(() => {
  process.execPath = originalExecPath;
  process.argv = originalProcessArgv;
});

test('ElectronApp#setAsDefaultProtocolClient should not have been called before application is ready', async () => {
  expect(ELECTRON_APP_MOCK.setAsDefaultProtocolClient).not.toHaveBeenCalled();
});

test('ElectronApp#setAsDefaultProtocolClient should be called when application is ready', async () => {
  whenReady.resolve();
  await vi.waitFor(() => expect(ELECTRON_APP_MOCK.setAsDefaultProtocolClient).toHaveBeenCalled());

  expect(ELECTRON_APP_MOCK.setAsDefaultProtocolClient).toHaveBeenCalledOnce();
  expect(ELECTRON_APP_MOCK.setAsDefaultProtocolClient).toHaveBeenCalledWith('test-protocol');
});

test('on windows ElectronApp#setAsDefaultProtocolClient should be called with process args', async () => {
  vi.mocked(isWindows).mockReturnValue(true);

  whenReady.resolve();
  await vi.waitFor(() => expect(ELECTRON_APP_MOCK.setAsDefaultProtocolClient).toHaveBeenCalled());

  expect(ELECTRON_APP_MOCK.setAsDefaultProtocolClient).toHaveBeenCalledOnce();
  expect(ELECTRON_APP_MOCK.setAsDefaultProtocolClient).toHaveBeenCalledWith('test-protocol', '/foo/bar', [
    'foo',
    'bar',
  ]);
});
