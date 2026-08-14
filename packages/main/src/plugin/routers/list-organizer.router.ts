import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { ListOrganizerRegistry } from '/@/plugin/list-organizer.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.listOrganizer, OrpcContext>(contracts.listOrganizer);

@injectable()
export class ListOrganizerRouter {
  constructor(@inject(ListOrganizerRegistry) private listOrganizerRegistry: ListOrganizerRegistry) {}

  router: ContractedRouter<typeof contracts.listOrganizer, OrpcContext> = {
    loadListConfig: os.loadListConfig.handler(({ input }) => {
      return this.listOrganizerRegistry.loadListConfig(input.key, input.availableColumns);
    }),
    saveListConfig: os.saveListConfig.handler(({ input }) => {
      return this.listOrganizerRegistry.saveListConfig(input.key, input.items);
    }),
    resetListConfig: os.resetListConfig.handler(({ input }) => {
      return this.listOrganizerRegistry.resetListConfig(input.key, input.availableColumns);
    }),
  };
}
