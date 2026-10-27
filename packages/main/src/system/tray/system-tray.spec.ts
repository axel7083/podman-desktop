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

import type { IConfigurationRegistry } from '@desktop-framework/api/configuration';
import type { Configuration } from '@desktop-framework/extension-api';
import { app, Tray } from 'electron';
import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

import { isMac } from '/@/util.js';

import { SystemTray } from './system-tray.js';
import { AnimatedDevTray } from './tray-animate-dev-icon.js';
import { AnimatedTray } from './tray-animate-icon.js';

vi.mock(import('./tray-animate-dev-icon.js'));
vi.mock(import('./tray-animate-icon.js'));
vi.mock(import('/@/util.js'));

let preferences: Record<string, unknown>;
let systemTray: SystemTray;

beforeEach(() => {
  vi.resetAllMocks();
  preferences = {};
  const configurationRegistry: Partial<IConfigurationRegistry> = {
    getConfiguration: vi.fn().mockReturnValue({
      get: vi.fn((key: string) => preferences[key]),
    } as Partial<Configuration>),
  };
  systemTray = new SystemTray(configurationRegistry as IConfigurationRegistry);
});

test('should create the tray icon when it is not disabled', () => {
  systemTray.init();

  expect(systemTray.tray).toBeInstanceOf(Tray);
  const animatedTray = systemTray.animatedTray;
  expect(animatedTray).toBeInstanceOf(import.meta.env.DEV ? AnimatedDevTray : AnimatedTray);
  expect(animatedTray?.setTray).toHaveBeenCalledWith(systemTray.tray);
});

test('should not create the tray icon when preferences.ShowTrayIcon is false', () => {
  preferences['ShowTrayIcon'] = false;

  systemTray.init();

  expect(systemTray.tray).toBeUndefined();
  expect(systemTray.animatedTray).toBeUndefined();
  expect(app.on).not.toHaveBeenCalled();
});

describe('preferences.TrayIconColor', () => {
  beforeEach(() => {
    preferences['TrayIconColor'] = 'dark';
  });

  test('should be applied on Windows and Linux', () => {
    vi.mocked(isMac).mockReturnValue(false);

    systemTray.init();

    expect(systemTray.animatedTray?.setColor).toHaveBeenCalledWith('dark');
  });

  test('should be ignored on macOS', () => {
    vi.mocked(isMac).mockReturnValue(true);

    systemTray.init();

    expect(systemTray.animatedTray?.setColor).not.toHaveBeenCalled();
  });
});

test('should release the tray icon when the application quits', () => {
  systemTray.init();
  const tray = systemTray.tray;
  assert(tray);
  tray.destroy = vi.fn();
  const willQuit = vi.mocked(app.on).mock.calls.find(([event]) => String(event) === 'will-quit')?.[1] as
    | (() => void)
    | undefined;
  assert(willQuit);

  willQuit();

  expect(systemTray.animatedTray?.dispose).toHaveBeenCalled();
  expect(tray.destroy).toHaveBeenCalled();
});
