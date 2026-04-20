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
import { onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/message-port';
import { ORPC_START_CHANNEL } from '@podman-desktop/core-api';
import { Container as InversifyContainer, inject, injectable } from 'inversify';

import { IPCMainOn } from '/@/plugin/api.js';
import { router } from '/@/plugin/routers/router.js';

export interface OrpcContext {
  container: InversifyContainer;
}

@injectable()
export class RpcHandler {
  #handler: RPCHandler<OrpcContext>;

  constructor(
    @inject(IPCMainOn)
    protected readonly ipcHandle: IPCMainOn,
  ) {
    this.#handler = new RPCHandler(router, {
      interceptors: [
        onError(error => {
          console.error(error);
          throw error;
        }),
      ],
    });
  }

  init(container: InversifyContainer): void {
    this.ipcHandle(ORPC_START_CHANNEL, event => {
      const [serverPort] = event.ports;
      if (!serverPort) {
        throw new Error('No server port provided');
      }
      this.#handler.upgrade(serverPort, {
        context: {
          container,
        },
      });
      serverPort.start();
    });
  }
}
