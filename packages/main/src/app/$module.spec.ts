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

import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { Container } from 'inversify';
import { afterEach, expect, test, vi } from 'vitest';

import { ApiSender } from '/@/app/api-sender.js';
import { AppIdentity } from '/@/app/app-identity.js';
import { DefaultProtocolClient } from '/@/app/default-protocol-client.js';
import { SecurityRestrictions } from '/@/app/security-restrictions.js';
import { ElectronApp, StartupSymbol } from '/@/inject/symbol.js';

import { module } from './$module.js';

afterEach(() => {
  vi.unstubAllEnvs();
});

test('should bind the api sender as the ApiSenderType singleton', () => {
  const container = new Container();
  container.load(module);

  expect(container.get(ApiSenderType)).toBe(container.get(ApiSender));
});

test('should instantiate the startup services', () => {
  vi.stubEnv('DEV', false);
  const app = { on: vi.fn(), whenReady: vi.fn().mockReturnValue(new Promise(() => {})) } as unknown as Electron.App;
  const container = new Container();
  container.bind(ElectronApp).toConstantValue(app);
  container.load(module);

  const startupServices = container.getAll(StartupSymbol);

  expect(startupServices).toEqual([expect.any(SecurityRestrictions), expect.any(DefaultProtocolClient)]);
  expect(app.on).toHaveBeenCalledWith('web-contents-created', expect.any(Function));
  expect(app.whenReady).toHaveBeenCalled();
});

test('should add the app identity as a startup service in development', () => {
  vi.stubEnv('DEV', true);
  const app = {
    on: vi.fn(),
    whenReady: vi.fn().mockReturnValue(new Promise(() => {})),
    getAppPath: vi.fn().mockReturnValue('/app'),
    setPath: vi.fn(),
  } as unknown as Electron.App;
  const container = new Container();
  container.bind(ElectronApp).toConstantValue(app);
  container.load(module);

  const startupServices = container.getAll(StartupSymbol);

  expect(startupServices).toContainEqual(expect.any(AppIdentity));
  expect(app.setPath).toHaveBeenCalledWith('userData', expect.stringContaining('.electron-user-data'));
});
