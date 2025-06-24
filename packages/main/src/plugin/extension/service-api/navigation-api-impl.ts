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
import type { ProviderContainerConnection } from '@podman-desktop/api';

import type { NavigationApi } from '/@api/extension-worker/navigation-api.js';

export class NavigationApiImpl implements NavigationApi {
  public async navigateToDashboard(): Promise<void> {

  }
  public async navigateToContainers(): Promise<void> {

  }
  public async navigateToContainer(id: string): Promise<void> {

  }
  public async navigateToContainerLogs(id: string): Promise<void> {

  }
  public async navigateToContainerInspect(id: string): Promise<void> {

  }
  public async navigateToContainerTerminal(id: string): Promise<void> {

  }
  public async navigateToImages(): Promise<void> {

  }
  public async navigateToImage(id: string, engineId: string, tag: string): Promise<void> {

  }
  public async navigateToVolumes(): Promise<void> {

  }
  public async navigateToVolume(name: string, engineId: string): Promise<void> {

  }
  public async navigateToPods(): Promise<void> {

  }
  public async navigateToPod(kind: string, name: string, engineId: string): Promise<void> {

  }
  public async navigateToCliTools(): Promise<void> {

  }
  public async navigateToContribution(name: string): Promise<void> {

  }
  public async navigateToWebview(webviewId: string): Promise<void> {

  }
  public async navigateToAuthentication(): Promise<void> {

  }
  public async navigateToResources(): Promise<void> {

  }
  public async navigateToEditProviderContainerConnection(connection: ProviderContainerConnection): Promise<void> {
    // TODO: this would no work as ProviderContainerConnection is not serializable
  }

  public async navigateToOnboarding(extensionId?: string): Promise<void> {

  }

  public async register(routeId: string, commandId: string): Promise<void> {

  }

  public async unregister(routeId: string): Promise<void> {

  }

  public async navigate(routeId: string, ...args: unknown[]): Promise<void> {

  }
}
