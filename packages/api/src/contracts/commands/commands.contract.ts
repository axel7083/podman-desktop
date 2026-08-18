import { oc, type } from '@orpc/contract';
import type { CommandInfo, CommandPaletteSearchOption } from '@podman-desktop/core-api';

export const commandsContract = {
  getCommandPaletteCommands: oc.output(type<CommandInfo[]>()),
  getCommandPaletteSearchOptions: oc.output(type<CommandPaletteSearchOption[]>()),
};
