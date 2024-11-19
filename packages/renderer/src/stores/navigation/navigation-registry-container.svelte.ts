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

import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';

import { containersInfos } from '../containers';
import type { NavigationRegistryEntry } from './navigation-registry';
import KubeIcon from '/@/lib/images/KubeIcon.svelte';

let containerNavigationEntry: NavigationRegistryEntry[] = $state([]);

export function createNavigationContainerEntry(): NavigationRegistryEntry {
  containerNavigationEntry = [
    {
      name: 'Containers',
      icon: { iconComponent: KubeIcon },
      link: '/container-engine/containers',
      tooltip: 'Containers',
      type: 'entry',
      get counter() {
        return 0;
      },
    },
    {
      name: 'Images',
      icon: { iconComponent: KubeIcon },
      link: '/container-engine/images',
      tooltip: 'Images',
      type: 'entry',
      get counter() {
        return 0;
      },
    },
    /* kube objects */
    {
      name: 'Pods',
      icon: { iconComponent: KubeIcon },
      link: '/container-engine/pods',
      tooltip: 'Pods',
      type: 'entry',
      get counter() {
        return 0;
      },
    },
    {
      name: 'Volumes',
      icon: { iconComponent: KubeIcon },
      link: '/container-engine/volumes',
      tooltip: 'Volumes',
      type: 'entry',
      get counter() {
        return 0;
      },
    },
    {
      name: 'Advanced',
      icon: { iconComponent: KubeIcon },
      link: '/container-engine/advanced',
      tooltip: 'Advanced',
      type: 'submenu',
      get counter() {
        return 0;
      },
      items: [
        {
          name: 'Deployments',
          icon: { iconComponent: KubeIcon },
          link: '/container-engine/deployments',
          tooltip: 'Deployments',
          type: 'entry',
          get counter() {
            return 0;
          },
        },
        {
          name: 'ConfigMaps',
          icon: { iconComponent: KubeIcon },
          link: '/container-engine/configmaps',
          tooltip: 'ConfigMaps',
          type: 'entry',
          get counter() {
            return 0;
          },
        },
        {
          name: 'Secrets',
          icon: { iconComponent: KubeIcon },
          link: '/container-engine/secrets',
          tooltip: 'Secrets',
          type: 'entry',
          get counter() {
            return 0;
          },
        },
      ]
    },
  ];

  return {
    name: 'Container Engine',
    icon: { iconComponent: ContainerIcon },
    link: '/container-engine',
    tooltip: 'Container Engine',
    type: 'submenu',
    get counter() {
      return 0;
    },
    get items() {
      return containerNavigationEntry;
    }
  }
}
