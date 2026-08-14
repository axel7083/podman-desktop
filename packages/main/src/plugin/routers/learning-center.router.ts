import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { injectable } from 'inversify';

import { downloadGuideList } from '/@/plugin/learning-center/learning-center.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.learningCenter, OrpcContext>(contracts.learningCenter);

@injectable()
export class LearningCenterRouter {
  router: ContractedRouter<typeof contracts.learningCenter, OrpcContext> = {
    listGuides: os.listGuides.handler(() => {
      return downloadGuideList();
    }),
  };
}
