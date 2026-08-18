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

import { EventEmitter } from 'node:events';

import type { WebSocket } from 'ws';

import type { ApiSenderType } from '@podman-desktop/core-api/api-sender';
import type { IDisposable } from '@podman-desktop/core-api';

export class WebSocketApiSender {
  #clients = new Set<WebSocket>();
  #emitter = new EventEmitter();

  addClient(ws: WebSocket): void {
    this.#clients.add(ws);
    ws.on('close', () => {
      this.#clients.delete(ws);
    });
  }

  asSender(): ApiSenderType {
    return {
      send: (channel: string, ...data: unknown[]): void => {
        const msg = JSON.stringify({ channel, data: data[0] });
        for (const ws of this.#clients) {
          if (ws.readyState === ws.OPEN) {
            ws.send(msg);
          }
        }
        this.#emitter.emit(channel, ...data);
      },
      receive: (channel: string, func: (...args: unknown[]) => void): IDisposable => {
        this.#emitter.on(channel, func);
        return {
          dispose: (): void => {
            this.#emitter.removeListener(channel, func);
          },
        };
      },
    };
  }
}
