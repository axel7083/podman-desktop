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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import ExtensionRestoreBundledButton from './ExtensionRestoreBundledButton.svelte';

const overridingExtension = {
  id: 'podman-desktop.kind',
  displayName: 'Kind',
  version: '1.33.0',
  overrides: { id: 'podman-desktop.kind', version: '1.31.0' },
};

beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(window, 'removeExtension', { value: vi.fn(), configurable: true });
});

test('Expect no button for an extension not overriding a bundled one', () => {
  render(ExtensionRestoreBundledButton, { extension: { ...overridingExtension, overrides: undefined } });

  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

test('Expect the bundled extension to be restored after confirmation', async () => {
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Restore' });
  vi.mocked(window.removeExtension).mockResolvedValue(undefined);
  render(ExtensionRestoreBundledButton, { extension: overridingExtension });

  await fireEvent.click(screen.getByRole('button', { name: 'Restore bundled' }));

  await vi.waitFor(() => expect(window.removeExtension).toHaveBeenCalledWith('podman-desktop.kind'));
  expect(window.showMessageBox).toHaveBeenCalledWith({
    title: 'Restore Bundled Extension?',
    message: 'Are you sure you want to restore bundled extension podman-desktop.kind v1.31.0?',
    detail: 'Kind v1.33.0 will be uninstalled.',
    buttons: ['Restore', 'Cancel'],
    type: 'question',
  });
});

test('Expect nothing to be removed when the user cancels', async () => {
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Cancel' });
  render(ExtensionRestoreBundledButton, { extension: overridingExtension });

  await fireEvent.click(screen.getByRole('button', { name: 'Restore bundled' }));

  await vi.waitFor(() => expect(window.showMessageBox).toHaveBeenCalled());
  expect(window.removeExtension).not.toHaveBeenCalled();
});
