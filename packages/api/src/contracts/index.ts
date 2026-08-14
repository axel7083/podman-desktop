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

import { appContract } from '/@/contracts/app/app.contract.js';
import { authenticationContract } from '/@/contracts/authentication/authentication.contract.js';
import { cancellationContract } from '/@/contracts/cancellation/cancellation.contract.js';
import { cliToolContract } from '/@/contracts/cli-tool/cli-tool.contract.js';
import { commandsContract } from '/@/contracts/commands/commands.contract.js';
import { configurationContract } from '/@/contracts/configuration/configuration.contract.js';
import { containerContract } from '/@/contracts/container/container.contract.js';
import { shellContract } from '/@/contracts/container/shell.contract.js';
import { dialogContract } from '/@/contracts/dialog/dialog.contract.js';
import { documentationContract } from '/@/contracts/documentation/documentation.contract.js';
import { exploreFeaturesContract } from '/@/contracts/explore-features/explore-features.contract.js';
import { extensionContract } from '/@/contracts/extension/extension.contract.js';
import { feedbackContract } from '/@/contracts/feedback/feedback.contract.js';
import { imageRegistryContract } from '/@/contracts/image-registry/image-registry.contract.js';
import { learningCenterContract } from '/@/contracts/learning-center/learning-center.contract.js';
import { listOrganizerContract } from '/@/contracts/list-organizer/list-organizer.contract.js';
import { menuContract } from '/@/contracts/menu/menu.contract.js';
import { notificationContract } from '/@/contracts/notification/notification.contract.js';
import { onboardingContract } from '/@/contracts/onboarding/onboarding.contract.js';
import { pickerContract } from '/@/contracts/picker/picker.contract.js';
import { planetContract } from '/@/contracts/planet/planet.contract.js';
import { proxyContract } from '/@/contracts/proxy/proxy.contract.js';
import { statusBarContract } from '/@/contracts/status-bar/status-bar.contract.js';
import { systemContract } from '/@/contracts/system/system.contract.js';
import { tasksContract } from '/@/contracts/tasks/tasks.contract.js';
import { telemetryContract } from '/@/contracts/telemetry/telemetry.contract.js';
import { tempFileContract } from '/@/contracts/temp-file/temp-file.contract.js';
import { troubleshootingContract } from '/@/contracts/troubleshooting/troubleshooting.contract.js';
import { uiRegistryContract } from '/@/contracts/ui-registry/ui-registry.contract.js';
import { webviewContract } from '/@/contracts/webview/webview.contract.js';
import { welcomeContract } from '/@/contracts/welcome/welcome.contract.js';

export * from './constants.js';

export const contracts = {
  app: appContract,
  authentication: authenticationContract,
  cancellation: cancellationContract,
  cliTool: cliToolContract,
  container: containerContract,
  shell: shellContract,
  commands: commandsContract,
  configuration: configurationContract,
  dialog: dialogContract,
  documentation: documentationContract,
  exploreFeatures: exploreFeaturesContract,
  extension: extensionContract,
  feedback: feedbackContract,
  imageRegistry: imageRegistryContract,
  learningCenter: learningCenterContract,
  listOrganizer: listOrganizerContract,
  menu: menuContract,
  notification: notificationContract,
  onboarding: onboardingContract,
  picker: pickerContract,
  planet: planetContract,
  proxy: proxyContract,
  statusBar: statusBarContract,
  system: systemContract,
  tasks: tasksContract,
  telemetry: telemetryContract,
  tempFile: tempFileContract,
  troubleshooting: troubleshootingContract,
  uiRegistry: uiRegistryContract,
  webview: webviewContract,
  welcome: welcomeContract,
};
