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

import ExtensionUpdateButton from './ExtensionUpdateButton.svelte';

beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(window, 'updateExtension', { value: vi.fn(), configurable: true });
});

test('Expect no button when no update is available', () => {
  render(ExtensionUpdateButton, { extension: { id: 'foo.bar' } });

  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

test('Expect the button to update the extension to the available version', async () => {
  vi.mocked(window.updateExtension).mockResolvedValue(undefined);
  render(ExtensionUpdateButton, {
    extension: { id: 'foo.bar', update: { version: '2.0.0', ociUri: 'quay.io/foo/bar:2.0.0' } },
  });

  const button = screen.getByRole('button', { name: 'Update foo.bar to v2.0.0' });
  expect(button).toHaveTextContent('Update to v2.0.0');

  await fireEvent.click(button);

  expect(window.updateExtension).toHaveBeenCalledWith('foo.bar', 'quay.io/foo/bar:2.0.0');
});
