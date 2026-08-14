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

import { ContainerModule } from 'inversify';

import { ConfigurationRouter } from '/@/plugin/routers/configuration.router.js';
import { PlanetRouter } from '/@/plugin/routers/planet.router.js';
import { RpcHandler } from '/@/plugin/routers/rpc-handler.js';
import { TasksRouter } from '/@/plugin/routers/tasks.router.js';

const routersModule = new ContainerModule(options => {
  options.bind<ConfigurationRouter>(ConfigurationRouter).toSelf().inSingletonScope();
  options.bind<PlanetRouter>(PlanetRouter).toSelf().inSingletonScope();
  options.bind<TasksRouter>(TasksRouter).toSelf().inSingletonScope();
  options.bind<RpcHandler>(RpcHandler).toSelf().inSingletonScope();
});

export { routersModule };
