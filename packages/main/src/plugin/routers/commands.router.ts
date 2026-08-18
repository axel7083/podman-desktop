import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { CommandRegistry } from '/@/plugin/command-registry.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.commands, OrpcContext>(contracts.commands);

@injectable()
export class CommandsRouter {
  constructor(@inject(CommandRegistry) private commandRegistry: CommandRegistry) {}

  router: ContractedRouter<typeof contracts.commands, OrpcContext> = {
    getCommandPaletteCommands: os.getCommandPaletteCommands.handler(() => {
      return this.commandRegistry.getCommandPaletteCommands();
    }),
    getCommandPaletteSearchOptions: os.getCommandPaletteSearchOptions.handler(() => {
      return this.commandRegistry.getCommandPaletteSearchOptions();
    }),
  };
}
