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

import type { DragDropManager } from '@dnd-kit/svelte';
import { isSortable } from '@dnd-kit/svelte/sortable';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { NavReorder } from '/@/lib/navigation/reorder.svelte';

vi.mock(import('@dnd-kit/svelte/sortable'));

type DragStartEvent = Parameters<NavReorder['onDragStart']>[0];
type DragOverEvent = Parameters<NavReorder['onDragOver']>[0];
type DragEndEvent = Parameters<NavReorder['onDragEnd']>[0];

let itemNames: string[];
let navReorder: NavReorder;
let destroyRoot: () => void;
const saveOrder = vi.fn<(order: string[]) => void>();
const manager = {
  registry: { droppables: [] },
  collisionObserver: { forceUpdate: vi.fn() },
} as unknown as DragDropManager;

function startEvent(id: string): DragStartEvent {
  return { operation: { source: { id } } } as unknown as DragStartEvent;
}

function overEvent(sourceIndex: number, targetIndex: number): DragOverEvent {
  return {
    operation: {
      source: { id: itemNames[sourceIndex], index: sourceIndex },
      target: { id: itemNames[targetIndex], index: targetIndex },
    },
  } as unknown as DragOverEvent;
}

function endEvent(id: string, options: { canceled?: boolean } = {}): DragEndEvent {
  return {
    canceled: options.canceled ?? false,
    operation: { source: { id } },
  } as unknown as DragEndEvent;
}

beforeEach(() => {
  vi.resetAllMocks();
  // The fake source and target below are not real dnd-kit sortables.
  vi.mocked(isSortable).mockReturnValue(true);
  itemNames = ['A', 'B', 'C'];
  destroyRoot = $effect.root(() => {
    navReorder = new NavReorder(() => itemNames, saveOrder);
  });
});

afterEach(() => {
  destroyRoot();
});

test('follows the stored order while idle', () => {
  expect(navReorder.order).toEqual(['A', 'B', 'C']);
  expect(navReorder.isDragging).toBe(false);
});

describe('drag', () => {
  beforeEach(() => {
    navReorder.onDragStart(startEvent('A'), manager);
  });

  test('tracks the dragged item and the live order', () => {
    expect(navReorder.draggedItem).toBe('A');
    expect(navReorder.isDragging).toBe(true);

    navReorder.onDragOver(overEvent(0, 1), manager);

    expect(navReorder.order).toEqual(['B', 'A', 'C']);
  });

  test('saves the new order on drop and announces it', () => {
    navReorder.onDragOver(overEvent(0, 1), manager);
    navReorder.onDragEnd(endEvent('A'), manager);

    expect(saveOrder).toHaveBeenCalledWith(['B', 'A', 'C']);
    expect(navReorder.isDragging).toBe(false);
    expect(navReorder.announcement).toBe('Moved A to position 2 of 3');
  });

  test('ignores targets that are not sortables', () => {
    vi.mocked(isSortable).mockReturnValue(false);

    navReorder.onDragOver(overEvent(0, 1), manager);

    expect(navReorder.order).toEqual(['A', 'B', 'C']);
  });

  test('keeps the order while dragging over its own place', () => {
    navReorder.onDragOver(overEvent(0, 0), manager);

    expect(navReorder.order).toEqual(['A', 'B', 'C']);
  });

  test('saves nothing and restores the order when canceled', () => {
    navReorder.onDragOver(overEvent(0, 1), manager);
    navReorder.onDragEnd(endEvent('A', { canceled: true }), manager);

    expect(saveOrder).not.toHaveBeenCalled();
    expect(navReorder.order).toEqual(['A', 'B', 'C']);
    expect(navReorder.announcement).toBe('');
  });

  test('saves nothing when dropped at its own place', () => {
    navReorder.onDragEnd(endEvent('A'), manager);

    expect(saveOrder).not.toHaveBeenCalled();
    expect(navReorder.order).toEqual(['A', 'B', 'C']);
  });
});
