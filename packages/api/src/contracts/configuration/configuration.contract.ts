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

import { oc, type } from '@orpc/contract';
import type { ConfigurationScope } from '@podman-desktop/api';

import type { IConfigurationPropertyRecordedSchema } from '/@/configuration/models.js';

export const configurationContract = {
  getProperties: oc.output(type<Record<string, IConfigurationPropertyRecordedSchema>>()),
  getValue: oc.input(type<{ key: string; scope?: ConfigurationScope }>()).output(type<unknown>()),
  updateValue: oc
    .input(type<{ key: string; value: unknown; scope?: ConfigurationScope | ConfigurationScope[] }>())
    .output(type<void>()),
  isExperimentalEnabled: oc
    .input(type<{ key: string; scope?: ConfigurationScope | ConfigurationScope[] }>())
    .output(type<boolean>()),
  enableExperimental: oc
    .input(type<{ key: string; scope?: ConfigurationScope | ConfigurationScope[] }>())
    .output(type<void>()),
  disableExperimental: oc
    .input(type<{ key: string; scope?: ConfigurationScope | ConfigurationScope[] }>())
    .output(type<void>()),
  updateExperimentalValue: oc
    .input(type<{ key: string; value: unknown; scope?: ConfigurationScope | ConfigurationScope[] }>())
    .output(type<void>()),
};
