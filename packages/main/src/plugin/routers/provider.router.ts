import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { ProviderRegistry } from '/@/plugin/provider-registry.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.provider, OrpcContext>(contracts.provider);

@injectable()
export class ProviderRouter {
  constructor(@inject(ProviderRegistry) private providerRegistry: ProviderRegistry) {}

  router: ContractedRouter<typeof contracts.provider, OrpcContext> = {
    getInfos: os.getInfos.handler(() => {
      return this.providerRegistry.getProviderInfos();
    }),
  };
}
