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

import * as nodeTar from 'tar';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { ImageArchiveReader } from './image-archive-reader.js';
import { ImageLayerExtractor } from './image-layer-extractor.js';

const LABELS = {
  'org.opencontainers.image.title': 'My extension',
  'io.podman-desktop.api.version': '1.0.0',
};

let tmpDir: string;
let reader: ImageArchiveReader;

beforeEach(async () => {
  tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'image-archive-reader-'));
  reader = new ImageArchiveReader(new ImageLayerExtractor());
});

afterEach(async () => {
  await fs.promises.rm(tmpDir, { recursive: true, force: true });
});

interface ArchiveOptions {
  repoTags?: string[] | null;
  /** files (name → content) of each layer, base first */
  layers?: Record<string, string>[];
  /** override the manifest.json content entirely */
  manifest?: unknown;
  /** skip writing manifest.json */
  noManifest?: boolean;
}

/** Build a docker-archive like `podman save` does: manifest.json, <id>.json config, one uncompressed tar per layer. */
async function buildDockerArchive(name: string, options: ArchiveOptions = {}): Promise<string> {
  const build = path.join(tmpDir, `build-${name}`);
  await fs.promises.mkdir(build);
  const entries: string[] = [];

  const layerFiles: string[] = [];
  for (const [index, files] of (options.layers ?? [{ 'extension/package.json': '{"name":"ext"}' }]).entries()) {
    const layerDir = path.join(tmpDir, `layer-${name}-${index}`);
    for (const [file, content] of Object.entries(files)) {
      await fs.promises.mkdir(path.dirname(path.join(layerDir, file)), { recursive: true });
      await fs.promises.writeFile(path.join(layerDir, file), content);
    }
    const layerFile = `${index}deadbeef.tar`;
    await nodeTar.create({ file: path.join(build, layerFile), cwd: layerDir }, Object.keys(files));
    layerFiles.push(layerFile);
    entries.push(layerFile);
  }

  await fs.promises.writeFile(path.join(build, 'cafebabe.json'), JSON.stringify({ config: { Labels: LABELS } }));
  entries.push('cafebabe.json');

  if (!options.noManifest) {
    const manifest = options.manifest ?? [
      {
        Config: 'cafebabe.json',
        RepoTags: options.repoTags === undefined ? ['localhost/my-extension:latest'] : options.repoTags,
        Layers: layerFiles,
      },
    ];
    await fs.promises.writeFile(path.join(build, 'manifest.json'), JSON.stringify(manifest));
    entries.push('manifest.json');
  }

  const archive = path.join(tmpDir, `${name}.tar`);
  await nodeTar.create({ file: archive, cwd: build }, entries);
  return archive;
}

function listTempArchiveDirs(): string[] {
  return fs.readdirSync(os.tmpdir()).filter(entry => entry.startsWith('pd-extension-archive-'));
}

test('open reads the reference, labels and layers of a docker-archive', async () => {
  const archive = await buildDockerArchive('basic');

  await using opened = await reader.open(archive);

  expect(opened.reference).toBe('localhost/my-extension:latest');
  expect(opened.labels).toStrictEqual(LABELS);
  // the archive file is left in place
  expect(fs.existsSync(archive)).toBeTruthy();
});

test('reference is undefined when the image was saved by id (no RepoTags)', async () => {
  const archive = await buildDockerArchive('no-tags', { repoTags: null });

  await using opened = await reader.open(archive);

  expect(opened.reference).toBeUndefined();
});

test('extractLayers unpacks the layers in order and reports progress', async () => {
  const archive = await buildDockerArchive('layers', {
    layers: [
      { 'extension/package.json': 'base', 'extension/README.md': 'readme' },
      { 'extension/package.json': 'top' },
    ],
  });
  const dest = path.join(tmpDir, 'dest');
  const logger = vi.fn();

  await using opened = await reader.open(archive);
  await opened.extractLayers(dest, logger);

  // the top layer overwrites the base one, the base-only file survives
  expect(fs.readFileSync(path.join(dest, 'extension/package.json'), 'utf-8')).toBe('top');
  expect(fs.readFileSync(path.join(dest, 'extension/README.md'), 'utf-8')).toBe('readme');
  expect(logger.mock.calls.map(call => call[0].progress)).toStrictEqual([0, 50, 100]);
});

test('disposing removes the temporary directory', async () => {
  const archive = await buildDockerArchive('dispose');
  const before = listTempArchiveDirs();

  {
    await using opened = await reader.open(archive);
    expect(opened.labels).toBeDefined();
    expect(listTempArchiveDirs().length).toBe(before.length + 1);
  }

  expect(listTempArchiveDirs().length).toBe(before.length);
});

test('open rejects a file that is not a tar and leaves no temporary directory', async () => {
  const notATar = path.join(tmpDir, 'not-a-tar.tar');
  await fs.promises.writeFile(notATar, 'plain text');
  const before = listTempArchiveDirs();

  await expect(reader.open(notATar)).rejects.toThrow('Unable to read image archive');
  expect(listTempArchiveDirs().length).toBe(before.length);
});

test('open rejects a missing file', async () => {
  await expect(reader.open(path.join(tmpDir, 'missing.tar'))).rejects.toThrow('does not exist or is not a file');
});

test('open rejects a tar without manifest.json', async () => {
  const archive = await buildDockerArchive('no-manifest', { noManifest: true });

  await expect(reader.open(archive)).rejects.toThrow('missing manifest.json');
});

test('open rejects a manifest.json without image', async () => {
  const archive = await buildDockerArchive('empty-manifest', { manifest: [] });

  await expect(reader.open(archive)).rejects.toThrow('does not describe any image');
});

test('open rejects manifest paths escaping the archive', async () => {
  const archive = await buildDockerArchive('escape', {
    manifest: [{ Config: '../../etc/passwd', RepoTags: [], Layers: [] }],
  });

  await expect(reader.open(archive)).rejects.toThrow('invalid path in manifest.json');
});
