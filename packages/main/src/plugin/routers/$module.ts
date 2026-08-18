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

import { ContainerModule } from 'inversify';

import { AppRouter } from '/@/plugin/routers/app.router.js';
import { AuthenticationRouter } from '/@/plugin/routers/authentication.router.js';
import { CancellationRouter } from '/@/plugin/routers/cancellation.router.js';
import { CliToolRouter } from '/@/plugin/routers/cli-tool.router.js';
import { CommandsRouter } from '/@/plugin/routers/commands.router.js';
import { ConfigurationRouter } from '/@/plugin/routers/configuration.router.js';
import { ContainerRouter } from '/@/plugin/routers/container.router.js';
import { DashboardRouter } from '/@/plugin/routers/dashboard.router.js';
import { DialogRouter } from '/@/plugin/routers/dialog.router.js';
import { DocumentationRouter } from '/@/plugin/routers/documentation.router.js';
import { ExploreFeaturesRouter } from '/@/plugin/routers/explore-features.router.js';
import { ExtensionRouter } from '/@/plugin/routers/extension.router.js';
import { FeedbackRouter } from '/@/plugin/routers/feedback.router.js';
import { HelpMenuRouter } from '/@/plugin/routers/help-menu.router.js';
import { ImageRegistryRouter } from '/@/plugin/routers/image-registry.router.js';
import { LearningCenterRouter } from '/@/plugin/routers/learning-center.router.js';
import { ListOrganizerRouter } from '/@/plugin/routers/list-organizer.router.js';
import { MenuRouter } from '/@/plugin/routers/menu.router.js';
import { NavigationRouter } from '/@/plugin/routers/navigation.router.js';
import { NotificationRouter } from '/@/plugin/routers/notification.router.js';
import { OnboardingRouter } from '/@/plugin/routers/onboarding.router.js';
import { PickerRouter } from '/@/plugin/routers/picker.router.js';
import { PlanetRouter } from '/@/plugin/routers/planet.router.js';
import { ProviderRouter } from '/@/plugin/routers/provider.router.js';
import { ProxyRouter } from '/@/plugin/routers/proxy.router.js';
import { RpcHandler } from '/@/plugin/routers/rpc-handler.js';
import { ShellRouter } from '/@/plugin/routers/shell.router.js';
import { StatusBarRouter } from '/@/plugin/routers/status-bar.router.js';
import { SystemRouter } from '/@/plugin/routers/system.router.js';
import { TasksRouter } from '/@/plugin/routers/tasks.router.js';
import { TelemetryRouter } from '/@/plugin/routers/telemetry.router.js';
import { TempFileRouter } from '/@/plugin/routers/temp-file.router.js';
import { TroubleshootingRouter } from '/@/plugin/routers/troubleshooting.router.js';
import { UiRegistryRouter } from '/@/plugin/routers/ui-registry.router.js';
import { WebviewRouter } from '/@/plugin/routers/webview.router.js';
import { WelcomeRouter } from '/@/plugin/routers/welcome.router.js';

const routersModule = new ContainerModule(options => {
  options.bind<AppRouter>(AppRouter).toSelf().inSingletonScope();
  options.bind<AuthenticationRouter>(AuthenticationRouter).toSelf().inSingletonScope();
  options.bind<CancellationRouter>(CancellationRouter).toSelf().inSingletonScope();
  options.bind<CliToolRouter>(CliToolRouter).toSelf().inSingletonScope();
  options.bind<CommandsRouter>(CommandsRouter).toSelf().inSingletonScope();
  options.bind<ContainerRouter>(ContainerRouter).toSelf().inSingletonScope();
  options.bind<DashboardRouter>(DashboardRouter).toSelf().inSingletonScope();
  options.bind<ConfigurationRouter>(ConfigurationRouter).toSelf().inSingletonScope();
  options.bind<DialogRouter>(DialogRouter).toSelf().inSingletonScope();
  options.bind<DocumentationRouter>(DocumentationRouter).toSelf().inSingletonScope();
  options.bind<ExploreFeaturesRouter>(ExploreFeaturesRouter).toSelf().inSingletonScope();
  options.bind<ExtensionRouter>(ExtensionRouter).toSelf().inSingletonScope();
  options.bind<FeedbackRouter>(FeedbackRouter).toSelf().inSingletonScope();
  options.bind<HelpMenuRouter>(HelpMenuRouter).toSelf().inSingletonScope();
  options.bind<ImageRegistryRouter>(ImageRegistryRouter).toSelf().inSingletonScope();
  options.bind<LearningCenterRouter>(LearningCenterRouter).toSelf().inSingletonScope();
  options.bind<ListOrganizerRouter>(ListOrganizerRouter).toSelf().inSingletonScope();
  options.bind<MenuRouter>(MenuRouter).toSelf().inSingletonScope();
  options.bind<NavigationRouter>(NavigationRouter).toSelf().inSingletonScope();
  options.bind<NotificationRouter>(NotificationRouter).toSelf().inSingletonScope();
  options.bind<OnboardingRouter>(OnboardingRouter).toSelf().inSingletonScope();
  options.bind<PickerRouter>(PickerRouter).toSelf().inSingletonScope();
  options.bind<PlanetRouter>(PlanetRouter).toSelf().inSingletonScope();
  options.bind<ProviderRouter>(ProviderRouter).toSelf().inSingletonScope();
  options.bind<ProxyRouter>(ProxyRouter).toSelf().inSingletonScope();
  options.bind<StatusBarRouter>(StatusBarRouter).toSelf().inSingletonScope();
  options.bind<SystemRouter>(SystemRouter).toSelf().inSingletonScope();
  options.bind<TasksRouter>(TasksRouter).toSelf().inSingletonScope();
  options.bind<TelemetryRouter>(TelemetryRouter).toSelf().inSingletonScope();
  options.bind<TempFileRouter>(TempFileRouter).toSelf().inSingletonScope();
  options.bind<TroubleshootingRouter>(TroubleshootingRouter).toSelf().inSingletonScope();
  options.bind<UiRegistryRouter>(UiRegistryRouter).toSelf().inSingletonScope();
  options.bind<WebviewRouter>(WebviewRouter).toSelf().inSingletonScope();
  options.bind<WelcomeRouter>(WelcomeRouter).toSelf().inSingletonScope();
  options.bind<ShellRouter>(ShellRouter).toSelf().inSingletonScope();

  options.bind<RpcHandler>(RpcHandler).toSelf().inSingletonScope();
});

export { routersModule };
