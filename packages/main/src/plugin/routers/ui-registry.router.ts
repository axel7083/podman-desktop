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

import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { ColorRegistry } from '/@/plugin/color-registry.js';
import { Context } from '/@/plugin/context/context.js';
import { ContributionManager } from '/@/plugin/contribution-manager.js';
import { FeatureRegistry } from '/@/plugin/feature-registry.js';
import { IconRegistry } from '/@/plugin/icon-registry.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';
import { ViewRegistry } from '/@/plugin/view-registry.js';

const os = implement<typeof contracts.uiRegistry, OrpcContext>(contracts.uiRegistry);

@injectable()
export class UiRegistryRouter {
  constructor(
    @inject(ContributionManager) private contributionManager: ContributionManager,
    @inject(IconRegistry) private iconRegistry: IconRegistry,
    @inject(ColorRegistry) private colorRegistry: ColorRegistry,
    @inject(ViewRegistry) private viewRegistry: ViewRegistry,
    @inject(Context) private context: Context,
    @inject(FeatureRegistry) private featureRegistry: FeatureRegistry,
  ) {}

  router: ContractedRouter<typeof contracts.uiRegistry, OrpcContext> = {
    listContributions: os.listContributions.handler(() => {
      return this.contributionManager.listContributions();
    }),
    listIcons: os.listIcons.handler(() => {
      return this.iconRegistry.listIcons();
    }),
    listColors: os.listColors.handler(({ input }) => {
      return this.colorRegistry.listColors(input.themeId);
    }),
    getThemeInfo: os.getThemeInfo.handler(({ input }) => {
      return this.colorRegistry.getThemeInfo(input.themeId);
    }),
    listViews: os.listViews.handler(() => {
      return this.viewRegistry.listViewsContributions();
    }),
    fetchViews: os.fetchViews.handler(({ input }) => {
      return this.viewRegistry.fetchViewsContributions(input.id);
    }),
    collectAllContextValues: os.collectAllContextValues.handler(() => {
      return this.context.collectAllValues();
    }),
    getRegisteredFeatures: os.getRegisteredFeatures.handler(() => {
      return this.featureRegistry.listFeatures();
    }),
  };
}
