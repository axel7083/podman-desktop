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

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { inject, injectable } from 'inversify';
import * as nodeTar from 'tar';

import { ImageLayerExtractor } from './image-layer-extractor.js';

/** docker-archive manifest.json entry (one per image, `podman save` writes a single one). */
interface DockerArchiveManifest {
  Config: string;
  RepoTags?: string[] | null;
  Layers?: string[];
}

/**
 * An image archive unpacked in a temporary directory.
 * Dispose it (`await using archive = await reader.open(...)`) to remove that directory.
 */
export class ImageArchive implements AsyncDisposable {
  constructor(
    private readonly rootDir: string,
    /** Image reference the archive was saved from, e.g. `localhost/my-extension:latest`; undefined when saved by ID. */
    readonly reference: string | undefined,
    /** OCI image config labels. */
    readonly labels: { [key: string]: unknown } | undefined,
    /** Layer files, base first. */
    private readonly layers: string[],
    private readonly layerExtractor: ImageLayerExtractor,
  ) {}

  /** Unpack every layer, in order, into destFolder. */
  async extractLayers(
    destFolder: string,
    logger: (event: { message: string; progress: number }) => void,
  ): Promise<void> {
    const total = this.layers.length;
    for (const [index, layer] of this.layers.entries()) {
      logger({
        message: `Extracting layer ${index + 1}/${total} (${path.basename(layer)})`,
        progress: Math.round((index / total) * 100),
      });
      await this.layerExtractor.extractLayer(layer, destFolder);
    }
    logger({ message: `Extracted ${total} layer(s)`, progress: 100 });
  }

  async [Symbol.asyncDispose](): Promise<void> {
    await fs.promises.rm(this.rootDir, { recursive: true, force: true });
  }
}

/**
 * Reads image archives produced by `podman save` / `docker save` (docker-archive layout).
 */
@injectable()
export class ImageArchiveReader {
  constructor(
    @inject(ImageLayerExtractor)
    private readonly layerExtractor: ImageLayerExtractor,
  ) {}

  /**
   * Unpack the archive into a temporary directory and read its manifest and image config.
   * The archive file itself is left untouched.
   */
  async open(archivePath: string): Promise<ImageArchive> {
    const stats = await fs.promises.stat(archivePath).catch(() => undefined);
    if (!stats?.isFile()) {
      throw new Error(`Image archive ${archivePath} does not exist or is not a file`);
    }

    const rootDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'pd-extension-archive-'));
    try {
      // tar rejects '..' entries and strips absolute paths, so the content stays inside rootDir
      await nodeTar.extract({ file: archivePath, cwd: rootDir });
      return await this.readDockerArchive(rootDir);
    } catch (error: unknown) {
      await fs.promises.rm(rootDir, { recursive: true, force: true });
      throw new Error(`Unable to read image archive ${archivePath}: ${error}`);
    }
  }

  protected async readDockerArchive(rootDir: string): Promise<ImageArchive> {
    const manifestFile = path.join(rootDir, 'manifest.json');
    if (!fs.existsSync(manifestFile)) {
      throw new Error('not a docker-archive image (missing manifest.json)');
    }

    const manifests: DockerArchiveManifest[] = JSON.parse(await fs.promises.readFile(manifestFile, 'utf-8'));
    const manifest = Array.isArray(manifests) ? manifests[0] : undefined;
    if (!manifest?.Config) {
      throw new Error('manifest.json does not describe any image');
    }

    const config = JSON.parse(await fs.promises.readFile(this.resolveInside(rootDir, manifest.Config), 'utf-8'));
    const labels = config?.config?.Labels;

    const layers = (manifest.Layers ?? []).map(layer => this.resolveInside(rootDir, layer));

    return new ImageArchive(rootDir, manifest.RepoTags?.[0], labels, layers, this.layerExtractor);
  }

  /** Resolve a path listed in the manifest, refusing anything pointing outside the unpacked archive. */
  protected resolveInside(rootDir: string, relativePath: string): string {
    const resolved = path.resolve(rootDir, relativePath);
    if (!resolved.startsWith(rootDir + path.sep)) {
      throw new Error(`invalid path in manifest.json: ${relativePath}`);
    }
    return resolved;
  }
}
