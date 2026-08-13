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
import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';
import { TaskManager } from '/@/plugin/tasks/task-manager.js';

const os = implement<typeof contracts.tasks, OrpcContext>(contracts.tasks);

@injectable()
export class TasksRouter {
  constructor(@inject(TaskManager) private taskManager: TaskManager) {}

  router: ContractedRouter<typeof contracts.tasks, OrpcContext> = {
    clearAll: os.clearAll.handler(() => {
      this.taskManager.clearTasks();
    }),
    clear: os.clear.handler(({ input }) => {
      this.taskManager.getTask(input).dispose();
    }),
    execute: os.execute.handler(({ input }) => {
      this.taskManager.execute(input);
    }),
  };
}
