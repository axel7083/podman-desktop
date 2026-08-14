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
import type { ImageChecks, Registry, RegistryCreateOptions, RegistrySuggestedProvider } from '@podman-desktop/api';

import type { ImageCheckerInfo } from '/@/image-checker-info.js';
import type { ImageFilesInfo } from '/@/image-files-info.js';
import type { ImageFilesystemLayersUI } from '/@/image-filesystem-layers.js';
import type { ImageInfo } from '/@/image-info.js';
import type { ImageSearchOptions, ImageSearchResult, ImageTagsListOptions } from '/@/image-registry.js';

export const imageRegistryContract = {
  getRegistries: oc.output(type<readonly Registry[]>()),
  getSuggestedRegistries: oc.output(type<RegistrySuggestedProvider[]>()),
  hasAuthconfigForImage: oc.input(type<{ imageName: string }>()).output(type<boolean>()),
  getProviderNames: oc.output(type<string[]>()),
  unregisterRegistry: oc.input(type<Registry>()).output(type<void>()),
  checkCredentials: oc.input(type<RegistryCreateOptions>()).output(type<void>()),
  createRegistry: oc
    .input(type<{ providerName: string; registryCreateOptions: RegistryCreateOptions }>())
    .output(type<void>()),
  updateRegistry: oc.input(type<Registry>()).output(type<void>()),
  searchImages: oc.input(type<ImageSearchOptions>()).output(type<ImageSearchResult[]>()),
  listImageTags: oc.input(type<ImageTagsListOptions>()).output(type<string[]>()),
  getCheckerProviders: oc.output(type<ImageCheckerInfo[]>()),
  check: oc.input(type<{ id: string; image: ImageInfo; tokenId?: number }>()).output(type<ImageChecks | undefined>()),
  getFilesProviders: oc.output(type<ImageFilesInfo[]>()),
  getFilesystemLayers: oc
    .input(type<{ id: string; image: ImageInfo; tokenId?: number }>())
    .output(type<ImageFilesystemLayersUI | undefined>()),
};
