import { oc, type } from '@orpc/contract';
import type { WelcomeMessages } from '@podman-desktop/core-api';

export const welcomeContract = {
  getWelcomeMessages: oc.output(type<WelcomeMessages>()),
};
