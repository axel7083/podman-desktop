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

import { oc, type } from '@orpc/contract';

import type { CatalogExtension } from '/@/extension-catalog.js';
import type { ExtensionDevelopmentFolderInfo, ExtensionInfo } from '/@/extension-info.js';
import type { FeaturedExtension } from '/@/featured.js';
import type { ExtensionBanner, RecommendedRegistry } from '/@/recommendations.js';

export const extensionContract = {
  list: oc.output(type<ExtensionInfo[]>()),
  stop: oc.input(type<{ extensionId: string }>()).output(type<void>()),
  start: oc.input(type<{ extensionId: string }>()).output(type<void>()),
  remove: oc.input(type<{ extensionId: string }>()).output(type<void>()),
  ensureEnabled: oc.input(type<{ extensionId: string }>()).output(type<void>()),
  update: oc.input(type<{ extensionId: string; ociUri: string }>()).output(type<void>()),
  getFeatured: oc.output(type<FeaturedExtension[]>()),
  getBanners: oc.output(type<ExtensionBanner[]>()),
  getRecommendedRegistries: oc.output(type<RecommendedRegistry[]>()),
  getCatalog: oc.output(type<CatalogExtension[]>()),
  refreshCatalog: oc.output(type<void>()),
  getDevelopmentFolders: oc.output(type<ExtensionDevelopmentFolderInfo[]>()),
  addDevelopmentFolder: oc.input(type<{ path: string }>()).output(type<void>()),
  removeDevelopmentFolder: oc.input(type<{ path: string }>()).output(type<void>()),
  getDevelopmentDocsLink: oc.output(type<string | undefined>()),
};
