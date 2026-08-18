import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { app } from 'electron';
import { inject, injectable } from 'inversify';

import { CommandRegistry } from '/@/plugin/command-registry.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';
import { Updater } from '/@/plugin/updater.js';
import product from '/@product.json' with { type: 'json' };

const os = implement<typeof contracts.app, OrpcContext>(contracts.app);

@injectable()
export class AppRouter {
  constructor(
    @inject(Updater) private updater: Updater,
    @inject(CommandRegistry) private commandRegistry: CommandRegistry,
  ) {}

  router: ContractedRouter<typeof contracts.app, OrpcContext> = {
    update: os.update.handler(async () => {
      await this.commandRegistry.executeCommand('update');
    }),
    updateAvailable: os.updateAvailable.handler(() => {
      return this.updater.updateAvailable();
    }),
    getReleaseNotes: os.getReleaseNotes.handler(() => {
      return this.updater.getReleaseNotes();
    }),
    getTitleBarText: os.getTitleBarText.handler(() => {
      return product.name;
    }),
    getAppRepository: os.getAppRepository.handler(() => {
      return this.updater.getRepository();
    }),
    getVersion: os.getVersion.handler(() => {
      return app.getVersion();
    }),
  };
}
