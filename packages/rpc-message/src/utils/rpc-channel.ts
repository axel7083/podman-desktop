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
import type { UnaryRPC } from '/@/models/unary-rpc';

import { RpcChannel } from '../models/rpc-channel';

// keep the list of all RPC Channels being created
// allow to check if a channel is already created
const rpcChannelList = new Set<string>();

// defines a channel with the given name for the interface T
export function createRpcChannel<T extends Record<keyof T, UnaryRPC>>(channel: string): RpcChannel<T> {
  if (rpcChannelList.has(channel)) {
    throw new Error(`Duplicate channel. Channel ${channel} already exists`);
  }
  rpcChannelList.add(channel);
  return new RpcChannel<T>(channel);
}

export function clearRpcChannelList(): void {
  rpcChannelList.clear();
}
