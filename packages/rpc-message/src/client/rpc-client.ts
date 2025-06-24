/*********************************************************************
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
 ********************************************************************/

import type { EventEmitter } from 'node:events';

import type { IMessageRequest, ISubscribedMessage } from '/@/models/message';
import type { RpcChannel } from '/@/models/rpc-channel';
import type { Subscriber } from '/@/models/subscriber';
import type { UnaryRPC } from '/@/models/unary-rpc';
import { isMessageResponse } from '/@/utils/message';

import type { Listener } from '../models/listener';

export class RpcClient {
  counter: number = 0;
  promises: Map<number, { resolve: (value: unknown) => unknown; reject: (value: unknown) => void }> = new Map();
  subscribers: Map<string, Set<Listener<unknown>>> = new Map();

  getUniqueId(): number {
    return ++this.counter;
  }

  constructor(
    private emitter: EventEmitter,
    private receiveEventName: string,
    private emitEventName: string,
  ) {}

  init(): void {
    // eslint-disable-next-line sonarjs/post-message
    this.emitter.on(this.receiveEventName, (message: unknown) => {
      console.log(`[RpcClient] receiving event on ${this.receiveEventName}`, message);

      if (isMessageResponse(message)) {
        if (!this.promises.has(message.id)) {
          console.error('Unknown message id.');
          return;
        }

        const { resolve, reject } = this.promises.get(message.id) ?? {};

        if (message.status === 'error') {
          reject?.(message.error);
        } else {
          resolve?.(message.body);
        }
        this.promises.delete(message.id);
      } else if (this.isSubscribedMessage(message)) {
        this.subscribers.get(message.id)?.forEach(handler => handler(message.body));
      } else {
        console.error('Received incompatible message.', message);
        return;
      }
    });
  }

  getProxy<T extends Record<keyof T, UnaryRPC>>(
    channel: RpcChannel<T>,
    options?: { noTimeoutMethods: Array<keyof T> },
  ): T {
    // transform noTimeoutMethods keyof into an array of strings
    const noTimeoutMethodsValues: string[] = options?.noTimeoutMethods
      ? (Object.values(options.noTimeoutMethods) as string[])
      : [];

    const proxyHandler: ProxyHandler<object> = {
      get: (target, prop, receiver) => {
        if (typeof prop === 'string') {
          return (...args: unknown[]) => {
            return this.invoke(channel.name, noTimeoutMethodsValues, prop, ...args);
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    };

    // eslint-disable-next-line no-null/no-null
    return new Proxy(Object.create(null), proxyHandler);
  }

  protected async invoke(
    channel: string,
    noTimeoutMethodsValues: string[],
    method: string,
    ...args: unknown[]
  ): Promise<unknown> {
    // Generate a unique id for the request
    const requestId = this.getUniqueId();

    const promise = new Promise((resolve, reject) => {
      this.promises.set(requestId, { resolve, reject });
    });

    // Post the message
    this.emitter.emit(this.emitEventName, {
      id: requestId,
      channel,
      method,
      args,
    } as IMessageRequest);

    // Add some timeout
    if (Array.isArray(noTimeoutMethodsValues) && !noTimeoutMethodsValues.includes(method)) {
      setTimeout(() => {
        const { reject } = this.promises.get(requestId) ?? {};
        if (!reject) return;
        reject(new Error('Timeout'));
        this.promises.delete(requestId);
      }, 5000);
    }

    // Create a Promise
    return promise;
  }

  subscribe<T>(rpcChannel: RpcChannel<T>, f: Listener<T>): Subscriber {
    this.subscribers.set(
      rpcChannel.name,
      (this.subscribers.get(rpcChannel.name) ?? new Set()).add(f as Listener<unknown>),
    );

    return {
      unsubscribe: (): void => {
        this.subscribers.get(rpcChannel.name)?.delete(f as Listener<unknown>);
      },
    };
  }

  isSubscribedMessage(content: unknown): content is ISubscribedMessage {
    return !!content && typeof content === 'object' && 'id' in content && typeof content.id === 'string' && 'body' in content && this.subscribers.has(content.id);
  }
}
