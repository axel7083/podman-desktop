import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { injectable } from 'inversify';

import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.navigation, OrpcContext>(contracts.navigation);

@injectable()
export class NavigationRouter {
  router: ContractedRouter<typeof contracts.navigation, OrpcContext> = {
    sendItems: os.sendItems.handler(() => {
      // No-op in headless/web mode. In Electron, the tray menu
      // builder listens on the legacy IPC channel separately.
    }),
  };
}
