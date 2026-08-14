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

import { CancellationTokenRegistry } from '/@/plugin/cancellation-token-registry.js';
import { ImageCheckerImpl } from '/@/plugin/image-checker.js';
import { ImageFilesRegistry } from '/@/plugin/image-files-registry.js';
import { ImageRegistry } from '/@/plugin/image-registry.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.imageRegistry, OrpcContext>(contracts.imageRegistry);

@injectable()
export class ImageRegistryRouter {
  constructor(
    @inject(ImageRegistry) private imageRegistry: ImageRegistry,
    @inject(ImageCheckerImpl) private imageChecker: ImageCheckerImpl,
    @inject(ImageFilesRegistry) private imageFiles: ImageFilesRegistry,
    @inject(CancellationTokenRegistry) private cancellationTokenRegistry: CancellationTokenRegistry,
  ) {}

  router: ContractedRouter<typeof contracts.imageRegistry, OrpcContext> = {
    getRegistries: os.getRegistries.handler(() => {
      return this.imageRegistry.getRegistries();
    }),
    getSuggestedRegistries: os.getSuggestedRegistries.handler(() => {
      return this.imageRegistry.getSuggestedRegistries();
    }),
    hasAuthconfigForImage: os.hasAuthconfigForImage.handler(({ input }) => {
      const { imageName } = input;
      if (imageName.indexOf(',') !== -1) {
        const allImageNames = imageName.split(',');
        let hasAuth = false;
        for (const name of allImageNames) {
          hasAuth = hasAuth || this.imageRegistry.getAuthconfigForImage(name) !== undefined;
        }
        return hasAuth;
      }
      return this.imageRegistry.getAuthconfigForImage(imageName) !== undefined;
    }),
    getProviderNames: os.getProviderNames.handler(() => {
      return this.imageRegistry.getProviderNames();
    }),
    unregisterRegistry: os.unregisterRegistry.handler(({ input }) => {
      return this.imageRegistry.unregisterRegistry(input);
    }),
    checkCredentials: os.checkCredentials.handler(({ input }) => {
      return this.imageRegistry.checkCredentials(input.serverUrl, input.username, input.secret);
    }),
    createRegistry: os.createRegistry.handler(async ({ input }) => {
      await this.imageRegistry.createRegistry(input.providerName, input.registryCreateOptions);
    }),
    updateRegistry: os.updateRegistry.handler(({ input }) => {
      return this.imageRegistry.updateRegistry(input);
    }),
    searchImages: os.searchImages.handler(({ input }) => {
      return this.imageRegistry.searchImages(input);
    }),
    listImageTags: os.listImageTags.handler(({ input }) => {
      return this.imageRegistry.listImageTags(input);
    }),
    getCheckerProviders: os.getCheckerProviders.handler(() => {
      return this.imageChecker.getImageCheckerProviders();
    }),
    check: os.check.handler(({ input }) => {
      let token;
      if (input.tokenId) {
        const tokenSource = this.cancellationTokenRegistry.getCancellationTokenSource(input.tokenId);
        token = tokenSource?.token;
      }
      return this.imageChecker.check(input.id, input.image, token);
    }),
    getFilesProviders: os.getFilesProviders.handler(() => {
      return this.imageFiles.getImageFilesProviders();
    }),
    getFilesystemLayers: os.getFilesystemLayers.handler(({ input }) => {
      let token;
      if (input.tokenId) {
        const tokenSource = this.cancellationTokenRegistry.getCancellationTokenSource(input.tokenId);
        token = tokenSource?.token;
      }
      return this.imageFiles.getFilesystemLayers(input.id, input.image, token);
    }),
  };
}
