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
 * Entry in the Hummingbird catalog mapping original images to hardened alternatives
 */
export interface CatalogEntry {
  /** Original image name (e.g., "node", "python", "nginx") */
  originalImage: string;
  /** Hummingbird alternative image name */
  hummingbirdImage: string;
  /** Description of the alternative */
  description?: string;
  /** Current CVE count for the original image (mock data for Phase 1) */
  currentCVECount?: number;
  /** CVE count for the Hummingbird alternative */
  alternativeCVECount?: number;
  /** Size of the alternative image in bytes */
  alternativeSize?: number;
  /** Size savings percentage */
  sizeSavingsPercent?: number;
  /** CVE savings percentage */
  cveSavingsPercent?: number;
  /** Whether the image is signed */
  signed?: boolean;
  /** Tags available */
  tags?: string[];
}

/**
 * Hummingbird catalog containing mappings from popular images to hardened alternatives
 *
 * Phase 1 includes language runtimes: Node.js, Python, Go, Java, Ruby
 */
const CATALOG_ENTRIES: CatalogEntry[] = [
  {
    originalImage: 'node',
    hummingbirdImage: 'nodejs',
    description: 'Hardened Node.js runtime with minimal attack surface',
    currentCVECount: 127,
    alternativeCVECount: 0,
    alternativeSize: 45 * 1024 * 1024, // 45MB
    sizeSavingsPercent: 85,
    cveSavingsPercent: 100,
    signed: true,
    tags: ['18', '20', '22', 'latest'],
  },
  {
    originalImage: 'nodejs',
    hummingbirdImage: 'nodejs',
    description: 'Hardened Node.js runtime with minimal attack surface',
    currentCVECount: 127,
    alternativeCVECount: 0,
    alternativeSize: 45 * 1024 * 1024,
    sizeSavingsPercent: 85,
    cveSavingsPercent: 100,
    signed: true,
    tags: ['18', '20', '22', 'latest'],
  },
  {
    originalImage: 'python',
    hummingbirdImage: 'python',
    description: 'Hardened Python runtime with minimal attack surface',
    currentCVECount: 89,
    alternativeCVECount: 0,
    alternativeSize: 52 * 1024 * 1024, // 52MB
    sizeSavingsPercent: 82,
    cveSavingsPercent: 100,
    signed: true,
    tags: ['3.10', '3.11', '3.12', 'latest'],
  },
  {
    originalImage: 'golang',
    hummingbirdImage: 'go',
    description: 'Hardened Go runtime with minimal attack surface',
    currentCVECount: 45,
    alternativeCVECount: 0,
    alternativeSize: 250 * 1024 * 1024, // 250MB
    sizeSavingsPercent: 70,
    cveSavingsPercent: 100,
    signed: true,
    tags: ['1.21', '1.22', 'latest'],
  },
  {
    originalImage: 'go',
    hummingbirdImage: 'go',
    description: 'Hardened Go runtime with minimal attack surface',
    currentCVECount: 45,
    alternativeCVECount: 0,
    alternativeSize: 250 * 1024 * 1024,
    sizeSavingsPercent: 70,
    cveSavingsPercent: 100,
    signed: true,
    tags: ['1.21', '1.22', 'latest'],
  },
  {
    originalImage: 'openjdk',
    hummingbirdImage: 'jdk',
    description: 'Hardened OpenJDK runtime with minimal attack surface',
    currentCVECount: 156,
    alternativeCVECount: 0,
    alternativeSize: 180 * 1024 * 1024, // 180MB
    sizeSavingsPercent: 65,
    cveSavingsPercent: 100,
    signed: true,
    tags: ['11', '17', '21', 'latest'],
  },
  {
    originalImage: 'java',
    hummingbirdImage: 'jdk',
    description: 'Hardened Java runtime with minimal attack surface',
    currentCVECount: 156,
    alternativeCVECount: 0,
    alternativeSize: 180 * 1024 * 1024,
    sizeSavingsPercent: 65,
    cveSavingsPercent: 100,
    signed: true,
    tags: ['11', '17', '21', 'latest'],
  },
  {
    originalImage: 'ruby',
    hummingbirdImage: 'ruby',
    description: 'Hardened Ruby runtime with minimal attack surface',
    currentCVECount: 78,
    alternativeCVECount: 0,
    alternativeSize: 35 * 1024 * 1024, // 35MB
    sizeSavingsPercent: 88,
    cveSavingsPercent: 100,
    signed: true,
    tags: ['3.2', '3.3', 'latest'],
  },
];

/**
 * Catalog class for managing Hummingbird image mappings
 */
export class HummingbirdCatalog {
  private entries: Map<string, CatalogEntry>;

  constructor() {
    this.entries = new Map();
    for (const entry of CATALOG_ENTRIES) {
      this.entries.set(this.normalizeImageName(entry.originalImage), entry);
    }
  }

  /**
   * Normalize an image name by extracting just the base name
   * e.g., "docker.io/library/node:18" -> "node"
   */
  private normalizeImageName(imageName: string): string {
    // Remove registry prefix
    let name = imageName;

    // Remove common registry prefixes
    const registryPrefixes = ['docker.io/library/', 'docker.io/', 'quay.io/', 'gcr.io/', 'ghcr.io/'];

    for (const prefix of registryPrefixes) {
      if (name.startsWith(prefix)) {
        name = name.slice(prefix.length);
        break;
      }
    }

    // Remove tag
    const colonIndex = name.indexOf(':');
    if (colonIndex !== -1) {
      name = name.slice(0, colonIndex);
    }

    // Remove namespace if it's a library image
    const slashIndex = name.lastIndexOf('/');
    if (slashIndex !== -1) {
      name = name.slice(slashIndex + 1);
    }

    return name.toLowerCase();
  }

  /**
   * Find a Hummingbird alternative for the given image
   */
  findAlternative(imageName: string): CatalogEntry | undefined {
    const normalized = this.normalizeImageName(imageName);
    return this.entries.get(normalized);
  }

  /**
   * Get all catalog entries
   */
  getAll(): CatalogEntry[] {
    // Return unique entries (some originals map to the same Hummingbird image)
    const seen = new Set<string>();
    const unique: CatalogEntry[] = [];

    for (const entry of this.entries.values()) {
      if (!seen.has(entry.hummingbirdImage)) {
        seen.add(entry.hummingbirdImage);
        unique.push(entry);
      }
    }

    return unique;
  }

  /**
   * Check if an image has a Hummingbird alternative
   */
  hasAlternative(imageName: string): boolean {
    return this.findAlternative(imageName) !== undefined;
  }
}
