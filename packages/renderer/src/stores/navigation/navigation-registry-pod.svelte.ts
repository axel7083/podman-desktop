/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { type GoToInfo, NavigationPage } from '@podman-desktop/core-api';

import PodIcon from '/@/lib/images/PodIcon.svelte';
import { podsInfos } from '/@/stores/pods';

import type { NavigationRegistryEntry } from './navigation-registry';

let count = $state(0);
let gotos: Array<GoToInfo> = $state([]);

export function createNavigationPodEntry(): NavigationRegistryEntry {
  podsInfos.subscribe(pods => {
    count = pods.length;

    // Add all pod entries
    gotos = pods.map(pod => ({
      page: NavigationPage.PODMAN_POD_SUMMARY,
      parameters: { name: pod.Name, engineId: pod.engineId },
      icon: { iconComponent: PodIcon },
      name: `Pod: ${pod.Name}`,
    }));

    // Add pod list entry
    gotos.push({
      page: NavigationPage.PODMAN_PODS,
      icon: { iconComponent: PodIcon },
      name: `Pods (${count})`,
    });
  });

  const registry: NavigationRegistryEntry = {
    name: 'Pods',
    icon: { iconComponent: PodIcon },
    link: '/pods',
    tooltip: 'Pods',
    type: 'entry',
    get gotos() {
      return gotos;
    },
    get counter() {
      return count;
    },
  };
  return registry;
}
