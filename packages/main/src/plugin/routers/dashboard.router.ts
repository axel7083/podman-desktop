import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { DashboardService } from '/@/plugin/dashboard/dashboard-service.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.dashboard, OrpcContext>(contracts.dashboard);

@injectable()
export class DashboardRouter {
  constructor(@inject(DashboardService) private dashboardService: DashboardService) {}

  router: ContractedRouter<typeof contracts.dashboard, OrpcContext> = {
    getSystemOverviewStatus: os.getSystemOverviewStatus.handler(() => {
      return this.dashboardService.getStatus();
    }),
  };
}
