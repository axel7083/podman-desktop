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
import { beforeEach, expect, test, vi } from 'vitest';

import { client } from '/@/client';
import type { TaskInfoUI } from '/@/stores/tasks';

import TaskManagerActionsCancel from './TaskManagerActionsCancel.svelte';

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(client.configuration.getValue).mockResolvedValue({});
});

const completedTask: TaskInfoUI = {
  id: '1',
  name: 'Completed Task 1',
  state: 'completed',
  status: 'success',
  action: 'dummy',
  cancellable: false,
} as unknown as TaskInfoUI;

const inProgressCancellableTask: TaskInfoUI = {
  id: '1',
  name: 'In progress',
  state: 'running',
  status: 'in-progress',
  cancellable: true,
  cancellationTokenSourceId: '1234',
} as unknown as TaskInfoUI;

test('Expect cancellable action being displayed if cancellable', async () => {
  // return Yes for the confirmation
  vi.mocked(client.dialog.showMessageBox).mockResolvedValue({ response: 'Cancel Task' });

  render(TaskManagerActionsCancel, { task: inProgressCancellableTask });
  const cancelButton = screen.getByRole('button', { name: 'Cancel task' });
  expect(cancelButton).toBeInTheDocument();

  // click on the button
  await fireEvent.click(cancelButton);

  // expect the client.dialog.showMessageBox to be called
  expect(client.dialog.showMessageBox).toHaveBeenCalled();

  // expect the window.cancelToken to be called
  expect(window.cancelToken).toHaveBeenCalledWith('1234');
});

test('Expect cancellable action not being displayed if not cancellable', async () => {
  render(TaskManagerActionsCancel, { task: completedTask });
  const cancelButton = screen.getByRole('button', { name: 'Cancel task' });
  expect(cancelButton).toBeInTheDocument();
  // expect the button is hidden
  expect(cancelButton).toHaveClass('hidden');
});
