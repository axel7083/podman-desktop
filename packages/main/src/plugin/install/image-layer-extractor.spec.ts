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
import * as zlib from 'node:zlib';

import * as nodeTar from 'tar';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { ImageLayerExtractor } from './image-layer-extractor.js';

let tmpDir: string;
let sourceDir: string;
let destFolder: string;
let extractor: ImageLayerExtractor;

beforeEach(async () => {
  tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'image-layer-extractor-'));
  sourceDir = path.join(tmpDir, 'source');
  destFolder = path.join(tmpDir, 'dest');
  await fs.promises.mkdir(sourceDir);
  await fs.promises.writeFile(path.join(sourceDir, 'package.json'), JSON.stringify({ name: 'test-package' }));
  extractor = new ImageLayerExtractor();
});

afterEach(async () => {
  await fs.promises.rm(tmpDir, { recursive: true, force: true });
});

async function createPlainTar(file: string): Promise<void> {
  await nodeTar.create({ file, cwd: sourceDir }, ['package.json']);
}

async function createGzipTar(file: string): Promise<void> {
  await nodeTar.create({ gzip: true, file, cwd: sourceDir }, ['package.json']);
}

async function createZstdTar(file: string): Promise<void> {
  const plain = path.join(tmpDir, 'layer-for-zstd.tar');
  await createPlainTar(plain);
  await fs.promises.writeFile(file, zlib.zstdCompressSync(await fs.promises.readFile(plain)));
}

test('detectCompression identifies plain, gzip and zstd tars', async () => {
  const plain = path.join(tmpDir, 'plain.tar');
  const gzip = path.join(tmpDir, 'layer.tar.gz');
  const zstd = path.join(tmpDir, 'layer.zst');
  await createPlainTar(plain);
  await createGzipTar(gzip);
  await createZstdTar(zstd);

  expect(await extractor.detectCompression(plain)).toBe('none');
  expect(await extractor.detectCompression(gzip)).toBe('gzip');
  expect(await extractor.detectCompression(zstd)).toBe('zstd');
});

test('detectCompression returns none for a file shorter than the magic bytes', async () => {
  const tiny = path.join(tmpDir, 'tiny');
  await fs.promises.writeFile(tiny, 'a');

  expect(await extractor.detectCompression(tiny)).toBe('none');
});

test('extractLayer unpacks a plain tar and creates the destination folder', async () => {
  const layer = path.join(tmpDir, 'layer.tar');
  await createPlainTar(layer);

  await extractor.extractLayer(layer, destFolder);

  expect(fs.readFileSync(path.join(destFolder, 'package.json'), 'utf-8')).toBe(
    JSON.stringify({ name: 'test-package' }),
  );
});

test('extractLayer unpacks a gzip tar', async () => {
  const layer = path.join(tmpDir, 'layer.tar.gz');
  await createGzipTar(layer);

  await extractor.extractLayer(layer, destFolder);

  expect(fs.existsSync(path.join(destFolder, 'package.json'))).toBeTruthy();
});

test('extractLayer unpacks a zstd tar and removes the intermediate tar', async () => {
  const layer = path.join(tmpDir, 'layer.zst');
  await createZstdTar(layer);

  await extractor.extractLayer(layer, destFolder);

  expect(fs.existsSync(path.join(destFolder, 'package.json'))).toBeTruthy();
  expect(fs.existsSync(`${layer}.tar`)).toBeFalsy();
  // the source layer is left untouched, the caller owns it
  expect(fs.existsSync(layer)).toBeTruthy();
});

test('extractLayer honours an explicit compression over detection', async () => {
  const layer = path.join(tmpDir, 'layer.zst');
  // plain content while told it is zstd: decompression must fail and the intermediate tar must be gone
  await fs.promises.writeFile(layer, 'not a zstd file');

  await expect(extractor.extractLayer(layer, destFolder, 'zstd')).rejects.toThrow();
  expect(fs.existsSync(`${layer}.tar`)).toBeFalsy();
});

test('extractLayer rejects on an invalid tar', async () => {
  const layer = path.join(tmpDir, 'layer.tar');
  await fs.promises.writeFile(layer, 'not a tar file');

  await expect(extractor.extractLayer(layer, destFolder)).rejects.toThrow();
});
