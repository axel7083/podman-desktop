/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import type { ContextGeneralState, ContributionInfo, ForwardConfig } from '@desktop-framework/api';
import { AppearanceSettings } from '@desktop-framework/api/appearance';
import type { KubernetesObject } from '@kubernetes/client-node';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import type { TinroRouteMeta } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';

import AppNavigation from './AppNavigation.svelte';
import { onDidChangeConfiguration } from './stores/configurationProperties';
import { contributions } from './stores/contribs';
import { fetchNavigationRegistries, setNavigationItemOrder } from './stores/navigation/navigation-registry';

const callbacks = new Map<string, (arg: unknown) => void>();

vi.mock(import('/@/stores/kubernetes-contexts-state'), async () => {
  return {};
});

/** jsdom has no layout, popover or animation APIs; the sortable navigation rows need all three. */
function installDndStubs(): void {
  class NoopIntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = (): IntersectionObserverEntry[] => [];
  }
  class NoopResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  globalThis.IntersectionObserver = NoopIntersectionObserver as unknown as typeof IntersectionObserver;
  globalThis.ResizeObserver = NoopResizeObserver as unknown as typeof ResizeObserver;
  document.getAnimations = vi.fn().mockReturnValue([]);
  Element.prototype.getAnimations = vi.fn().mockReturnValue([]);
  Element.prototype.animate = vi.fn().mockReturnValue({
    cancel: vi.fn(),
    commitStyles: vi.fn(),
    finish: vi.fn(),
    finished: Promise.resolve(),
    pending: false,
    playState: 'finished',
    currentTime: 0,
    effect: null,
  }) as unknown as typeof Element.prototype.animate;
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(true);
  Element.prototype.scrollIntoView = vi.fn();
  document.elementFromPoint = vi.fn().mockReturnValue(null);
  window.scrollTo = vi.fn();
  window.scrollBy = vi.fn();
}

/** jsdom gives every element a 0x0 rect: lay the rows out as 160x40 with a 40px pitch. */
function installRowGeometry(): void {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element): DOMRect {
    const row = this.hasAttribute('data-nav-drag-item')
      ? this
      : this.parentElement?.hasAttribute('data-nav-drag-item')
        ? this.parentElement
        : undefined;
    if (!row?.parentElement) return new DOMRect(0, 0, 0, 0);
    const index = Array.from(row.parentElement.children).indexOf(row);
    return new DOMRect(0, index * 40, 160, 40);
  });
}

// fake the window object
beforeEach(async () => {
  vi.resetAllMocks();
  installDndStubs();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.mocked(window.getConfigurationProperties).mockResolvedValue({});
  vi.mocked(window.updateConfigurationValue).mockResolvedValue(undefined);
  // Start from the default order so an earlier test cannot leak its order into this one.
  setNavigationItemOrder([]);
  vi.mocked(window.updateConfigurationValue).mockClear();
  onDidChangeConfiguration.addEventListener = vi.fn().mockImplementation((message: string, callback: () => void) => {
    callbacks.set(message, callback);
  });
  await fetchNavigationRegistries();
});

test('Test rendering of the navigation bar with empty items', async (_arg: unknown) => {
  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  // mock no kubernetes resources
  vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPods = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextConfigMaps = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextSecrets = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPersistentVolumeClaims = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable<ForwardConfig[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextState = readable<ContextGeneralState>({} as ContextGeneralState);
  vi.mocked(kubeContextStore).kubernetesCurrentContextCronJobs = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextJobs = readable<KubernetesObject[]>([]);

  // init navigation registry
  await fetchNavigationRegistries();

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });

  const navigationBar = screen.getByRole('navigation', { name: 'AppNavigation' });
  expect(navigationBar).toBeInTheDocument();

  const dasboard = screen.getByRole('link', { name: 'Dashboard' });
  expect(dasboard).toBeInTheDocument();
  const containers = screen.getByRole('link', { name: 'Containers' });
  expect(containers).toBeInTheDocument();
  const pods = screen.getByRole('link', { name: 'Pods' });
  expect(pods).toBeInTheDocument();
  const images = screen.getByRole('link', { name: 'Images' });
  expect(images).toBeInTheDocument();
  const volumes = screen.getByRole('link', { name: 'Volumes' });
  expect(volumes).toBeInTheDocument();
  const settings = screen.getByRole('link', { name: 'Settings' });
  expect(settings).toBeInTheDocument();
});

test('shows the reorder hint on navigation links', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });

  const containers = screen.getByRole('link', { name: 'Containers' });
  expect(containers).toHaveAttribute('title', 'Hold to reorder');
});

test('Test contributions', () => {
  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  contributions.set([
    {
      id: 'dashboard-tab',
      name: 'foo1',
      extensionId: 'my.extension1',
    } as unknown as ContributionInfo,
    {
      id: 'dashboard-tab',
      name: 'foo2',
      extensionId: 'my.extension2',
    } as unknown as ContributionInfo,
  ]);

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });

  const navigationBar = screen.getByRole('navigation', { name: 'AppNavigation' });
  expect(navigationBar).toBeInTheDocument();
});

test('Navigation bar shows title when expanded', async () => {
  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  await fetchNavigationRegistries();

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });

  // Default width is 160px (expanded) — title should be in the DOM
  const dashboardTitle = screen.getByLabelText('Dashboard title');
  await vi.waitFor(() => expect(dashboardTitle).toHaveTextContent('Dashboard'));
});

test('Navigation bar width updates on configuration change', async () => {
  const NAV_BAR_WIDTH_KEY = `${AppearanceSettings.SectionName}.${AppearanceSettings.NavigationBarWidth}`;
  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  await fetchNavigationRegistries();

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });

  // Default width is 160px (expanded) — titles visible
  await vi.waitFor(() => screen.getByLabelText('Dashboard title'));

  // Simulate width change to expanded (200px) — title still visible
  callbacks.get(NAV_BAR_WIDTH_KEY)?.({ detail: { key: NAV_BAR_WIDTH_KEY, value: 200 } });
  await vi.waitFor(() => screen.getByLabelText('Dashboard title'));

  // Simulate width change to collapsed (below threshold of 70)
  callbacks.get(NAV_BAR_WIDTH_KEY)?.({ detail: { key: NAV_BAR_WIDTH_KEY, value: 60 } });
  await vi.waitFor(() => expect(screen.queryByLabelText('Dashboard title')).not.toBeInTheDocument());
});

test('Expanded threshold controls text visibility', async () => {
  const NAV_BAR_WIDTH_KEY = `${AppearanceSettings.SectionName}.${AppearanceSettings.NavigationBarWidth}`;
  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  await fetchNavigationRegistries();

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });

  // Default is 160px (expanded)
  await vi.waitFor(() => screen.getByLabelText('Dashboard title'));

  // Shrink to 80px — still above threshold (70), should stay expanded
  callbacks.get(NAV_BAR_WIDTH_KEY)?.({ detail: { key: NAV_BAR_WIDTH_KEY, value: 80 } });
  await vi.waitFor(() => screen.getByLabelText('Dashboard title'));

  // Shrink below 70px — should collapse (text removed from DOM)
  callbacks.get(NAV_BAR_WIDTH_KEY)?.({ detail: { key: NAV_BAR_WIDTH_KEY, value: 60 } });
  await vi.waitFor(() => expect(screen.queryByLabelText('Dashboard title')).not.toBeInTheDocument());

  // Grow above threshold — should expand again
  callbacks.get(NAV_BAR_WIDTH_KEY)?.({ detail: { key: NAV_BAR_WIDTH_KEY, value: 135 } });
  await vi.waitFor(() => screen.getByLabelText('Dashboard title'));
});

test('resize handle captures pointer and persists width on drag end', async () => {
  const NAV_BAR_WIDTH_KEY = `${AppearanceSettings.SectionName}.${AppearanceSettings.NavigationBarWidth}`;
  const meta = { url: '/' } as unknown as TinroRouteMeta;

  // Use a non-default width so waiting for it proves onMount finished (avoids mid-drag overwrite)
  vi.mocked(window.getConfigurationValue).mockResolvedValue(150);

  await fetchNavigationRegistries();
  render(AppNavigation, {
    meta,
    exitSettingsCallback: (): void => {},
  });

  const handle = screen.getByRole('separator', { name: 'Resize navigation bar' });
  const setPointerCapture = vi.fn();
  handle.setPointerCapture = setPointerCapture;
  await vi.waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '150'));

  handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 150, pointerId: 1 }));
  expect(setPointerCapture).toHaveBeenCalledWith(1);

  window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 180, pointerId: 1 }));
  await vi.waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '180'));

  window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
  await vi.waitFor(() => expect(window.updateConfigurationValue).toHaveBeenCalledWith(NAV_BAR_WIDTH_KEY, 180));
});

test('native image drag is prevented on reorderable navigation items', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, {
    meta,
    exitSettingsCallback: (): void => {},
  });

  const firstRow = screen.getAllByRole('listitem')[0];
  const event = new Event('dragstart', { bubbles: true, cancelable: true });
  firstRow.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
});

function navLinks(): HTMLElement[] {
  return within(screen.getByRole('region', { name: 'Scrollable navigation list' })).getAllByRole('link');
}

function navNames(): string[] {
  return navLinks().map(link => link.getAttribute('aria-label') ?? '');
}

function rowOf(name: string): HTMLElement {
  const row = screen.getByRole('link', { name }).closest<HTMLElement>('[data-nav-drag-item]');
  if (!row) throw new Error(`No reorderable row for ${name}`);
  return row;
}

test('a pointer drag starts only after the long press delay', async () => {
  installRowGeometry();
  render(AppNavigation, {
    meta: { url: '/' } as TinroRouteMeta,
    exitSettingsCallback: (): void => {},
  });

  const firstName = navLinks()[0].getAttribute('aria-label') ?? '';
  await fireEvent.pointerDown(navLinks()[0], {
    button: 0,
    isPrimary: true,
    pointerId: 1,
    clientX: 80,
    clientY: 20,
  });

  vi.advanceTimersByTime(100);
  expect(rowOf(firstName)).toHaveAttribute('data-dragging', 'false');

  vi.advanceTimersByTime(300);
  await vi.waitFor(() => expect(rowOf(firstName)).toHaveAttribute('data-dragging', 'true'));

  await fireEvent.pointerUp(document, { isPrimary: true, pointerId: 1, clientX: 80, clientY: 20 });
  await vi.waitFor(() => expect(rowOf(firstName)).toHaveAttribute('data-dragging', 'false'));
  expect(window.updateConfigurationValue).not.toHaveBeenCalledWith('navbar.itemOrder', expect.anything());
});

test('a plain click does not start a pointer drag', async () => {
  installRowGeometry();
  render(AppNavigation, {
    meta: { url: '/' } as TinroRouteMeta,
    exitSettingsCallback: (): void => {},
  });

  const firstName = navLinks()[0].getAttribute('aria-label') ?? '';
  await fireEvent.pointerDown(navLinks()[0], {
    button: 0,
    isPrimary: true,
    pointerId: 1,
    clientX: 80,
    clientY: 20,
  });
  vi.advanceTimersByTime(100);
  await fireEvent.pointerUp(document, { isPrimary: true, pointerId: 1, clientX: 80, clientY: 20 });

  vi.advanceTimersByTime(1000);
  expect(rowOf(firstName)).toHaveAttribute('data-dragging', 'false');
  expect(window.updateConfigurationValue).not.toHaveBeenCalledWith('navbar.itemOrder', expect.anything());
});

test('Escape cancels a pointer drag and restores the order', async () => {
  installRowGeometry();
  render(AppNavigation, {
    meta: { url: '/' } as TinroRouteMeta,
    exitSettingsCallback: (): void => {},
  });

  const startNames = navNames();
  const firstName = startNames[0];
  await fireEvent.pointerDown(navLinks()[0], {
    button: 0,
    isPrimary: true,
    pointerId: 1,
    clientX: 80,
    clientY: 20,
  });
  vi.advanceTimersByTime(400);
  await vi.waitFor(() => expect(rowOf(firstName)).toHaveAttribute('data-dragging', 'true'));

  await fireEvent.keyDown(document.body, { key: 'Escape' });

  await vi.waitFor(() => expect(rowOf(firstName)).toHaveAttribute('data-dragging', 'false'));
  await fireEvent.pointerUp(document, { isPrimary: true, pointerId: 1, clientX: 80, clientY: 20 });
  expect(navNames()).toEqual(startNames);
  expect(window.updateConfigurationValue).not.toHaveBeenCalledWith('navbar.itemOrder', expect.anything());
});
