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
import { createORPCClient } from '@orpc/client';
import { RPCLink as MessagePortLink } from '@orpc/client/message-port';
import { RPCLink as WebSocketLink } from '@orpc/client/websocket';
import type { RouterContractClient } from '@orpc/contract';
import type { contracts } from '@podman-desktop/core-api';
import { ORPC_START_CHANNEL } from '@podman-desktop/core-api';

const isElectron = navigator.userAgent.includes('Electron');

let link: InstanceType<typeof MessagePortLink> | InstanceType<typeof WebSocketLink>;

if (isElectron) {
  const { port1: clientPort, port2: serverPort } = new MessageChannel();
  window.postMessage(ORPC_START_CHANNEL, window.origin, [serverPort]);
  link = new MessagePortLink({ port: clientPort });
  clientPort.start();
} else {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  link = new WebSocketLink({
    connect: () => new WebSocket(`${proto}//${location.host}/ws/rpc`),
    reconnect: { enabled: true },
  });
}

export const client: RouterContractClient<typeof contracts> = createORPCClient(link);
