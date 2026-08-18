import path from 'node:path';

import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';
import { WebviewRegistry } from '/@/plugin/webview/webview-registry.js';

const os = implement<typeof contracts.webview, OrpcContext>(contracts.webview);

@injectable()
export class WebviewRouter {
  constructor(@inject(WebviewRegistry) private webviewRegistry: WebviewRegistry) {}

  router: ContractedRouter<typeof contracts.webview, OrpcContext> = {
    getPreloadScript: os.getPreloadScript.handler(() => {
      const preloadScriptPath = path.join(__dirname, '../../preload-webview/dist/index.cjs');
      return `file://${preloadScriptPath}`;
    }),
    getRegistryHttpPort: os.getRegistryHttpPort.handler(() => {
      return this.webviewRegistry.getRegistryHttpPort();
    }),
    listWebviews: os.listWebviews.handler(() => {
      return this.webviewRegistry.listWebviews() as never;
    }),
    postMessage: os.postMessage.handler(({ input }) => {
      return this.webviewRegistry.postMessageToWebview(input.id, input.message);
    }),
    updateState: os.updateState.handler(({ input }) => {
      return this.webviewRegistry.updateWebviewState(input.id, input.state);
    }),
    makeDefaultWebviewVisible: os.makeDefaultWebviewVisible.handler(({ input }) => {
      return this.webviewRegistry.makeDefaultWebviewVisible(input.webviewId);
    }),
    registerDevTools: os.registerDevTools.handler(({ input }) => {
      return this.webviewRegistry.registerWebviewDevTools(input.webcontentId);
    }),
    cleanupDevTools: os.cleanupDevTools.handler(({ input }) => {
      return this.webviewRegistry.cleanupWebviewDevTools(input.webcontentId);
    }),
  };
}
