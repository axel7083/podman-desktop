import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { CancellationTokenRegistry } from '/@/plugin/cancellation-token-registry.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.cancellation, OrpcContext>(contracts.cancellation);

@injectable()
export class CancellationRouter {
  constructor(@inject(CancellationTokenRegistry) private registry: CancellationTokenRegistry) {}

  router: ContractedRouter<typeof contracts.cancellation, OrpcContext> = {
    createTokenSource: os.createTokenSource.handler(() => {
      return this.registry.createCancellationTokenSource();
    }),
    cancelToken: os.cancelToken.handler(({ input }) => {
      const tokenSource = this.registry.getCancellationTokenSource(input.id);
      if (!tokenSource?.token.isCancellationRequested) {
        tokenSource?.dispose(true);
      }
    }),
  };
}
