#!/usr/bin/env node
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

const path = require('path');
const packageJson = require('../package.json');
const fs = require('fs');
const { mkdirp } = require('mkdirp');

const builtinDirectory = path.resolve(__dirname, '../builtin');
const unzippedDirectory = path.resolve(builtinDirectory, `${packageJson.name}.cdix`);

// remove the builtin folder before building
if (fs.existsSync(builtinDirectory)) {
  fs.rmSync(builtinDirectory, { recursive: true, force: true });
}

// create unzipped built-in directory
mkdirp(unzippedDirectory).then(() => {
  // Copy dist folder
  const distSrc = path.resolve(__dirname, '../dist');
  const distDest = path.resolve(unzippedDirectory, 'dist');
  fs.cpSync(distSrc, distDest, { recursive: true });

  // Copy package.json
  fs.copyFileSync(path.resolve(__dirname, '../package.json'), path.resolve(unzippedDirectory, 'package.json'));

  // Copy icon if exists
  const iconPath = path.resolve(__dirname, '../icon.png');
  if (fs.existsSync(iconPath)) {
    fs.copyFileSync(iconPath, path.resolve(unzippedDirectory, 'icon.png'));
  }

  console.log(`Built ${packageJson.name} extension to ${unzippedDirectory}`);
});
