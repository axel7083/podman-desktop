import { oc, type } from '@orpc/contract';
import type { ReleaseNotesInfo } from '@podman-desktop/core-api';

export const appContract = {
  update: oc.output(type<void>()),
  updateAvailable: oc.output(type<boolean>()),
  getReleaseNotes: oc.output(type<ReleaseNotesInfo>()),
  getTitleBarText: oc.output(type<string>()),
  getAppRepository: oc.output(type<string | undefined>()),
  getVersion: oc.output(type<string>()),
};
