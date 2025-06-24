/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
import path from 'node:path';
import { Worker } from 'node:worker_threads';

import type { AppPlugin } from '/@/plugin/app-ready/app-plugin.js';

export class ExtensionWorker implements AppPlugin {
  protected worker: Worker | undefined = undefined;

  async onReady(): Promise<void> {
    const preloadScriptPath = path.join(__dirname, '../../extension-worker/dist/index.cjs');
    this.worker = new Worker(new URL(`file://${preloadScriptPath}`));

    this.worker.on('message', (message: unknown) => {
      console.log('[ExtensionWorkerService] received message', message);
    });

    setTimeout(() => {
      this.worker?.postMessage({
        event: 'ping',
      });
    }, 5_000);
  }

  dispose(): void {
    this.worker?.terminate().catch(console.error);
    this.worker = undefined;
  }
}
