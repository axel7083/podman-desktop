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

import { ExtensionsCatalog } from '/@/plugin/extension/catalog/extensions-catalog.js';
import { ExtensionDevelopmentFolders } from '/@/plugin/extension/extension-development-folders.js';
import { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import { ExtensionsUpdater } from '/@/plugin/extension/updater/extensions-updater.js';
import { Featured } from '/@/plugin/featured/featured.js';
import { RecommendationsRegistry } from '/@/plugin/recommendations/recommendations-registry.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';
import product from '/@product.json' with { type: 'json' };

const os = implement<typeof contracts.extension, OrpcContext>(contracts.extension);

@injectable()
export class ExtensionRouter {
  constructor(
    @inject(ExtensionLoader) private extensionLoader: ExtensionLoader,
    @inject(ExtensionsCatalog) private extensionsCatalog: ExtensionsCatalog,
    @inject(Featured) private featured: Featured,
    @inject(RecommendationsRegistry) private recommendationsRegistry: RecommendationsRegistry,
    @inject(ExtensionDevelopmentFolders) private extensionDevelopmentFolders: ExtensionDevelopmentFolders,
    @inject(ExtensionsUpdater) private extensionsUpdater: ExtensionsUpdater,
  ) {}

  router: ContractedRouter<typeof contracts.extension, OrpcContext> = {
    list: os.list.handler(() => {
      return this.extensionLoader.listExtensions();
    }),
    stop: os.stop.handler(({ input }) => {
      return this.extensionLoader.stopExtension(input.extensionId);
    }),
    start: os.start.handler(({ input }) => {
      return this.extensionLoader.startExtension(input.extensionId);
    }),
    remove: os.remove.handler(({ input }) => {
      return this.extensionLoader.removeExtensionPerUserRequest(input.extensionId);
    }),
    ensureEnabled: os.ensureEnabled.handler(({ input }) => {
      return this.extensionLoader.ensureExtensionIsEnabled(input.extensionId);
    }),
    update: os.update.handler(({ input }) => {
      return this.extensionsUpdater.updateExtension(input.extensionId, input.ociUri);
    }),
    getFeatured: os.getFeatured.handler(() => {
      return this.featured.getFeaturedExtensions();
    }),
    getBanners: os.getBanners.handler(() => {
      return this.recommendationsRegistry.getExtensionBanners();
    }),
    getRecommendedRegistries: os.getRecommendedRegistries.handler(() => {
      return this.recommendationsRegistry.getRegistries();
    }),
    getCatalog: os.getCatalog.handler(() => {
      return this.extensionsCatalog.getExtensions();
    }),
    refreshCatalog: os.refreshCatalog.handler(() => {
      return this.extensionsCatalog.refreshCatalog();
    }),
    getDevelopmentFolders: os.getDevelopmentFolders.handler(() => {
      return this.extensionDevelopmentFolders.getDevelopmentFolders();
    }),
    addDevelopmentFolder: os.addDevelopmentFolder.handler(({ input }) => {
      return this.extensionDevelopmentFolders.addDevelopmentFolder(input.path);
    }),
    removeDevelopmentFolder: os.removeDevelopmentFolder.handler(({ input }) => {
      return this.extensionDevelopmentFolders.removeDevelopmentFolder(input.path);
    }),
    getDevelopmentDocsLink: os.getDevelopmentDocsLink.handler(() => {
      return product.extensions.developmentDocumentation;
    }),
  };
}
