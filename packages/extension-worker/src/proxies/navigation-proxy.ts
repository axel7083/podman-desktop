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
import type { Disposable, navigation as navigationNamespace, ProviderContainerConnection } from '@podman-desktop/api';

import { DisposableImpl } from '/@/utils/disposable-impl';
import type { NavigationApi } from '/@api/extension-worker/navigation-api';

type NavNamespace = typeof navigationNamespace;

export class NavigationProxy implements NavNamespace {
  constructor(protected navigationAPI: NavigationApi ) {}

  public navigateToDashboard(): Promise<void> {
    return this.navigationAPI.navigateToDashboard();
  }

  public navigateToContainers(): Promise<void> {
    return this.navigationAPI.navigateToContainers();
  }

  public navigateToContainer(id: string): Promise<void> {
    return this.navigationAPI.navigateToContainer(id);
  }

  public navigateToContainerLogs(id: string): Promise<void> {
    return this.navigationAPI.navigateToContainerLogs(id);
  }

  public navigateToContainerInspect(id: string): Promise<void> {
    return this.navigationAPI.navigateToContainerInspect(id);
  }

  public navigateToContainerTerminal(id: string): Promise<void> {
    return this.navigationAPI.navigateToContainerTerminal(id);
  }

  public navigateToImages(): Promise<void> {
    return this.navigationAPI.navigateToImages();
  }

  public navigateToImage(id: string, engineId: string, tag: string): Promise<void> {
    return this.navigationAPI.navigateToImage(id, engineId, tag);
  }

  public navigateToVolumes(): Promise<void> {
    return this.navigationAPI.navigateToVolumes();
  }

  public navigateToVolume(name: string, engineId: string): Promise<void> {
    return this.navigationAPI.navigateToVolume(name, engineId);
  }

  public navigateToPods(): Promise<void> {
    return this.navigationAPI.navigateToPods();
  }

  public navigateToPod(kind: string, name: string, engineId: string): Promise<void> {
    return this.navigationAPI.navigateToPod(kind, name, engineId);
  }

  public navigateToCliTools(): Promise<void> {
    return this.navigationAPI.navigateToCliTools();
  }

  public navigateToContribution(name: string): Promise<void> {
    return this.navigationAPI.navigateToContribution(name);
  }

  public navigateToWebview(webviewId: string): Promise<void> {
    return this.navigationAPI.navigateToWebview(webviewId);
  }

  public navigateToAuthentication(): Promise<void> {
    return this.navigationAPI.navigateToAuthentication();
  }

  public navigateToResources(): Promise<void> {
    return this.navigationAPI.navigateToResources();
  }

  public navigateToEditProviderContainerConnection(connection: ProviderContainerConnection): Promise<void> {
    return this.navigationAPI.navigateToEditProviderContainerConnection(connection);
  }

  public navigateToOnboarding(extensionId?: string): Promise<void> {
    return this.navigationAPI.navigateToOnboarding(extensionId);
  }

  public navigate(routeId: string, ...args: unknown[]): Promise<void> {
    return this.navigationAPI.navigate(routeId, args);
  }

  public register(routeId: string, commandId: string): Disposable {
    this.navigationAPI.register(routeId, commandId).catch(console.error);
    return DisposableImpl.create(() => {
      this.unregister(routeId).catch(console.error);
    });
  }

  public unregister(routeId: string): Promise<void> {
    return this.navigationAPI.unregister(routeId);
  }
}
