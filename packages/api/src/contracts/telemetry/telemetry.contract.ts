import { oc, type } from '@orpc/contract';
import type { TelemetryMessages } from '@podman-desktop/core-api/telemetry';

export const telemetryContract = {
  getTelemetryMessages: oc.output(type<TelemetryMessages>()),
  track: oc.input(type<{ event: string; eventProperties?: unknown }>()).output(type<void>()),
  page: oc.input(type<{ name: string }>()).output(type<void>()),
  configure: oc.output(type<void>()),
};
