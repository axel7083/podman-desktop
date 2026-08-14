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
import { Context, implement, onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/message-port';
import { contracts, ORPC_START_CHANNEL } from '@podman-desktop/core-api';
import { Container as InversifyContainer, inject, injectable } from 'inversify';

import { IPCMainOn } from '/@/plugin/api.js';
import { AppRouter } from '/@/plugin/routers/app.router.js';
import { AuthenticationRouter } from '/@/plugin/routers/authentication.router.js';
import { CancellationRouter } from '/@/plugin/routers/cancellation.router.js';
import { CliToolRouter } from '/@/plugin/routers/cli-tool.router.js';
import { CommandsRouter } from '/@/plugin/routers/commands.router.js';
import { ConfigurationRouter } from '/@/plugin/routers/configuration.router.js';
import { DialogRouter } from '/@/plugin/routers/dialog.router.js';
import { DocumentationRouter } from '/@/plugin/routers/documentation.router.js';
import { ExploreFeaturesRouter } from '/@/plugin/routers/explore-features.router.js';
import { ExtensionRouter } from '/@/plugin/routers/extension.router.js';
import { FeedbackRouter } from '/@/plugin/routers/feedback.router.js';
import { ImageRegistryRouter } from '/@/plugin/routers/image-registry.router.js';
import { LearningCenterRouter } from '/@/plugin/routers/learning-center.router.js';
import { MenuRouter } from '/@/plugin/routers/menu.router.js';
import { NotificationRouter } from '/@/plugin/routers/notification.router.js';
import { OnboardingRouter } from '/@/plugin/routers/onboarding.router.js';
import { PickerRouter } from '/@/plugin/routers/picker.router.js';
import { PlanetRouter } from '/@/plugin/routers/planet.router.js';
import { ProxyRouter } from '/@/plugin/routers/proxy.router.js';
import { StatusBarRouter } from '/@/plugin/routers/status-bar.router.js';
import { SystemRouter } from '/@/plugin/routers/system.router.js';
import { TasksRouter } from '/@/plugin/routers/tasks.router.js';
import { TelemetryRouter } from '/@/plugin/routers/telemetry.router.js';
import { TempFileRouter } from '/@/plugin/routers/temp-file.router.js';
import { TroubleshootingRouter } from '/@/plugin/routers/troubleshooting.router.js';
import { UiRegistryRouter } from '/@/plugin/routers/ui-registry.router.js';
import { WelcomeRouter } from '/@/plugin/routers/welcome.router.js';

export type OrpcContext = Context;

const implementer = implement<typeof contracts>(contracts).$context<OrpcContext>();

@injectable()
export class RpcHandler {
  #handler: RPCHandler<OrpcContext>;

  constructor(
    @inject(IPCMainOn)
    protected readonly ipcHandle: IPCMainOn,
    @inject(AppRouter)
    readonly app: AppRouter,
    @inject(AuthenticationRouter)
    readonly authentication: AuthenticationRouter,
    @inject(CancellationRouter)
    readonly cancellation: CancellationRouter,
    @inject(CliToolRouter)
    readonly cliTool: CliToolRouter,
    @inject(CommandsRouter)
    readonly commands: CommandsRouter,
    @inject(ConfigurationRouter)
    readonly configuration: ConfigurationRouter,
    @inject(DialogRouter)
    readonly dialog: DialogRouter,
    @inject(DocumentationRouter)
    readonly documentation: DocumentationRouter,
    @inject(ExploreFeaturesRouter)
    readonly exploreFeatures: ExploreFeaturesRouter,
    @inject(ExtensionRouter)
    readonly extension: ExtensionRouter,
    @inject(FeedbackRouter)
    readonly feedback: FeedbackRouter,
    @inject(ImageRegistryRouter)
    readonly imageRegistry: ImageRegistryRouter,
    @inject(LearningCenterRouter)
    readonly learningCenter: LearningCenterRouter,
    @inject(MenuRouter)
    readonly menu: MenuRouter,
    @inject(NotificationRouter)
    readonly notification: NotificationRouter,
    @inject(OnboardingRouter)
    readonly onboarding: OnboardingRouter,
    @inject(PickerRouter)
    readonly picker: PickerRouter,
    @inject(PlanetRouter)
    readonly planet: PlanetRouter,
    @inject(ProxyRouter)
    readonly proxy: ProxyRouter,
    @inject(StatusBarRouter)
    readonly statusBar: StatusBarRouter,
    @inject(SystemRouter)
    readonly system: SystemRouter,
    @inject(TasksRouter)
    readonly tasks: TasksRouter,
    @inject(TelemetryRouter)
    readonly telemetry: TelemetryRouter,
    @inject(TempFileRouter)
    readonly tempFile: TempFileRouter,
    @inject(TroubleshootingRouter)
    readonly troubleshooting: TroubleshootingRouter,
    @inject(UiRegistryRouter)
    readonly uiRegistry: UiRegistryRouter,
    @inject(WelcomeRouter)
    readonly welcome: WelcomeRouter,
  ) {
    const router = implementer.router({
      app: app.router,
      authentication: authentication.router,
      cancellation: cancellation.router,
      cliTool: cliTool.router,
      commands: commands.router,
      configuration: configuration.router,
      dialog: dialog.router,
      documentation: documentation.router,
      exploreFeatures: exploreFeatures.router,
      extension: extension.router,
      feedback: feedback.router,
      imageRegistry: imageRegistry.router,
      learningCenter: learningCenter.router,
      menu: menu.router,
      notification: notification.router,
      onboarding: onboarding.router,
      picker: picker.router,
      planet: planet.router,
      proxy: proxy.router,
      statusBar: statusBar.router,
      system: system.router,
      tasks: tasks.router,
      telemetry: telemetry.router,
      tempFile: tempFile.router,
      troubleshooting: troubleshooting.router,
      uiRegistry: uiRegistry.router,
      welcome: welcome.router,
    });

    this.#handler = new RPCHandler(router, {
      interceptors: [
        onError(error => {
          console.error(error);
          throw error;
        }),
      ],
    });
  }

  init(container: InversifyContainer): void {
    this.ipcHandle(ORPC_START_CHANNEL, event => {
      const [serverPort] = event.ports;
      if (!serverPort) {
        throw new Error('No server port provided');
      }
      this.#handler.upgrade(serverPort, {
        context: {
          container,
        },
      });
      serverPort.start();
    });
  }
}
