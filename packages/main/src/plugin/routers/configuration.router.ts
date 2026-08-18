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
import {
  IConfigurationRegistry,
  type IConfigurationRegistry as IConfigurationRegistryType,
} from '@podman-desktop/core-api/configuration';
import { inject, injectable } from 'inversify';

import { ExperimentalConfigurationManager } from '/@/plugin/experimental-configuration-manager.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.configuration, OrpcContext>(contracts.configuration);

@injectable()
export class ConfigurationRouter {
  constructor(
    @inject(IConfigurationRegistry) private configurationRegistry: IConfigurationRegistryType,
    @inject(ExperimentalConfigurationManager)
    private experimentalConfigurationManager: ExperimentalConfigurationManager,
  ) {}

  router: ContractedRouter<typeof contracts.configuration, OrpcContext> = {
    getProperties: os.getProperties.handler(() => {
      return this.configurationRegistry.getConfigurationProperties();
    }),
    getValue: os.getValue.handler(({ input }) => {
      const parentKey = input.key.substring(0, input.key.indexOf('.'));
      const childKey = input.key.substring(input.key.indexOf('.') + 1);
      return this.configurationRegistry.getConfiguration(parentKey, input.scope).get(childKey);
    }),
    updateValue: os.updateValue.handler(({ input }) => {
      return this.configurationRegistry.updateConfigurationValue(input.key, input.value, input.scope);
    }),
    isExperimentalEnabled: os.isExperimentalEnabled.handler(({ input }) => {
      return this.experimentalConfigurationManager.isExperimentalConfigurationEnabled(input.key, input.scope);
    }),
    enableExperimental: os.enableExperimental.handler(({ input }) => {
      return this.experimentalConfigurationManager.enableExperimentalConfiguration(input.key, input.scope);
    }),
    disableExperimental: os.disableExperimental.handler(({ input }) => {
      return this.experimentalConfigurationManager.disableExperimentalConfiguration(input.key, input.scope);
    }),
    updateExperimentalValue: os.updateExperimentalValue.handler(({ input }) => {
      return this.experimentalConfigurationManager.updateExperimentalConfigurationValue(
        input.key,
        input.value,
        input.scope,
      );
    }),
  };
}
