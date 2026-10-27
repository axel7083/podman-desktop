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

import type { App as ElectronApp } from 'electron';
import { inject, injectable, postConstruct } from 'inversify';

import { ElectronApp as ElectronAppSymbol } from '/@/inject/symbol.js';
import { isWindows } from '/@/util.js';
import product from '/@product.json' with { type: 'json' };

/**
 * Configures the application as the default protocol client for handling {@link product.urlProtocol} (e.g. 'podman-desktop') protocol links.
 */
@injectable()
export class DefaultProtocolClient {
  constructor(@inject(ElectronAppSymbol) private readonly app: ElectronApp) {}

  @postConstruct()
  init(): void {
    this.app
      .whenReady()
      .then(() => this.register())
      .catch((error: unknown) => {
        console.error('Error registering the default protocol client', error);
      });
  }

  protected register(): void {
    if (!import.meta.env.PROD) return;

    if (isWindows()) {
      this.app.setAsDefaultProtocolClient(product.urlProtocol, process.execPath, process.argv);
    } else {
      this.app.setAsDefaultProtocolClient(product.urlProtocol);
    }
  }
}
