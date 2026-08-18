import { oc, type } from '@orpc/contract';
import type { DocumentationInfo } from '@podman-desktop/core-api';

export const documentationContract = {
  getItems: oc.output(type<DocumentationInfo[]>()),
  refresh: oc.output(type<void>()),
};
