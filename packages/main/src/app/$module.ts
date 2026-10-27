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

import { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { App as ElectronApp } from 'electron';
import { ContainerModule } from 'inversify';

import { ApiSender } from '/@/app/api-sender.js';
import { AppIdentity } from '/@/app/app-identity.js';
import { DefaultProtocolClient } from '/@/app/default-protocol-client.js';
import { DevIconBuilder } from '/@/app/dev-icon-builder.js';
import { ProtocolLauncher } from '/@/app/protocol-launcher.js';
import { SecurityRestrictions } from '/@/app/security-restrictions.js';
import { ElectronApp as ElectronAppSymbol, StartupSymbol } from '/@/inject/symbol.js';

const module = new ContainerModule(options => {
  options.bind<ApiSender>(ApiSender).toSelf().inSingletonScope();
  options.bind<ApiSenderType>(ApiSenderType).toService(ApiSender);
  options.bind<ProtocolLauncher>(ProtocolLauncher).toSelf().inSingletonScope();
  options.bind<SecurityRestrictions>(SecurityRestrictions).toSelf().inSingletonScope();
  options.bind<DefaultProtocolClient>(DefaultProtocolClient).toSelf().inSingletonScope();

  // mark them as startup services
  options.bind(StartupSymbol).toService(SecurityRestrictions);
  options.bind(StartupSymbol).toService(DefaultProtocolClient);

  // development builds get their own user data folder and a branch labelled icon
  if (import.meta.env.DEV) {
    options
      .bind<DevIconBuilder>(DevIconBuilder)
      .toDynamicValue(context => new DevIconBuilder(context.get<ElectronApp>(ElectronAppSymbol).getAppPath()))
      .inSingletonScope();
    options.bind<AppIdentity>(AppIdentity).toSelf().inSingletonScope();
    options.bind(StartupSymbol).toService(AppIdentity);
  }
});

export { module };
