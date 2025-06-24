/*********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
 ********************************************************************/
import type { navigation as extensionNavigationNamespace } from '@podman-desktop/api';
import { createRpcChannel } from '@podman-desktop/rpc-message/dist/utils/rpc-channel';

export const NAVIGATION_API_CHANNEL = createRpcChannel<NavigationApi>('NavigationApi');

export interface NavigationApi extends Omit<typeof extensionNavigationNamespace, 'register'> {
  unregister(routeId: string): Promise<void>;
  register(routeId: string, commandId: string): Promise<void>;
}
