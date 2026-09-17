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

import { injectable } from 'inversify';
import * as nodeTar from 'tar';

import { decompressZstd } from '/@/plugin/util/zstd.js';

export type LayerCompression = 'none' | 'gzip' | 'zstd';

const GZIP_MAGIC = Buffer.from([0x1f, 0x8b]);
const ZSTD_MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd]);

/**
 * Unpacks image layers (tar, tar+gzip or tar+zstd files) into a folder.
 * Shared by the registry download path and the local archive path.
 */
@injectable()
export class ImageLayerExtractor {
  /**
   * Detect the compression of a layer file from its magic bytes.
   */
  async detectCompression(file: string): Promise<LayerCompression> {
    const handle = await fs.promises.open(file, 'r');
    try {
      const header = Buffer.alloc(ZSTD_MAGIC.length);
      const { bytesRead } = await handle.read(header, 0, header.length, 0);
      if (bytesRead >= ZSTD_MAGIC.length && header.equals(ZSTD_MAGIC)) {
        return 'zstd';
      }
      if (bytesRead >= GZIP_MAGIC.length && header.subarray(0, GZIP_MAGIC.length).equals(GZIP_MAGIC)) {
        return 'gzip';
      }
      return 'none';
    } finally {
      await handle.close();
    }
  }

  /**
   * Unpack one layer into destFolder.
   * zstd layers are first decompressed (streamed, decompression-bomb safe) to a sibling .tar file that is
   * always removed afterwards. Plain and gzip tars are extracted directly, the tar library detects gzip itself.
   *
   * @param compression when omitted, the compression is detected from the file content
   */
  async extractLayer(file: string, destFolder: string, compression?: LayerCompression): Promise<void> {
    const actualCompression = compression ?? (await this.detectCompression(file));

    await fs.promises.mkdir(destFolder, { recursive: true });

    if (actualCompression !== 'zstd') {
      await nodeTar.extract({ file, cwd: destFolder });
      return;
    }

    const unpackedFileName = `${file}.tar`;
    try {
      await decompressZstd(file, unpackedFileName);
      await nodeTar.extract({ file: unpackedFileName, cwd: destFolder });
    } finally {
      // remove the decompressed tar even if the decompression or the extraction failed
      await fs.promises.rm(unpackedFileName, { force: true });
    }
  }
}
