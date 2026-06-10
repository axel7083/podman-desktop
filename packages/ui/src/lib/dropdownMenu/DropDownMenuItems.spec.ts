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

import '@testing-library/jest-dom/vitest';

import { autoUpdate, computePosition } from '@floating-ui/dom';
import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import DropDownMenuItems from './DropDownMenuItems.svelte';

vi.mock(import('@floating-ui/dom'));

beforeEach(() => {
  vi.mocked(computePosition).mockResolvedValue({
    middlewareData: {},
    placement: 'bottom-start',
    strategy: 'fixed',
    x: 100,
    y: 200,
  });

  vi.mocked(autoUpdate).mockImplementation((_ref, _tooltip, update) => {
    update();
    return (): void => {};
  });
});

function createReferenceElement(): HTMLElement {
  const el = document.createElement('button');
  document.body.appendChild(el);
  return el;
}

test('Expect DropDownMenuItems to render and be visible', async () => {
  render(DropDownMenuItems, {
    referenceElement: createReferenceElement(),
  });
  const dropDownMenuItems = screen.getByTitle('Drop Down Menu Items');

  expect(dropDownMenuItems).toBeVisible();
  expect(dropDownMenuItems).toBeInTheDocument();
});

test('Expect DropDownMenuItems to use fixed positioning', async () => {
  render(DropDownMenuItems, {
    referenceElement: createReferenceElement(),
  });
  const dropDownMenuItems = screen.getByTitle('Drop Down Menu Items');

  expect(dropDownMenuItems).toHaveClass('fixed');
});

test('Expect computePosition to be called with bottom-start placement', async () => {
  const ref = createReferenceElement();
  render(DropDownMenuItems, {
    referenceElement: ref,
  });

  expect(computePosition).toHaveBeenCalledWith(
    ref,
    expect.anything(),
    expect.objectContaining({ placement: 'bottom-start' }),
  );
});

test('Expect autoUpdate to be called for dynamic repositioning', async () => {
  render(DropDownMenuItems, {
    referenceElement: createReferenceElement(),
  });

  expect(autoUpdate).toHaveBeenCalled();
});

test('Expect tooltip-hide event to be dispatched on mount', async () => {
  const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
  render(DropDownMenuItems, {
    referenceElement: createReferenceElement(),
  });

  expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'tooltip-hide' }));
});
