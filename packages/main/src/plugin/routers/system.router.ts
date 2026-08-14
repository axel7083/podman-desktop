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

import os from 'node:os';
import path from 'node:path';

import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import checkDiskSpacePkg from 'check-disk-space';
import { BrowserWindow, clipboard, shell } from 'electron';
import { injectable } from 'inversify';

import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';
import { getFreePort, getFreePortRange, isFreePort } from '/@/plugin/util/port.js';
import { securityRestrictionCurrentHandler } from '/@/security-restrictions-handler.js';
import { createHash } from '/@/util.js';
import product from '/@product.json' with { type: 'json' };

const checkDiskSpace: (path: string) => Promise<{ free: number }> = checkDiskSpacePkg as unknown as (
  path: string,
) => Promise<{ free: number }>;

const os_ = implement<typeof contracts.system, OrpcContext>(contracts.system);

@injectable()
export class SystemRouter {
  router: ContractedRouter<typeof contracts.system, OrpcContext> = {
    getPlatform: os_.getPlatform.handler(() => {
      return os.platform();
    }),
    getArch: os_.getArch.handler(() => {
      return os.arch();
    }),
    getHostname: os_.getHostname.handler(() => {
      return os.hostname();
    }),
    getHostFreeDiskSize: os_.getHostFreeDiskSize.handler(async () => {
      return (await checkDiskSpace(os.homedir())).free;
    }),
    getHostMemory: os_.getHostMemory.handler(() => {
      return os.totalmem();
    }),
    getHostCpu: os_.getHostCpu.handler(() => {
      return os.cpus().length;
    }),
    getFreePort: os_.getFreePort.handler(({ input }) => {
      return getFreePort(input.port);
    }),
    getFreePortRange: os_.getFreePortRange.handler(({ input }) => {
      return getFreePortRange(input.rangeSize);
    }),
    isPortFree: os_.isPortFree.handler(({ input }) => {
      return isFreePort(input.port);
    }),
    windowMinimize: os_.windowMinimize.handler(() => {
      const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
      if (!window) {
        return;
      }
      window.minimize();
    }),
    windowMaximize: os_.windowMaximize.handler(() => {
      const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
      if (!window) {
        return;
      }
      if (window.isMaximized()) {
        window.unmaximize();
        return;
      }
      window.maximize();
    }),
    windowClose: os_.windowClose.handler(() => {
      const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
      if (!window) {
        return;
      }
      window.close();
    }),
    clipboardWriteText: os_.clipboardWriteText.handler(({ input }) => {
      clipboard.writeText(input.text, input.type);
    }),
    openExternal: os_.openExternal.handler(async ({ input }) => {
      if (securityRestrictionCurrentHandler.handler) {
        await securityRestrictionCurrentHandler.handler(input.link);
      } else {
        await shell.openExternal(input.link);
      }
    }),
    pathRelative: os_.pathRelative.handler(({ input }) => {
      return path.relative(input.from, input.to);
    }),
    createHash: os_.createHash.handler(({ input }) => {
      return createHash(input.input, input.algorithm ?? 'sha512');
    }),
    getUrlProtocol: os_.getUrlProtocol.handler(() => {
      return product.urlProtocol;
    }),
  };
}
