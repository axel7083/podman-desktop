/*********************************************************************
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
 ********************************************************************/

import type { ExtensionContext, TelemetryLogger } from '@podman-desktop/api';
import { env } from '@podman-desktop/api';
import type { Container as InversifyContainer } from 'inversify';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { PodmanCleanupMacOS } from '/@/cleanup/podman-cleanup-macos';
import { PodmanCleanupWindows } from '/@/cleanup/podman-cleanup-windows';
import { Installer } from '/@/installer/installer';
import { MacOSInstaller } from '/@/installer/mac-os-installer';
import { WinInstaller } from '/@/installer/win-installer';

import { InversifyBinding } from './inversify-binding';
import { ExtensionContextSymbol, ProviderCleanupSymbol, TelemetryLoggerSymbol } from './symbols';

vi.mock(import('/@/installer/win-installer'));
vi.mock(import('/@/installer/mac-os-installer'));
vi.mock(import('/@/cleanup/podman-cleanup-macos'));
vi.mock(import('/@/cleanup/podman-cleanup-windows'));

const extensionContextMock = {} as ExtensionContext;
const telemetryLoggerMock = {} as TelemetryLogger;

vi.mock('@podman-desktop/api', () => {
  return {
    env: {
      isWindows: false,
      isMac: true,
      isLinux: false,
    },
  };
});

describe('inversifyBinding', () => {
  let inversifyBinding: InversifyBinding;

  beforeEach(() => {
    vi.resetAllMocks();
    inversifyBinding = new InversifyBinding(extensionContextMock, telemetryLoggerMock);

    vi.mocked(env).isWindows = false;
    vi.mocked(env).isMac = false;
    vi.mocked(env).isLinux = false;
  });

  test('should initialize bindings correctly', async () => {
    // Initialize bindings
    const container: InversifyContainer = await inversifyBinding.init();

    expect(container.get(ExtensionContextSymbol)).toBe(extensionContextMock);
    expect(container.get(TelemetryLoggerSymbol)).toBe(telemetryLoggerMock);
  });

  describe('windows', () => {
    let container: InversifyContainer;
    beforeEach(async () => {
      vi.mocked(env).isWindows = true;
      container = await inversifyBinding.init();
    });

    test('InversifyBinding#init should bind WinInstaller for Installer', async () => {
      const value = container.get(Installer);
      expect(value).not.toBeUndefined();

      expect(WinInstaller).toHaveBeenCalledOnce();
      expect(MacOSInstaller).not.toHaveBeenCalled();
    });

    test('InversifyBinding#init should bind PodmanCleanupWindows for ProviderCleanupSymbol', async () => {
      const value = container.get(ProviderCleanupSymbol);
      expect(value).not.toBeUndefined();

      expect(PodmanCleanupWindows).toHaveBeenCalledOnce();
      expect(PodmanCleanupMacOS).not.toHaveBeenCalled();
    });
  });

  describe('macos', () => {
    let container: InversifyContainer;
    beforeEach(async () => {
      vi.mocked(env).isMac = true;
      container = await inversifyBinding.init();
    });

    test('InversifyBinding#init should bind MacOSInstaller for Installer', async () => {
      const value = container.get(Installer);
      expect(value).not.toBeUndefined();

      expect(WinInstaller).not.toHaveBeenCalled();
      expect(MacOSInstaller).toHaveBeenCalled();
    });

    test('InversifyBinding#init should bind PodmanCleanupMacOS for ProviderCleanupSymbol', async () => {
      const value = container.get(ProviderCleanupSymbol);
      expect(value).not.toBeUndefined();

      expect(PodmanCleanupMacOS).toHaveBeenCalledOnce();
      expect(PodmanCleanupWindows).not.toHaveBeenCalled();
    });
  });

  describe('linux', () => {
    let container: InversifyContainer;
    beforeEach(async () => {
      vi.mocked(env).isLinux = true;
      container = await inversifyBinding.init();
    });

    test('InversifyBinding#init should not provide any binding for Installer', async () => {
      expect(() => {
        container.get(Installer);
      }).toThrowError('No bindings found for service: "Symbol(Installer)"');

      expect(WinInstaller).not.toHaveBeenCalled();
      expect(MacOSInstaller).not.toHaveBeenCalled();
    });

    test('InversifyBinding#init should not provide any binding for ProviderCleanupSymbol', async () => {
      expect(() => {
        container.get(ProviderCleanupSymbol);
      }).toThrowError('No bindings found for service: "Symbol(ProviderCleanup)"');

      expect(PodmanCleanupMacOS).not.toHaveBeenCalled();
      expect(PodmanCleanupWindows).not.toHaveBeenCalled();
    });
  });
});
