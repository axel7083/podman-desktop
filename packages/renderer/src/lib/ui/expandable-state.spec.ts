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

import { render, waitFor } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import { client } from '/@/client';
import { onDidChangeConfiguration } from '/@/stores/configurationProperties';

import ExpandableStateTest from './ExpandableStateTest.svelte';

const CONFIG_KEY = 'test.expanded';

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(client.configuration.getValue).mockResolvedValue(true);
  vi.mocked(client.configuration.updateValue).mockResolvedValue(undefined);
});

test('initialized defaults to false and becomes true after mount', async () => {
  const { getByTestId } = render(ExpandableStateTest, { configKey: CONFIG_KEY });

  await waitFor(() => expect(getByTestId('initialized')).toHaveTextContent('true'));
});

test.each([
  { configValue: undefined, expected: 'true', description: 'defaults to true when no config value is set' },
  { configValue: false, expected: 'false', description: 'reflects false from getValue' },
  { configValue: true, expected: 'true', description: 'reflects true from getValue' },
])('expanded $description', async ({ configValue, expected }) => {
  vi.mocked(client.configuration.getValue).mockResolvedValue(configValue);

  const { getByTestId } = render(ExpandableStateTest, { configKey: CONFIG_KEY });

  await waitFor(() => expect(getByTestId('initialized')).toHaveTextContent('true'));
  expect(getByTestId('expanded')).toHaveTextContent(expected);
});

test('getValue is called with the correct key on mount', async () => {
  render(ExpandableStateTest, { configKey: CONFIG_KEY });

  await waitFor(() => expect(client.configuration.getValue).toHaveBeenCalledWith({ key: CONFIG_KEY }));
});

test('toggle calls updateValue with correct key and value', async () => {
  const { getByRole } = render(ExpandableStateTest, { configKey: CONFIG_KEY });

  await waitFor(() => expect(client.configuration.getValue).toHaveBeenCalled());

  const button = getByRole('button', { name: 'toggle' });
  button.click();

  await waitFor(() => expect(client.configuration.updateValue).toHaveBeenCalledWith({ key: CONFIG_KEY, value: false }));
});

test.each([
  {
    description: 'updates when configuration change event is fired',
    event: new CustomEvent(CONFIG_KEY, { detail: { key: CONFIG_KEY, value: false } }),
    expected: 'false',
  },
  {
    description: 'does not change when event has no detail property',
    event: new Event(CONFIG_KEY),
    expected: 'true',
  },
  {
    description: 'does not change when event key does not match',
    event: new CustomEvent(CONFIG_KEY, { detail: { key: 'other.key', value: false } }),
    expected: 'true',
  },
])('expanded state $description', async ({ event, expected }) => {
  vi.mocked(client.configuration.getValue).mockResolvedValue(true);

  const { getByTestId } = render(ExpandableStateTest, { configKey: CONFIG_KEY });

  await waitFor(() => expect(getByTestId('expanded')).toHaveTextContent('true'));

  onDidChangeConfiguration.dispatchEvent(event);

  await waitFor(() => expect(getByTestId('expanded')).toHaveTextContent(expected));
});

test('event listener is removed on destroy', async () => {
  const removeEventListenerSpy = vi.spyOn(onDidChangeConfiguration, 'removeEventListener');

  const { unmount } = render(ExpandableStateTest, { configKey: CONFIG_KEY });

  await waitFor(() => expect(client.configuration.getValue).toHaveBeenCalled());

  unmount();

  expect(removeEventListenerSpy).toHaveBeenCalledWith(CONFIG_KEY, expect.any(Function));
});
