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

import { DockerCompatibility } from '/@/plugin/docker/docker-compatibility.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.troubleshooting, OrpcContext>(contracts.troubleshooting);

@injectable()
export class TroubleshootingRouter {
  constructor(@inject(DockerCompatibility) private dockerCompatibility: DockerCompatibility) {}

  router: ContractedRouter<typeof contracts.troubleshooting, OrpcContext> = {
    getDockerSocketMappingStatus: os.getDockerSocketMappingStatus.handler(() => {
      return this.dockerCompatibility.getSystemDockerSocketMappingStatus();
    }),
  };
}
