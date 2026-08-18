import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { OnboardingRegistry } from '/@/plugin/onboarding-registry.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.onboarding, OrpcContext>(contracts.onboarding);

@injectable()
export class OnboardingRouter {
  constructor(@inject(OnboardingRegistry) private onboardingRegistry: OnboardingRegistry) {}

  router: ContractedRouter<typeof contracts.onboarding, OrpcContext> = {
    listOnboarding: os.listOnboarding.handler(() => {
      return this.onboardingRegistry.listOnboarding();
    }),
    getOnboarding: os.getOnboarding.handler(({ input }) => {
      return this.onboardingRegistry.getOnboarding(input.extension);
    }),
    updateStepState: os.updateStepState.handler(({ input }) => {
      return this.onboardingRegistry.updateStepState(input.status, input.extension, input.stepId);
    }),
    resetOnboarding: os.resetOnboarding.handler(({ input }) => {
      return this.onboardingRegistry.resetOnboarding(input.extensions);
    }),
  };
}
