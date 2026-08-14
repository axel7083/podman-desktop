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
import { AuthenticationRouter } from '/@/plugin/routers/authentication.router.js';
import { CliToolRouter } from '/@/plugin/routers/cli-tool.router.js';
import { ConfigurationRouter } from '/@/plugin/routers/configuration.router.js';
import { ExtensionRouter } from '/@/plugin/routers/extension.router.js';
import { ImageRegistryRouter } from '/@/plugin/routers/image-registry.router.js';
import { MenuRouter } from '/@/plugin/routers/menu.router.js';
import { NotificationRouter } from '/@/plugin/routers/notification.router.js';
import { PlanetRouter } from '/@/plugin/routers/planet.router.js';
import { ProxyRouter } from '/@/plugin/routers/proxy.router.js';
import { StatusBarRouter } from '/@/plugin/routers/status-bar.router.js';
import { SystemRouter } from '/@/plugin/routers/system.router.js';
import { TasksRouter } from '/@/plugin/routers/tasks.router.js';
import { TempFileRouter } from '/@/plugin/routers/temp-file.router.js';
import { TroubleshootingRouter } from '/@/plugin/routers/troubleshooting.router.js';

export type OrpcContext = Context;

const implementer = implement<typeof contracts>(contracts).$context<OrpcContext>();

@injectable()
export class RpcHandler {
  #handler: RPCHandler<OrpcContext>;

  constructor(
    @inject(IPCMainOn)
    protected readonly ipcHandle: IPCMainOn,
    @inject(AuthenticationRouter)
    readonly authentication: AuthenticationRouter,
    @inject(CliToolRouter)
    readonly cliTool: CliToolRouter,
    @inject(ConfigurationRouter)
    readonly configuration: ConfigurationRouter,
    @inject(ExtensionRouter)
    readonly extension: ExtensionRouter,
    @inject(ImageRegistryRouter)
    readonly imageRegistry: ImageRegistryRouter,
    @inject(MenuRouter)
    readonly menu: MenuRouter,
    @inject(NotificationRouter)
    readonly notification: NotificationRouter,
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
    @inject(TempFileRouter)
    readonly tempFile: TempFileRouter,
    @inject(TroubleshootingRouter)
    readonly troubleshooting: TroubleshootingRouter,
  ) {
    const router = implementer.router({
      authentication: authentication.router,
      cliTool: cliTool.router,
      configuration: configuration.router,
      extension: extension.router,
      imageRegistry: imageRegistry.router,
      menu: menu.router,
      notification: notification.router,
      planet: planet.router,
      proxy: proxy.router,
      statusBar: statusBar.router,
      system: system.router,
      tasks: tasks.router,
      tempFile: tempFile.router,
      troubleshooting: troubleshooting.router,
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
