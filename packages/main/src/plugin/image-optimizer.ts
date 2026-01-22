/**********************************************************************
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
 ***********************************************************************/

import type { CancellationToken, Disposable } from '@podman-desktop/api';
import { inject, injectable } from 'inversify';

import { ApiSenderType } from '/@api/api-sender/api-sender-type.js';
import type {
  HummingbirdCatalogEntry,
  ImageOptimizerExtensionInfo,
  ImageOptimizerInfo,
  OptimizeResult,
} from '/@api/image-optimizer-info.js';

/**
 * Interface that extension providers must implement
 */
export interface ImageOptimizerProvider {
  /**
   * Get an optimized alternative for the given image
   * @param imageName The name of the image to optimize
   * @param token Optional cancellation token
   * @returns The optimization result or undefined if no alternative exists
   */
  getAlternative(imageName: string, token?: CancellationToken): Promise<OptimizeResult | undefined>;

  /**
   * Get the catalog of available optimized images
   * @returns Array of catalog entries
   */
  getCatalog(): Promise<HummingbirdCatalogEntry[]>;
}

/**
 * Metadata for registering an image optimizer provider
 */
export interface ImageOptimizerProviderMetadata {
  readonly label: string;
}

export interface ImageOptimizerProviderWithMetadata {
  id: string;
  label: string;
  provider: ImageOptimizerProvider;
}

@injectable()
export class ImageOptimizerImpl {
  private _imageOptimizerProviders: Map<string, ImageOptimizerProviderWithMetadata> = new Map<
    string,
    ImageOptimizerProviderWithMetadata
  >();

  constructor(@inject(ApiSenderType) private apiSender: ApiSenderType) {}

  registerImageOptimizerProvider(
    extensionInfo: ImageOptimizerExtensionInfo,
    provider: ImageOptimizerProvider,
    metadata?: ImageOptimizerProviderMetadata,
  ): Disposable {
    const label = metadata?.label ?? extensionInfo.label;
    const idBase = `${extensionInfo.id}-`;
    let id: string = '';
    for (let i = 0; ; i++) {
      const newId = idBase + i;
      if (!this._imageOptimizerProviders.get(newId)) {
        id = newId;
        break;
      }
    }
    if (id === '') {
      throw new Error(`Unable to register an image optimizer for extension '${extensionInfo.id}'.`);
    }
    this._imageOptimizerProviders.set(id, {
      id,
      label,
      provider,
    });
    this.apiSender.send('image-optimizer-provider-update', { id });
    return {
      dispose: (): void => {
        this._imageOptimizerProviders.delete(id);
        this.apiSender.send('image-optimizer-provider-remove', { id });
      },
    };
  }

  getImageOptimizerProviders(): ImageOptimizerInfo[] {
    return Array.from(this._imageOptimizerProviders.keys()).map(k => {
      const el = this._imageOptimizerProviders.get(k)!;
      return {
        id: k,
        label: el.label,
      };
    });
  }

  async getAlternative(
    providerId: string,
    imageName: string,
    token?: CancellationToken,
  ): Promise<OptimizeResult | undefined> {
    const provider = this._imageOptimizerProviders.get(providerId);
    if (provider === undefined) {
      throw new Error('provider not found with id ' + providerId);
    }
    return provider.provider.getAlternative(imageName, token);
  }

  async getCatalog(providerId: string): Promise<HummingbirdCatalogEntry[]> {
    const provider = this._imageOptimizerProviders.get(providerId);
    if (provider === undefined) {
      throw new Error('provider not found with id ' + providerId);
    }
    return provider.provider.getCatalog();
  }

  /**
   * Get all catalog entries from all providers
   */
  async getAllCatalogs(): Promise<HummingbirdCatalogEntry[]> {
    const allEntries: HummingbirdCatalogEntry[] = [];
    for (const [, providerData] of this._imageOptimizerProviders) {
      const catalog = await providerData.provider.getCatalog();
      allEntries.push(...catalog);
    }
    return allEntries;
  }

  /**
   * Check if any optimizer providers are registered
   */
  hasProviders(): boolean {
    return this._imageOptimizerProviders.size > 0;
  }
}
