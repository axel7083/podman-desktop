import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { ExploreFeatures } from '/@/plugin/explore-features/explore-features.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.exploreFeatures, OrpcContext>(contracts.exploreFeatures);

@injectable()
export class ExploreFeaturesRouter {
  constructor(@inject(ExploreFeatures) private exploreFeatures: ExploreFeatures) {}

  router: ContractedRouter<typeof contracts.exploreFeatures, OrpcContext> = {
    listFeatures: os.listFeatures.handler(() => {
      return this.exploreFeatures.downloadFeaturesList();
    }),
    closeFeatureCard: os.closeFeatureCard.handler(({ input }) => {
      return this.exploreFeatures.closeFeatureCard(input.featureId);
    }),
  };
}
