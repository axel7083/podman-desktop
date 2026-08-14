import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { DocumentationService } from '/@/plugin/documentation/documentation-service.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.documentation, OrpcContext>(contracts.documentation);

@injectable()
export class DocumentationRouter {
  constructor(@inject(DocumentationService) private documentationService: DocumentationService) {}

  router: ContractedRouter<typeof contracts.documentation, OrpcContext> = {
    getItems: os.getItems.handler(() => {
      return this.documentationService.getDocumentationItems();
    }),
    refresh: os.refresh.handler(() => {
      return this.documentationService.refreshDocumentation();
    }),
  };
}
