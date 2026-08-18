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

import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import { client } from '/@/client';

import SystemOverview from './SystemOverview.svelte';

vi.mock(import('/@/lib/dashboard/SystemOverviewContent.svelte'));
vi.mock(import('svelte/transition'));

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(client.configuration.getValue).mockResolvedValue(true);
  vi.mocked(client.configuration.updateValue).mockResolvedValue(undefined);
});

test('should render System Overview title', async () => {
  render(SystemOverview);

  await waitFor(() => expect(screen.getByText('System Overview')).toBeInTheDocument());
});

test('should call getValue for system overview expanded state on mount', async () => {
  render(SystemOverview);

  await waitFor(() => expect(client.configuration.getValue).toHaveBeenCalled());
  await waitFor(() => expect(client.configuration.getValue).toHaveBeenCalledWith({ key: 'systemOverview.expanded' }));
});

test('should call updateValue when toggle is triggered', async () => {
  render(SystemOverview);

  const expandButton = await waitFor(() => screen.getByRole('button', { name: 'System Overview' }));
  await fireEvent.click(expandButton);

  await waitFor(() => expect(client.configuration.updateValue).toHaveBeenCalled());
  await waitFor(() =>
    expect(client.configuration.updateValue).toHaveBeenCalledWith({ key: 'systemOverview.expanded', value: false }),
  );
});

test('should track dashboard.healthCard.collapsed telemetry when collapsing', async () => {
  render(SystemOverview);

  const expandButton = await waitFor(() => screen.getByRole('button', { name: 'System Overview' }));
  await fireEvent.click(expandButton);

  await waitFor(() => expect(client.telemetry.track).toHaveBeenCalledWith({ event: 'dashboard.healthCard.collapsed' }));
});

test('should track dashboard.healthCard.expanded telemetry when expanding', async () => {
  vi.mocked(client.configuration.getValue).mockResolvedValue(false);
  render(SystemOverview);

  const expandButton = await waitFor(() => screen.getByRole('button', { name: 'System Overview' }));
  await fireEvent.click(expandButton);

  await waitFor(() => expect(client.telemetry.track).toHaveBeenCalledWith({ event: 'dashboard.healthCard.expanded' }));
});
