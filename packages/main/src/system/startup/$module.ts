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

import { StartupSymbol } from '/@/inject/symbol.js';
import { StartupInstall } from '/@/system/startup/startup-install.js';

const module = new ContainerModule(options => {
  options.bind<StartupInstall>(StartupInstall).toSelf().inSingletonScope();

  // mark it as a startup service: it needs the configuration registry
  options.bind(StartupSymbol).toService(StartupInstall);
});

export { module };
