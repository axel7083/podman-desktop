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

import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { MenuRegistry } from '/@/plugin/menu-registry.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.menu, OrpcContext>(contracts.menu);

@injectable()
export class MenuRouter {
  constructor(@inject(MenuRegistry) private menuRegistry: MenuRegistry) {}

  router: ContractedRouter<typeof contracts.menu, OrpcContext> = {
    getContributedMenus: os.getContributedMenus.handler(({ input }) => {
      return this.menuRegistry.getContributedMenus(input.context);
    }),
  };
}
