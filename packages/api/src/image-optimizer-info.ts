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

/**
 * Extension information for image optimizer providers
 */
export type ImageOptimizerExtensionInfo = {
  id: string;
  label: string;
};

/**
 * Information about a registered image optimizer provider
 */
export interface ImageOptimizerInfo {
  id: string;
  label: string;
}

/**
 * Metrics for an image (size, CVE count, signature status)
 */
export interface ImageMetrics {
  size: string;
  cveCount: number;
  isSigned: boolean;
}

/**
 * Result of an optimization check - comparison between current and alternative image
 */
export interface OptimizeResult {
  currentImage: ImageMetrics;
  alternative: ImageMetrics & {
    imageName: string;
    registry: string;
  };
}

/**
 * Entry in the Hummingbird image catalog
 */
export interface HummingbirdCatalogEntry {
  /** Standard image name, e.g., "node", "redis" */
  standardImage: string;
  /** Full Hummingbird image path, e.g., "quay.io/hummingbird/nodejs" */
  hummingbirdImage: string;
  /** Available tags for this image */
  tags: string[];
  /** Image metadata */
  metadata: ImageMetrics;
}
