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
import { EventEmitter } from 'node:events';

import { beforeEach, expect, test, vi } from 'vitest';

import { RpcClient } from '/@/client/rpc-client';
import { RpcServer } from '/@/server/rpc-server';

import { clearRpcChannelList, createRpcChannel } from './utils/rpc-channel';

beforeEach(() => {
  vi.resetAllMocks();
  clearRpcChannelList();
});

test('ensure event node:events#EventEmitter work as expected', async () => {
  const emitter = new EventEmitter();
  const listener = vi.fn();

  emitter.on('message', listener);

  const result = emitter.emit('message', 'ping');
  expect(result).toBeTruthy();

  await vi.waitFor(() => {
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith('ping');
  });
});

test('ensuring RpcServer & RpcClient can talk', async () => {
  const emitter = new EventEmitter();

  const server = new RpcServer(emitter, 'server-receive', 'server-emit');
  server.init();

  const client = new RpcClient(emitter, 'server-emit', 'server-receive');
  client.init();

  interface Foo {
    ping(): Promise<'pong'>;
  }

  class Dummy implements Foo {
    async ping(): Promise<'pong'> {
      return 'pong';
    }
  }
  const channel = createRpcChannel<Foo>('Foo');

  server.registerInstance(channel, new Dummy());

  const proxy = client.getProxy<Foo>(channel);

  const result = await proxy.ping();
  expect(result).toBe('pong');
});
