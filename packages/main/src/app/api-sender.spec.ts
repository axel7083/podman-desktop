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

import { beforeEach, expect, test, vi } from 'vitest';

import { ApiSender, type ApiSenderWebContents } from './api-sender.js';

let domReadyEmitter: EventEmitter;
let webContents: ApiSenderWebContents;
let apiSender: ApiSender;

beforeEach(() => {
  vi.resetAllMocks();
  domReadyEmitter = new EventEmitter();
  webContents = {
    send: vi.fn(),
    on: (eventName, listener): void => {
      domReadyEmitter.on(eventName, listener);
    },
    isDestroyed: vi.fn().mockReturnValue(false),
  };
  apiSender = new ApiSender();
  apiSender.attach(webContents);
});

test('should queue events until the UI and the extension system are ready', () => {
  apiSender.send('foo', 'hello-world');
  expect(webContents.send).not.toHaveBeenCalled();

  apiSender.markReady();
  expect(webContents.send).not.toHaveBeenCalled();

  domReadyEmitter.emit('dom-ready');
  expect(webContents.send).toHaveBeenCalledWith('api-sender', 'foo', 'hello-world');
});

test('should send right away once the UI and the extension system are ready', () => {
  apiSender.markReady();
  domReadyEmitter.emit('dom-ready');

  apiSender.send('foo', 'hello-world');

  expect(webContents.send).toHaveBeenCalledWith('api-sender', 'foo', 'hello-world');
});

test('should queue the events sent before the web contents are attached', () => {
  const notYetAttached = new ApiSender();
  notYetAttached.markReady();
  notYetAttached.send('foo', 'hello-world');

  notYetAttached.attach(webContents);
  domReadyEmitter.emit('dom-ready');

  expect(webContents.send).toHaveBeenCalledWith('api-sender', 'foo', 'hello-world');
});

test('should drop the queued events when the window has been destroyed while they were queued', () => {
  apiSender.markReady();

  // the UI has not reported being ready yet, so the event is queued
  apiSender.send('foo', 'hello-world');

  // the user closes the window while the event is still queued
  vi.mocked(webContents.isDestroyed).mockReturnValue(true);

  // flushing the queue must drop the events instead of sending to the destroyed window
  expect(() => domReadyEmitter.emit('dom-ready')).not.toThrow();
  expect(webContents.send).not.toHaveBeenCalled();

  // and the events are not kept around to be flushed again later
  vi.mocked(webContents.isDestroyed).mockReturnValue(false);
  apiSender.send('bar', 'hello-again');
  expect(webContents.send).toHaveBeenCalledOnce();
  expect(webContents.send).toHaveBeenCalledWith('api-sender', 'bar', 'hello-again');
});

test('should notify the local receivers until disposed', () => {
  const listener = vi.fn();
  const disposable = apiSender.receive('foo', listener);

  apiSender.send('foo', 'hello-world');
  expect(listener).toHaveBeenCalledWith('hello-world');

  disposable.dispose();
  apiSender.send('foo', 'hello-again');
  expect(listener).toHaveBeenCalledOnce();
});
