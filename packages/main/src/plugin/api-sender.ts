/**********************************************************************
 * Copyright (C) 2024-2026 Red Hat, Inc.
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

import type { IDisposable } from '@desktop-framework/api';
import type { ApiSenderChannelMap } from '@desktop-framework/api/api-sender';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { injectable } from 'inversify';

/**
 * Subset of Electron's WebContents used to deliver the events to the UI.
 */
export interface ApiSenderWebContents {
  send(channel: string, ...args: unknown[]): void;
  on(eventName: 'dom-ready', listener: () => void): void;
  isDestroyed(): boolean;
}

/**
 * Sends events from the main process to the UI on the 'api-sender' channel, and to the local receivers.
 *
 * Events are queued until both the UI is dom-ready and the extension system is ready.
 */
@injectable()
export class ApiSender implements ApiSenderType {
  readonly #queuedEvents: { channel: string; data: unknown[] }[] = [];
  readonly #eventEmitter = new EventEmitter();
  #webContents: ApiSenderWebContents | undefined;
  #uiReady = false;
  #ready = false;

  /**
   * Deliver the events to the UI of these web contents, once its page is dom-ready.
   * Must be called before the page starts loading.
   */
  attach(webContents: ApiSenderWebContents): void {
    this.#webContents = webContents;
    webContents.on('dom-ready', () => {
      console.log('PluginSystem: received dom-ready event from the UI');
      this.#uiReady = true;
      this.#flushQueuedEvents();
    });
  }

  /**
   * The extension system is ready: the queued events are delivered with the next event once the UI is ready.
   */
  markReady(): void {
    this.#ready = true;
  }

  send<K extends keyof ApiSenderChannelMap>(
    channel: K,
    ...data: ApiSenderChannelMap[K] extends never ? [] : [data: ApiSenderChannelMap[K]]
  ): void;
  send(channel: string, data?: unknown): void;
  send(channel: string, ...data: unknown[]): void {
    // send only when the UI is ready
    if (this.#uiReady && this.#ready) {
      this.#flushQueuedEvents();
      if (this.#webContents && !this.#webContents.isDestroyed()) {
        this.#webContents.send('api-sender', channel, ...data);
      }
    } else {
      this.#queuedEvents.push({ channel, data });
    }
    this.#eventEmitter.emit(channel, ...data);
  }

  receive<K extends keyof ApiSenderChannelMap>(
    channel: K,
    func: ApiSenderChannelMap[K] extends never ? () => void : (data: ApiSenderChannelMap[K]) => void,
  ): IDisposable;
  receive(channel: string, func: (...args: unknown[]) => void): IDisposable;
  receive(channel: string, func: (...args: unknown[]) => void): IDisposable {
    this.#eventEmitter.on(channel, func);
    return {
      dispose: (): void => {
        this.#eventEmitter.removeListener(channel, func);
      },
    };
  }

  #flushQueuedEvents(): void {
    if (!this.#uiReady || !this.#ready || this.#queuedEvents.length === 0) {
      return;
    }
    // the window may have been destroyed while the events were queued, drop them instead of failing
    if (!this.#webContents || this.#webContents.isDestroyed()) {
      this.#queuedEvents.length = 0;
      return;
    }
    console.log(`Delayed startup, flushing ${this.#queuedEvents.length} events`);
    for (const { channel, data } of this.#queuedEvents) {
      this.#webContents.send('api-sender', channel, ...data);
    }
    this.#queuedEvents.length = 0;
  }
}
