import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { HelpMenu } from '/@/plugin/help-menu/help-menu.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.helpMenu, OrpcContext>(contracts.helpMenu);

@injectable()
export class HelpMenuRouter {
  constructor(@inject(HelpMenu) private helpMenu: HelpMenu) {}

  router: ContractedRouter<typeof contracts.helpMenu, OrpcContext> = {
    getItems: os.getItems.handler(() => {
      return this.helpMenu.getItems();
    }),
  };
}
