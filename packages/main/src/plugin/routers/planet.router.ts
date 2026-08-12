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
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { injectable } from 'inversify';

import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

import type { ServiceFromContract } from './utils/service-contract.js';

const os = implement<typeof contracts.planet, OrpcContext>(contracts.planet);

@injectable()
export class PlanetRouter implements ServiceFromContract<typeof contracts.planet, OrpcContext> {
  list = os.list.handler(({ input }) => {
    return Array.from({ length: input.limit ?? 5 }).map((_, index) => ({ id: index + 5, name: `Planet ${index}` }));
  });

  find = os.find.handler(({ input }) => {
    return { id: input.id, name: 'Planet X' };
  });

  create = os.create.handler(({ input }) => {
    return { id: 123, name: input.name };
  });
}
