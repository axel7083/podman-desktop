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
import { isMainThread, parentPort } from 'node:worker_threads';

import { ApiService } from '/@/services/api-service';

let api: ApiService | undefined;

export function main(): void {
  if (isMainThread) throw new Error('extension worker cannot execute in main thread');
  if (!parentPort) throw new Error('extension worker cannot execute without parent port');

  console.log('extension worker started');

  parentPort.on('message', (message: unknown) => {
    console.log('[ExtensionWorker] received message', message);
  });

  // Handle worker termination
  parentPort.on('close', () => {
    api?.dispose();
  });

  api = new ApiService('<unknown>');
}

// execute main
main();
