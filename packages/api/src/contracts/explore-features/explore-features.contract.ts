import { oc, type } from '@orpc/contract';
import type { ExploreFeature } from '@podman-desktop/core-api';

export const exploreFeaturesContract = {
  listFeatures: oc.output(type<ExploreFeature[]>()),
  closeFeatureCard: oc.input(type<{ featureId: string }>()).output(type<void>()),
};
