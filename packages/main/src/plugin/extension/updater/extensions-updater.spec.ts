/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import type { ExtensionInfo } from '@podman-desktop/core-api';
import type { CatalogExtension } from '@podman-desktop/core-api/extension-catalog';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { ExtensionsCatalog } from '/@/plugin/extension/catalog/extensions-catalog.js';
import type { ExtensionInstaller } from '/@/plugin/extension/extension-installer.js';
import type { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';

import { ExtensionsUpdater } from './extensions-updater.js';

let extensionsUpdater: ExtensionsUpdater;

const catalogExtension1: CatalogExtension = {
  id: 'foo.extension1',
  publisherName: 'foo',
  extensionName: 'extension1',
  displayName: 'My Extension 1',
  publisherDisplayName: 'Foo publisher display name',
  shortDescription: 'Foo extension short description',
  categories: ['Kubernetes'],
  keywords: [],
  unlisted: false,
  versions: [
    {
      version: '2.0.0',
      preview: false,
      ociUri: 'oci-registry.foo/foo/bar1',
      files: [],
      lastUpdated: new Date(),
    },
  ],
};

const catalogExtension2: CatalogExtension = {
  id: 'foo.extension2',
  publisherName: 'foo',
  extensionName: 'extension2',
  displayName: 'My Extension 2',
  publisherDisplayName: 'Foo publisher display name',
  shortDescription: 'Foo extension short description',
  categories: [],
  keywords: [],
  unlisted: false,
  versions: [
    {
      version: '4.0.0',
      preview: false,
      ociUri: 'oci-registry.foo/foo/bar2',
      files: [],
      lastUpdated: new Date(),
    },
  ],
};

const extensionsCatalogGetExtensionsMock = vi.fn();
const extensionsCatalog = {
  getExtensions: extensionsCatalogGetExtensionsMock,
} as unknown as ExtensionsCatalog;

const extensionLoaderListExtensionsMock = vi.fn();
const extensionLoaderSetExtensionsUpdatesMock = vi.fn();
const extensionLoader = {
  listExtensions: extensionLoaderListExtensionsMock,
  setExtensionsUpdates: extensionLoaderSetExtensionsUpdatesMock,
  removeExtension: vi.fn(),
  onDidChange: vi.fn(),
} as unknown as ExtensionLoader;

const getConfigMock = vi.fn();
const getConfigurationMock = vi.fn();
getConfigurationMock.mockReturnValue({
  get: getConfigMock,
});
const configurationRegistry = {
  registerConfigurations: vi.fn(),
  onDidChangeConfiguration: vi.fn(),
  getConfiguration: getConfigurationMock,
} as unknown as ConfigurationRegistry;

const extensionInstaller = {
  installFromImage: vi.fn(),
} as unknown as ExtensionInstaller;

const telemetry = {
  track: vi.fn().mockImplementation(async () => {
    // do nothing
  }),
} as unknown as Telemetry;

const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
  extensionsUpdater = new ExtensionsUpdater(
    extensionsCatalog,
    extensionLoader,
    configurationRegistry,
    extensionInstaller,
    telemetry,
  );
  vi.clearAllMocks();
});

afterEach(() => {
  console.error = originalConsoleError;
});

test('should check for updates and try to update one extension automatically', async () => {
  const installedExtension1: ExtensionInfo = {
    id: 'foo.extension1',
    version: '1.0.0',
    removable: true,
  } as ExtensionInfo;

  extensionsCatalogGetExtensionsMock.mockResolvedValue([catalogExtension1, catalogExtension2]);
  extensionLoaderListExtensionsMock.mockResolvedValue([installedExtension1]);

  // return true for the config check
  getConfigMock.mockReturnValue(true);

  const spyUpdateExtension = vi.spyOn(extensionsUpdater, 'updateExtension');

  await extensionsUpdater.init();

  // no error
  expect(console.error).not.toBeCalled();

  // check we had updates
  expect(spyUpdateExtension).toBeCalled();

  // check setExtensionsUpdates is called
  expect(extensionLoaderSetExtensionsUpdatesMock).toBeCalledWith([
    { id: 'foo.extension1', ociUri: 'oci-registry.foo/foo/bar1', version: '2.0.0' },
  ]);

  expect(extensionInstaller.installFromImage).toBeCalledWith(
    expect.anything(),
    expect.anything(),
    expect.anything(),
    'oci-registry.foo/foo/bar1',
    undefined,
    undefined,
    { confirm: false },
  );

  expect(extensionLoader.removeExtension).toBeCalledWith('foo.extension1');

  // telemetry is called
  expect(telemetry.track).toBeCalled();
});

test('should flag updates again, without applying them, when the installed extensions change', async () => {
  vi.useFakeTimers();
  try {
    extensionsCatalogGetExtensionsMock.mockResolvedValue([catalogExtension1, catalogExtension2]);
    // no update at startup
    extensionLoaderListExtensionsMock.mockResolvedValue([]);
    getConfigMock.mockReturnValue(true);

    await extensionsUpdater.init();
    const onDidChangeListener = vi.mocked(extensionLoader.onDidChange).mock.calls[0]?.[0];
    expect(onDidChangeListener).toBeDefined();

    // e.g. the extension is restarted, analyzed again without update information
    extensionLoaderListExtensionsMock.mockResolvedValue([
      { id: 'foo.extension1', version: '1.0.0', removable: true } as ExtensionInfo,
    ]);
    onDidChangeListener?.();
    // changes are grouped
    onDidChangeListener?.();
    await vi.advanceTimersByTimeAsync(ExtensionsUpdater.FLAG_UPDATES_DELAY);

    expect(extensionLoaderSetExtensionsUpdatesMock).toHaveBeenCalledOnce();
    expect(extensionLoaderSetExtensionsUpdatesMock).toBeCalledWith([
      { id: 'foo.extension1', ociUri: 'oci-registry.foo/foo/bar1', version: '2.0.0' },
    ]);
    // auto update is enabled, but updates are applied by the periodic check only
    expect(extensionInstaller.installFromImage).not.toBeCalled();
  } finally {
    await extensionsUpdater.stop();
    vi.useRealTimers();
  }
});

test('should flag a pinned extension as updatable without updating it automatically', async () => {
  const installedExtension1: ExtensionInfo = {
    id: 'foo.extension1',
    version: '1.0.0',
    removable: true,
    pinned: true,
  } as ExtensionInfo;

  extensionsCatalogGetExtensionsMock.mockResolvedValue([catalogExtension1, catalogExtension2]);
  extensionLoaderListExtensionsMock.mockResolvedValue([installedExtension1]);

  // auto update is enabled
  getConfigMock.mockReturnValue(true);

  const spyUpdateExtension = vi.spyOn(extensionsUpdater, 'updateExtension');

  await extensionsUpdater.doCheckForUpdates();

  expect(extensionLoaderSetExtensionsUpdatesMock).toBeCalledWith([
    { id: 'foo.extension1', ociUri: 'oci-registry.foo/foo/bar1', version: '2.0.0' },
  ]);
  expect(spyUpdateExtension).not.toBeCalled();
  expect(extensionInstaller.installFromImage).not.toBeCalled();
});

test('should update a bundled extension by overriding it, without removing it', async () => {
  const bundledExtension1: ExtensionInfo = {
    id: 'foo.extension1',
    version: '1.0.0',
    removable: false,
    bundled: true,
  } as ExtensionInfo;

  extensionsCatalogGetExtensionsMock.mockResolvedValue([catalogExtension1, catalogExtension2]);
  extensionLoaderListExtensionsMock.mockResolvedValue([bundledExtension1]);

  // auto update is enabled
  getConfigMock.mockReturnValue(true);

  await extensionsUpdater.doCheckForUpdates();

  expect(extensionLoaderSetExtensionsUpdatesMock).toBeCalledWith([
    { id: 'foo.extension1', ociUri: 'oci-registry.foo/foo/bar1', version: '2.0.0' },
  ]);
  // a bundled extension cannot be removed, the new version overrides it without confirmation
  expect(extensionLoader.removeExtension).not.toBeCalled();
  expect(extensionInstaller.installFromImage).toBeCalledWith(
    expect.anything(),
    expect.anything(),
    expect.anything(),
    'oci-registry.foo/foo/bar1',
    undefined,
    undefined,
    { confirm: false },
  );
});

test('should not update an extension in development mode', async () => {
  const devExtension1: ExtensionInfo = {
    id: 'foo.extension1',
    version: '1.0.0',
    removable: false,
    bundled: false,
    devMode: true,
  } as ExtensionInfo;

  extensionsCatalogGetExtensionsMock.mockResolvedValue([catalogExtension1, catalogExtension2]);
  extensionLoaderListExtensionsMock.mockResolvedValue([devExtension1]);
  getConfigMock.mockReturnValue(true);

  await extensionsUpdater.doCheckForUpdates();

  expect(extensionLoaderSetExtensionsUpdatesMock).not.toBeCalled();
  expect(extensionInstaller.installFromImage).not.toBeCalled();
});
