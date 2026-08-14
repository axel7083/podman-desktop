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

import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';
import { TempFileService } from '/@/plugin/temp-file-service.js';

const os = implement<typeof contracts.tempFile, OrpcContext>(contracts.tempFile);

@injectable()
export class TempFileRouter {
  constructor(@inject(TempFileService) private tempFileService: TempFileService) {}

  router: ContractedRouter<typeof contracts.tempFile, OrpcContext> = {
    create: os.create.handler(({ input }) => {
      return this.tempFileService.createTempFile(input.content);
    }),
    remove: os.remove.handler(({ input }) => {
      return this.tempFileService.removeTempFile(input.filePath);
    }),
  };
}
