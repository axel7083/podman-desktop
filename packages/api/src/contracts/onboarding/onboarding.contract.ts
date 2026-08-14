import { oc, type } from '@orpc/contract';
import type { OnboardingInfo, OnboardingStatus } from '@podman-desktop/core-api';

export const onboardingContract = {
  listOnboarding: oc.output(type<OnboardingInfo[]>()),
  getOnboarding: oc.input(type<{ extension: string }>()).output(type<OnboardingInfo | undefined>()),
  updateStepState: oc
    .input(type<{ status: OnboardingStatus; extension: string; stepId?: string }>())
    .output(type<void>()),
  resetOnboarding: oc.input(type<{ extensions: string[] }>()).output(type<void>()),
};
