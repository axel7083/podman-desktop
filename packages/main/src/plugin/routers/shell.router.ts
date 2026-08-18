import type { ContractedRouter } from '@orpc/server';
import { implement } from '@orpc/server';
import { contracts } from '@podman-desktop/core-api';
import { inject, injectable } from 'inversify';

import { ContainerProviderRegistry } from '/@/plugin/container-registry.js';
import type { OrpcContext } from '/@/plugin/routers/rpc-handler.js';

const os = implement<typeof contracts.shell, OrpcContext>(contracts.shell);

interface ShellSession {
  calls: {
    write: (param: string) => void;
    resize: (w: number, h: number) => void;
  };
  abortController: AbortController;
  stream: ReadableStream<Uint8Array<ArrayBufferLike>>;
}

@injectable()
export class ShellRouter {
  #sessions: Map<string, ShellSession> = new Map();

  #counter: number = 0;

  constructor(@inject(ContainerProviderRegistry) private containerProviderRegistry: ContainerProviderRegistry) {}

  protected sessionId(): string {
    return String(this.#counter++);
  }

  protected closeSession(sessionId: string): void {
    const session = this.#sessions.get(sessionId);

    if (!session) {
      return;
    }

    this.#sessions.delete(sessionId);
    session.abortController.abort();
  }

  router: ContractedRouter<typeof contracts.shell, OrpcContext> = {
    open: os.open.handler(async ({ input }) => {
      const sessionId = this.sessionId();
      const abortController = new AbortController();

      let controller!: ReadableStreamDefaultController<Uint8Array<ArrayBufferLike>>;

      const closeSession = this.closeSession.bind(this, sessionId);
      const stream = new ReadableStream<Uint8Array<ArrayBufferLike>>({
        start(c): void {
          controller = c;
        },

        cancel(): void {
          closeSession();
        },
      });

      const invocation = await this.containerProviderRegistry.shellInContainer(
        input.engineId,
        input.containerId,

        (content: Buffer) => {
          controller.enqueue(new Uint8Array(content));
        },

        (error: string) => {
          controller.error(new Error(error));
          this.closeSession(sessionId);
        },

        () => {
          controller.close();
          this.closeSession(sessionId);
        },

        abortController.signal,
      );

      this.#sessions.set(sessionId, {
        calls: invocation,
        abortController,
        stream,
      });

      return { sessionId };
    }),
    read: os.read.handler(async ({ input }) => {
      const session = this.#sessions.get(input.sessionId);

      if (!session) {
        throw new Error(`Shell session not found: ${input.sessionId}`);
      }

      return session.stream;
    }),
    write: os.write.handler(async ({ input }) => {
      const session = this.#sessions.get(input.sessionId);

      if (!session) {
        throw new Error(`Shell session not found: ${input.sessionId}`);
      }

      console.log('write content', input.content);
      session.calls.write(input.content);
    }),
    resize: os.resize.handler(async ({ input }) => {
      const session = this.#sessions.get(input.sessionId);

      if (!session) {
        throw new Error(`Shell session not found: ${input.sessionId}`);
      }

      console.log('resizing');
      session.calls.resize(input.width, input.height);
    }),
    close: os.close.handler(async ({ input }) => {
      this.closeSession(input.sessionId);
    }),
  };
}
