/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import InstalledExtensionCardLeftLifecycleDelete from './InstalledExtensionCardLeftLifecycleDelete.svelte';

beforeAll(() => {
  Object.defineProperty(window, 'ddExtensionDelete', { value: vi.fn() });
  Object.defineProperty(window, 'removeExtension', { value: vi.fn() });
  Object.defineProperty(window, 'showMessageBox', { value: vi.fn() });
});

beforeEach(() => {
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
});

afterEach(() => {
  vi.clearAllMocks();
});

test('Expect to delete dd Extension', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'dd',
    id: 'my.ExtensionId',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    devMode: false,
    bundled: false,
    version: 'v1.2.3',
    state: '',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycleDelete, { extension });

  // get button with label 'Delete Extension foo'
  const button = screen.getByRole('button', { name: 'Delete' });
  expect(button).toBeInTheDocument();

  // click the button
  await fireEvent.click(button);

  // expect the delete function to be called
  await vi.waitFor(() => expect(vi.mocked(window.ddExtensionDelete)).toHaveBeenCalledWith('my.ExtensionId'));
  expect(vi.mocked(window.removeExtension)).not.toHaveBeenCalled();
});

test('Expect to delete pd Extension', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'idExtension',
    name: 'fooName',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    devMode: false,
    bundled: false,
    version: 'v1.2.3',
    state: 'stopped',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycleDelete, { extension });

  // get button with label 'Delete Extension foo'
  const button = screen.getByRole('button', { name: 'Delete' });
  expect(button).toBeInTheDocument();

  // click the button
  await fireEvent.click(button);

  // expect the delete function to be called after confirmation
  await vi.waitFor(() => expect(vi.mocked(window.removeExtension)).toHaveBeenCalledWith('idExtension'));
  expect(window.showMessageBox).toHaveBeenCalledWith({
    title: 'Delete Extension?',
    message: 'Are you sure you want to delete extension fooName?',
    detail: undefined,
    buttons: ['Delete', 'Cancel'],
    type: 'danger',
  });
  expect(vi.mocked(window.ddExtensionDelete)).not.toHaveBeenCalled();
});

test('Expect pd Extension not to be deleted if the user cancels', async () => {
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Cancel' });
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'idExtension',
    name: 'fooName',
    description: 'my description',
    displayName: 'Foo',
    publisher: '',
    removable: true,
    devMode: false,
    bundled: false,
    version: 'v1.2.3',
    state: 'stopped',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycleDelete, { extension });

  await fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

  await vi.waitFor(() => expect(window.showMessageBox).toHaveBeenCalled());
  expect(vi.mocked(window.removeExtension)).not.toHaveBeenCalled();
});

test('Expect the confirmation to mention the bundled extension being restored', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'idExtension',
    name: 'fooName',
    description: 'my description',
    displayName: 'Foo',
    publisher: '',
    removable: true,
    devMode: false,
    bundled: false,
    overrides: { id: 'podman-desktop.foo', version: '1.0.0' },
    version: 'v1.2.3',
    state: 'stopped',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycleDelete, { extension });

  await fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

  await vi.waitFor(() =>
    expect(window.showMessageBox).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Are you sure you want to delete extension Foo?',
        detail: 'The bundled extension podman-desktop.foo will be restored.',
      }),
    ),
  );
});

test('Expect unable to delete pd Extension if not removable', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'idExtension',
    name: 'fooName',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: false,
    devMode: false,
    bundled: false,
    version: 'v1.2.3',
    state: 'stopped',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycleDelete, { extension });

  // get button with label 'Delete Extension foo'
  const button = screen.getByRole('button', { name: 'Delete' });
  expect(button).toBeInTheDocument();

  // expect to be disabled
  expect(button).toBeDisabled();
});

test('Expect able to delete pd Extension if removable', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'idExtension',
    name: 'fooName',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    devMode: false,
    bundled: false,
    version: 'v1.2.3',
    state: 'stopped',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftLifecycleDelete, { extension });

  // get button with label 'Delete Extension foo'
  const button = screen.getByRole('button', { name: 'Delete' });
  expect(button).toBeInTheDocument();

  // expect to be enabled
  expect(button).toBeEnabled();
});
