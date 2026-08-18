import { oc, type } from '@orpc/contract';
import type { Guide } from '@podman-desktop/core-api/learning-center';

export const learningCenterContract = {
  listGuides: oc.output(type<Guide[]>()),
};
