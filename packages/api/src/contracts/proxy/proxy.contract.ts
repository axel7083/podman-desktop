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
import type { ProxySettings } from '@podman-desktop/api';

import type { ProxyState } from '/@/proxy.js';

export const proxyContract = {
  updateSettings: oc.input(type<ProxySettings>()).output(type<void>()),
  getSettings: oc.output(type<ProxySettings | undefined>()),
  getState: oc.output(type<ProxyState>()),
  setState: oc.input(type<ProxyState>()).output(type<void>()),
};
