/**********************************************************************
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
 ***********************************************************************/

import { type Writable, writable } from 'svelte/store';

import type { HummingbirdCatalogEntry, ImageOptimizerInfo } from '/@api/image-optimizer-info';

import { EventStore } from './event-store';

const windowEvents = ['image-optimizer-provider-update', 'image-optimizer-provider-remove'];
const windowListeners = ['extensions-already-started'];

let readyToUpdate = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}

export const imageOptimizerProviders: Writable<readonly ImageOptimizerInfo[]> = writable([]);
export const imageOptimizerCatalog: Writable<readonly HummingbirdCatalogEntry[]> = writable([]);

const getImageOptimizerProvidersInfo = (): Promise<readonly ImageOptimizerInfo[]> => {
  return window.getImageOptimizerProviders();
};

const eventStore = new EventStore<readonly ImageOptimizerInfo[]>(
  'image optimizer providers',
  imageOptimizerProviders,
  checkForUpdate,
  windowEvents,
  windowListeners,
  getImageOptimizerProvidersInfo,
);
eventStore.setup();

// Fetch and update the catalog when providers change
imageOptimizerProviders.subscribe(providers => {
  if (providers.length > 0) {
    window
      .getImageOptimizerCatalog()
      .then(catalog => imageOptimizerCatalog.set(catalog))
      .catch((error: unknown) => console.error('Error fetching image optimizer catalog:', error));
  } else {
    imageOptimizerCatalog.set([]);
  }
});
