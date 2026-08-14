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

import type { ListOrganizerItem, TablePersistence } from '@podman-desktop/ui-svelte';

import { client } from '/@/client';

/**
 * Podman Desktop storage persistence implementation that uses the main process
 * oRPC client for storing table layout configurations.
 */
export class PodmanDesktopStoragePersist implements TablePersistence {
  async load(kind: string, columnNames: string[]): Promise<ListOrganizerItem[]> {
    return await client.listOrganizer.loadListConfig({ key: kind, availableColumns: columnNames });
  }

  async save(kind: string, items: ListOrganizerItem[]): Promise<void> {
    await client.listOrganizer.saveListConfig({ key: kind, items });
  }

  async reset(kind: string, columnNames: string[]): Promise<ListOrganizerItem[]> {
    return await client.listOrganizer.resetListConfig({ key: kind, availableColumns: columnNames });
  }
}
