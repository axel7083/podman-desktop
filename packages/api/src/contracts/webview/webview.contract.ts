import { oc, type } from '@orpc/contract';
import type { WebviewInfo } from '@podman-desktop/core-api';

export const webviewContract = {
  getPreloadScript: oc.output(type<string>()),
  getRegistryHttpPort: oc.output(type<number>()),
  listWebviews: oc.output(type<WebviewInfo[]>()),
  postMessage: oc.input(type<{ id: string; message: { data: unknown } }>()).output(type<void>()),
  updateState: oc.input(type<{ id: string; state: unknown }>()).output(type<void>()),
  makeDefaultWebviewVisible: oc.input(type<{ webviewId: string }>()).output(type<void>()),
  registerDevTools: oc.input(type<{ webcontentId: number }>()).output(type<void>()),
  cleanupDevTools: oc.input(type<{ webcontentId: number }>()).output(type<void>()),
};
