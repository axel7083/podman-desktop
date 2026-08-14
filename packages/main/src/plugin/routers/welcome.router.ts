import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';
import { Welcome } from '/@/plugin/welcome.js';

const os = implement<typeof contracts.welcome, OrpcContext>(contracts.welcome);

@injectable()
export class WelcomeRouter {
  constructor(@inject(Welcome) private welcome: Welcome) {}

  router: ContractedRouter<typeof contracts.welcome, OrpcContext> = {
    getWelcomeMessages: os.getWelcomeMessages.handler(() => {
      return this.welcome.getWelcomeMessages();
    }),
  };
}
