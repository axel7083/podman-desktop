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
import { RPCLink } from '@orpc/client/message-port';
import type { ContractRouterClient } from '@orpc/contract';
import type { contracts } from '@podman-desktop/core-api';
import { ORPC_START_CHANNEL } from '@podman-desktop/core-api';

const { port1: clientPort, port2: serverPort } = new MessageChannel();

window.postMessage(ORPC_START_CHANNEL, window.origin, [serverPort]);

const link = new RPCLink({
  port: clientPort,
});

clientPort.start();

export const client: ContractRouterClient<typeof contracts> = createORPCClient(link);
