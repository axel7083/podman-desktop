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

import { type DragDropEventHandlers, type DragDropManager, PointerSensor } from '@dnd-kit/svelte';
import { isSortable } from '@dnd-kit/svelte/sortable';

/**
 * Reorders the main navigation rows with a long-press pointer drag.
 * Rows are sortables of the drag-and-drop manager, identified by the item name.
 * A committed move is passed to `saveOrder` as the new order of item names.
 * Must be created during component initialisation.
 */
export class NavReorder {
  readonly sensors = [
    // dnd-kit's default pointer constraints: a 200 ms hold and 5 px of movement.
    PointerSensor,
  ];

  /** Name of the item being dragged. */
  draggedItem = $state<string>();
  readonly isDragging = $derived(this.draggedItem !== undefined);
  /** Live-region message announced after a reorder. */
  announcement = $state('');

  readonly #getItemNames: () => string[];
  readonly #saveOrder: (order: string[]) => void;
  #dragOrder = $state<string[]>();
  // Owned by the provider, which passes it to every handler.
  #manager?: DragDropManager;

  /** Item names in the order to render: the live order while dragging, the stored one otherwise. */
  readonly order: string[] = $derived.by(() => this.#dragOrder ?? this.#getItemNames());

  constructor(getItemNames: () => string[], saveOrder: (order: string[]) => void) {
    this.#getItemNames = getItemNames;
    this.#saveOrder = saveOrder;

    // The registry applies the new order asynchronously, so the local order stays until the
    // store catches up; otherwise the rows would jump back for a frame after the drop.
    $effect(() => {
      if (!this.isDragging && this.#dragOrder !== undefined && this.#sameOrder(this.#dragOrder)) {
        this.#dragOrder = undefined;
      }
    });

    // dnd-kit caches every row's rect and refreshes it from a 75 ms throttled PositionObserver;
    // Sortable.animate() also skips rows that have no cached shape yet. As the list reorders the
    // DOM on each drag-over, those rects describe the previous layout and the drop target drifts
    // one row per move. Effects run once the new order is rendered, so re-measure it here.
    $effect(() => {
      if (this.#dragOrder === undefined || !this.isDragging || this.#manager === undefined) return;
      for (const droppable of this.#manager.registry.droppables) {
        droppable.refreshShape();
      }
      // Collisions are only published when the pointer moves, so a target sampled before the
      // last reorder sticks while the pointer is still. Re-evaluate against the fresh rects.
      this.#manager.collisionObserver.forceUpdate();
    });
  }

  onDragStart: NonNullable<DragDropEventHandlers['onDragStart']> = (event, manager) => {
    this.#manager = manager;
    this.#dragOrder = [...this.#getItemNames()];
    this.draggedItem = String(event.operation.source?.id);
    this.announcement = '';
  };

  // Rows are reordered by hand, as described in the createSortable docs: the sortable indices
  // follow the rendered order, so the dragged item's index is its current position.
  onDragOver: NonNullable<DragDropEventHandlers['onDragOver']> = event => {
    const order = this.#dragOrder;
    if (order === undefined) return;
    const { source, target } = event.operation;
    if (!isSortable(source) || !isSortable(target)) return;

    const from = source.index;
    const to = target.index;
    if (from === to || from < 0 || from >= order.length || to < 0 || to >= order.length) return;

    const newOrder = [...order];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);
    this.#dragOrder = newOrder;
  };

  onDragEnd: NonNullable<DragDropEventHandlers['onDragEnd']> = event => {
    this.draggedItem = undefined;
    const newOrder = this.#dragOrder;
    if (event.canceled || newOrder === undefined || this.#sameOrder(newOrder)) {
      this.#dragOrder = undefined;
      return;
    }

    const movedItem = event.operation.source?.id;
    if (movedItem !== undefined) {
      const name = String(movedItem);
      this.announcement = `Moved ${name} to position ${newOrder.indexOf(name) + 1} of ${newOrder.length}`;
    }
    this.#saveOrder(newOrder);
  };

  #sameOrder(order: string[]): boolean {
    return order.join('\n') === this.#getItemNames().join('\n');
  }
}
