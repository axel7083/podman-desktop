import { oc, type } from '@orpc/contract';
import type { SystemOverviewStatusInfo } from '/@/system-overview-info.js';

export const dashboardContract = {
  getSystemOverviewStatus: oc.output(type<SystemOverviewStatusInfo>()),
};
