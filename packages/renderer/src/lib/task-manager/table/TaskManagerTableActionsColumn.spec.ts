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

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import type { TaskInfoUI } from '/@/stores/tasks';

import TaskManagerTableActionsColumn from './TaskManagerTableActionsColumn.svelte';

const completedTask: TaskInfoUI = {
  id: '1',
  name: 'Completed Task 1',
  state: 'completed',
  status: 'success',
  action: 'dummy',
} as unknown as TaskInfoUI;

const inProgressCancellableTask: TaskInfoUI = {
  id: '1',
  name: 'In progress',
  state: 'running',
  status: 'in-progress',
  cancellable: true,
} as unknown as TaskInfoUI;

test('Expect view action being displayed', async () => {
  render(TaskManagerTableActionsColumn, { object: completedTask });
  const viewButton = screen.getByRole('button', { name: 'View action' });
  expect(viewButton).toBeInTheDocument();
});

test('Expect cancellable action being displayed', async () => {
  render(TaskManagerTableActionsColumn, { object: inProgressCancellableTask });
  const cancelButton = screen.getByRole('button', { name: 'Cancel task' });
  expect(cancelButton).toBeInTheDocument();
});

test('Expect delete action being displayed', async () => {
  render(TaskManagerTableActionsColumn, { object: completedTask });
  const archiveButton = screen.getByRole('button', { name: 'Archive/delete completed task' });
  expect(archiveButton).toBeInTheDocument();
});