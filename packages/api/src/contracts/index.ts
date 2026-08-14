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

import { authenticationContract } from '/@/contracts/authentication/authentication.contract.js';
import { cliToolContract } from '/@/contracts/cli-tool/cli-tool.contract.js';
import { configurationContract } from '/@/contracts/configuration/configuration.contract.js';
import { extensionContract } from '/@/contracts/extension/extension.contract.js';
import { imageRegistryContract } from '/@/contracts/image-registry/image-registry.contract.js';
import { notificationContract } from '/@/contracts/notification/notification.contract.js';
import { planetContract } from '/@/contracts/planet/planet.contract.js';
import { proxyContract } from '/@/contracts/proxy/proxy.contract.js';
import { statusBarContract } from '/@/contracts/status-bar/status-bar.contract.js';
import { systemContract } from '/@/contracts/system/system.contract.js';
import { tasksContract } from '/@/contracts/tasks/tasks.contract.js';
import { tempFileContract } from '/@/contracts/temp-file/temp-file.contract.js';
import { troubleshootingContract } from '/@/contracts/troubleshooting/troubleshooting.contract.js';

export * from './constants.js';

export const contracts = {
  authentication: authenticationContract,
  cliTool: cliToolContract,
  configuration: configurationContract,
  extension: extensionContract,
  imageRegistry: imageRegistryContract,
  notification: notificationContract,
  planet: planetContract,
  proxy: proxyContract,
  statusBar: statusBarContract,
  system: systemContract,
  tasks: tasksContract,
  tempFile: tempFileContract,
  troubleshooting: troubleshootingContract,
};
