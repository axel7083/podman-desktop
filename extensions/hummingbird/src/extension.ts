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

import * as extensionApi from '@podman-desktop/api';

import { HummingbirdCatalog } from './catalog';

const HUMMINGBIRD_PROVIDER_ID = 'hummingbird';
const HUMMINGBIRD_PROVIDER_LABEL = 'Hummingbird';

// Initialize the catalog
const catalog = new HummingbirdCatalog();

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  console.log('Activating Hummingbird extension');

  // Get configuration
  const config = extensionApi.configuration.getConfiguration('hummingbird');
  const registryPath = config.get<string>('registryPath') ?? 'quay.io/hummingbird';

  // Register the image optimizer provider
  const imageOptimizerProvider: extensionApi.ImageOptimizerProvider = {
    getAlternative: async (
      imageName: string,
      _token?: extensionApi.CancellationToken,
    ): Promise<extensionApi.OptimizeResult | undefined> => {
      // Look up the image in our catalog
      const entry = catalog.findAlternative(imageName);

      if (!entry) {
        return undefined;
      }

      // Build the result
      const result: extensionApi.OptimizeResult = {
        currentCVECount: entry.currentCVECount,
        alternative: {
          registry: `${registryPath}/${entry.hummingbirdImage}`,
          cveCount: entry.alternativeCVECount,
          size: entry.alternativeSize,
          signed: entry.signed ?? true,
        },
        sizeSavingsPercent: entry.sizeSavingsPercent,
        cveSavingsPercent: entry.cveSavingsPercent,
      };

      return result;
    },

    getCatalog: async (_token?: extensionApi.CancellationToken): Promise<extensionApi.HummingbirdCatalogEntry[]> => {
      return catalog.getAll().map(entry => ({
        originalImage: entry.originalImage,
        hummingbirdImage: `${registryPath}/${entry.hummingbirdImage}`,
        description: entry.description,
      }));
    },
  };

  // Register the provider
  const disposable = extensionApi.imageOptimizer.registerImageOptimizerProvider(
    {
      id: HUMMINGBIRD_PROVIDER_ID,
      label: HUMMINGBIRD_PROVIDER_LABEL,
    },
    imageOptimizerProvider,
  );

  extensionContext.subscriptions.push(disposable);

  // Track activation
  await extensionApi.telemetry.track('hummingbird.activated', {
    catalogSize: catalog.getAll().length,
  });

  console.log('Hummingbird extension activated with', catalog.getAll().length, 'catalog entries');
}

export function deactivate(): void {
  console.log('Deactivating Hummingbird extension');
}
