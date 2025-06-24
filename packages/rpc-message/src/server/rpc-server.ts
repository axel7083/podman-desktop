/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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
import type { EventEmitter } from 'node:events';

import type { RpcChannel } from '/@/models/rpc-channel';
import type { UnaryRPC } from '/@/models/unary-rpc';
import { isMessageRequest } from '/@/utils/message';

import type { IMessageResponse } from '../models/message';
import { ObjectInstance } from '/@/models/object-instance';

export class RpcServer {
  #instances: Map<string, ObjectInstance<unknown>> = new Map();

  constructor(
    private eventEmitter: EventEmitter,
    private receiveEventName: string,
    private emitEventName: string,
  ) {}

  init(): void {
    console.log('[RpcServer] init');
    this.eventEmitter.on(this.receiveEventName, (message: unknown) => {
      console.log(`[RpcServer] receiving event on ${this.receiveEventName}`, message);

      if (!isMessageRequest(message)) {
        console.error('Received incompatible message.', message);
        return;
      }

      if (!this.#instances.has(message.channel)) {
        console.error(
          `Trying to call on an unknown channel ${message.channel}. Available: ${Array.from(this.#instances.keys())}`,
        );
        throw new Error('channel does not exist.');
      }

      const promise = this.#instances.get(message.channel)?.[message.method]?.(...message.args);
      promise?.then((result) => {
        this.eventEmitter.emit(this.emitEventName, {
          id: message.id,
          channel: message.channel,
          body: result,
          status: 'success',
        } as IMessageResponse);
      });
      promise?.catch((err: unknown) => {
        let errorMessage: string;
        // Depending on the object throw we try to extract the error message
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        } else {
          errorMessage = String(err);
        }

        this.eventEmitter.emit(this.emitEventName, {
          id: message.id,
          channel: message.channel,
          body: undefined,
          status: 'error',
          error: errorMessage,
        } as IMessageResponse);
      });
    });
  }

  fire<T>(channel: RpcChannel<T>, body: T): boolean {
    return this.eventEmitter.emit(this.emitEventName, {
      id: channel.name,
      body,
    });
  }

  registerInstance<T extends Record<keyof T, UnaryRPC>, R extends T>(channel: RpcChannel<T>, instance: R): void {
    // convert the instance to an object with method names as keys
    this.#instances.set(channel.name, instance as ObjectInstance<unknown>);
  }
}

