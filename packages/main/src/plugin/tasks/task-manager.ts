/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type { Task } from '@podman-desktop/api';

import { TaskImpl } from '/@/plugin/tasks/task-impl.js';
import type { TaskInfo } from '/@api/taskInfo.js';

import type { ApiSenderType } from '../api.js';
import type { CommandRegistry } from '../command-registry.js';
import type { StatusBarRegistry } from '../statusbar/statusbar-registry.js';

export class TaskManager {
  private taskId = 0;

  private tasks = new Map<string, TaskImpl>();

  constructor(
    private apiSender: ApiSenderType,
    private statusBarRegistry: StatusBarRegistry,
    private commandRegistry: CommandRegistry,
  ) {}

  public init(): void {
    // The TaskManager is responsible for creating the entry he will be using
    this.setStatusBarEntry(false);

    this.commandRegistry.registerCommand('show-task-manager', () => {
      this.apiSender.send('toggle-task-manager', '');
      this.setStatusBarEntry(false);
    });
  }

  private setStatusBarEntry(highlight: boolean): void {
    this.statusBarRegistry.setEntry(
      'tasks',
      false,
      0,
      undefined,
      'Tasks',
      'fa fa-bell',
      true,
      'show-task-manager',
      undefined,
      highlight,
    );
  }

  public createTask(title: string | undefined): Task {
    this.taskId++;

    const task = new TaskImpl(`main-${this.taskId}`, title ? title : `Task ${this.taskId}`);
    this.tasks.set(task.id, task);

    task.onUpdate(this.updateTask.bind(this));

    // notify renderer
    this.apiSender.send('task-created', this.toTaskInfo(task));
    this.setStatusBarEntry(true);
    return task;
  }

  public clearTasks(): void {
    Array.from(this.tasks.values()).forEach(task => {
      if (task.state !== 'loading') {
        this.removeTask(task);
      }
    });
  }

  /**
   * Utility method to serialize a Task (extension&main) to a TaskInfo (renderer)
   * @param task
   * @protected
   */
  protected toTaskInfo(task: Task): TaskInfo {
    return {
      id: task.id,
      name: task.name,
      started: task.started,
      state: task.state,
      error: task.error,
      action: task.action?.name,
    };
  }

  protected removeTask(task: Task): void {
    const taskImpl = this.tasks.get(task.id);
    if (taskImpl) {
      this.tasks.delete(task.id);
      taskImpl.dispose();
    }
    this.apiSender.send('task-removed', this.toTaskInfo(task));
  }

  protected updateTask(task: Task): void {
    this.apiSender.send('task-updated', this.toTaskInfo(task));
  }
}
