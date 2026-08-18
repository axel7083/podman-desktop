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

import { join } from 'node:path';
import { builtinModules } from 'node:module';

import { defineConfig } from 'vite';

const PACKAGE_ROOT = import.meta.dirname;

export default defineConfig({
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      'electron': join(PACKAGE_ROOT, 'src/electron-shim.ts'),
      'electron/main': join(PACKAGE_ROOT, 'src/electron-shim.ts'),
      'electron-context-menu': join(PACKAGE_ROOT, 'src/electron-shim.ts'),
      'electron-updater': join(PACKAGE_ROOT, 'src/electron-shim.ts'),
      'electron-util': join(PACKAGE_ROOT, 'src/electron-shim.ts'),
      '/@/': join(PACKAGE_ROOT, '../main/src') + '/',
      '/@product.json': join(PACKAGE_ROOT, '../../product.json'),
    },
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
  },
  build: {
    target: 'node24',
    outDir: 'dist',
    assetsDir: '.',
    minify: false,
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        ...builtinModules.flatMap(p => [p, `node:${p}`]),
        'ssh2',
        'cpu-features',
        'tar-fs',
        'ws'
      ],
      output: {
        entryFileNames: '[name].js',
        banner: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
      },
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
});
