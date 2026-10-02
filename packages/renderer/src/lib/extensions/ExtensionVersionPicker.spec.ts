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

import '@testing-library/jest-dom/vitest';

import type { CatalogExtension } from '@podman-desktop/core-api/extension-catalog';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import ExtensionVersionPicker from './ExtensionVersionPicker.svelte';

const versions: CatalogExtension['versions'] = [
  { version: '3.0.0-next', preview: true, ociUri: 'quay.io/foo/bar:next', files: [], lastUpdated: new Date() },
  { version: '2.0.0', preview: false, ociUri: 'quay.io/foo/bar:2.0.0', files: [], lastUpdated: new Date() },
  { version: '1.0.0', preview: false, ociUri: 'quay.io/foo/bar:1.0.0', files: [], lastUpdated: new Date() },
];

beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(window, 'updateExtension', { value: vi.fn(), configurable: true });
  Object.defineProperty(window, 'extensionInstallFromImage', { value: vi.fn(), configurable: true });
  Object.defineProperty(window, 'setExtensionPinned', { value: vi.fn(), configurable: true });
  Object.defineProperty(window, 'removeExtension', { value: vi.fn(), configurable: true });
});

async function selectVersion(label: string): Promise<void> {
  await fireEvent.click(screen.getByLabelText('Version').querySelector('button') as HTMLButtonElement);
  await fireEvent.click(screen.getByRole('button', { name: label }));
}

test('Expect the latest non preview version to be selected by default', () => {
  render(ExtensionVersionPicker, { extensionId: 'foo.bar', versions });

  screen.getByRole('button', { name: 'v2.0.0' });
  screen.getByRole('button', { name: 'Install v2.0.0' });
});

test('Expect the installed version to be selected by default without install button', () => {
  const installedExtension = { id: 'foo.bar', version: '1.0.0', removable: true } as CombinedExtensionInfoUI;
  render(ExtensionVersionPicker, { extensionId: 'foo.bar', versions, installedExtension });

  screen.getByRole('button', { name: 'v1.0.0 (installed)' });
  expect(screen.queryByRole('button', { name: /^Install/ })).not.toBeInTheDocument();
  // no empty error block taking space
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('Expect installing the latest version of a bundled extension to override it without pinning', async () => {
  vi.mocked(window.extensionInstallFromImage).mockResolvedValue(undefined);
  const installedExtension = {
    id: 'foo.bar',
    version: '0.1.0',
    removable: false,
    bundled: true,
  } as CombinedExtensionInfoUI;
  render(ExtensionVersionPicker, { extensionId: 'foo.bar', versions, installedExtension });

  // the installed bundled version is listed and selected by default
  screen.getByRole('button', { name: 'v0.1.0 (bundled)' });
  await selectVersion('v2.0.0');
  await fireEvent.click(screen.getByRole('button', { name: 'Install v2.0.0' }));

  await vi.waitFor(() =>
    expect(window.extensionInstallFromImage).toHaveBeenCalledWith(
      'quay.io/foo/bar:2.0.0',
      expect.any(Function),
      expect.any(Function),
      'foo.bar',
    ),
  );
  expect(window.updateExtension).not.toHaveBeenCalled();
  expect(window.setExtensionPinned).not.toHaveBeenCalled();
});

test('Expect downgrading an installed extension to update it and pin it', async () => {
  vi.mocked(window.updateExtension).mockResolvedValue(undefined);
  const installedExtension = { id: 'foo.bar', version: '2.0.0', removable: true } as CombinedExtensionInfoUI;
  render(ExtensionVersionPicker, { extensionId: 'foo.bar', versions, installedExtension });

  await selectVersion('v1.0.0');
  await fireEvent.click(screen.getByRole('button', { name: 'Install v1.0.0' }));

  await vi.waitFor(() => expect(window.setExtensionPinned).toHaveBeenCalledWith('foo.bar', true));
  expect(window.updateExtension).toHaveBeenCalledWith('foo.bar', 'quay.io/foo/bar:1.0.0');
});

test('Expect preview versions to be flagged and installable', async () => {
  vi.mocked(window.extensionInstallFromImage).mockResolvedValue(undefined);
  render(ExtensionVersionPicker, { extensionId: 'foo.bar', versions });

  await selectVersion('v3.0.0-next (preview)');
  await fireEvent.click(screen.getByRole('button', { name: 'Install v3.0.0-next' }));

  await vi.waitFor(() => expect(window.setExtensionPinned).toHaveBeenCalledWith('foo.bar', true));
});

test('Expect an installation error to be displayed', async () => {
  vi.mocked(window.extensionInstallFromImage).mockImplementation(async (_image, _log, error) => {
    error('Installation of foo.bar cancelled.');
    return new Promise(() => {});
  });
  render(ExtensionVersionPicker, { extensionId: 'foo.bar', versions });

  await fireEvent.click(screen.getByRole('button', { name: 'Install v2.0.0' }));

  const alert = await screen.findByRole('alert', { name: 'Error Message Content' });
  expect(alert).toHaveTextContent('Installation of foo.bar cancelled.');
  expect(window.setExtensionPinned).not.toHaveBeenCalled();
});

test('Expect the bundled version to be proposed to restore the bundled extension', async () => {
  vi.mocked(window.removeExtension).mockResolvedValue(undefined);
  const installedExtension = {
    id: 'foo.bar',
    version: '2.0.0',
    removable: true,
    bundled: false,
    overrides: { id: 'foo.bar', version: '0.1.0' },
  } as CombinedExtensionInfoUI;
  render(ExtensionVersionPicker, { extensionId: 'foo.bar', versions, installedExtension });

  await selectVersion('v0.1.0 (bundled)');
  await fireEvent.click(screen.getByRole('button', { name: 'Restore bundled v0.1.0' }));

  await vi.waitFor(() => expect(window.removeExtension).toHaveBeenCalledWith('foo.bar'));
  expect(window.updateExtension).not.toHaveBeenCalled();
  expect(window.extensionInstallFromImage).not.toHaveBeenCalled();
});

test('Expect a bundled version published in the catalog to be flagged as bundled', async () => {
  const installedExtension = {
    id: 'foo.bar',
    version: '2.0.0',
    removable: true,
    bundled: false,
    overrides: { id: 'foo.bar', version: '1.0.0' },
  } as CombinedExtensionInfoUI;
  render(ExtensionVersionPicker, { extensionId: 'foo.bar', versions, installedExtension });

  await fireEvent.click(screen.getByRole('button', { name: 'v2.0.0 (installed)' }));

  // listed once, flagged as bundled
  screen.getByRole('button', { name: 'v1.0.0 (bundled)' });
  expect(screen.queryByRole('button', { name: 'v1.0.0' })).not.toBeInTheDocument();
});
