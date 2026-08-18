import { client } from '/@/client';

type ShellDataHandler = (data: Uint8Array) => void;

export interface ShellOptions {
  engineId: string;
  containerId: string;
}

export class Shell {
  #sessionId: string | undefined;
  #reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  #handler: ShellDataHandler | undefined;
  #closed = false;

  constructor(
    private readonly engineId: string,
    private readonly containerId: string,
  ) {}

  get sessionId(): string | undefined {
    return this.#sessionId;
  }

  get isOpen(): boolean {
    return this.#sessionId !== undefined && !this.#closed;
  }

  async open(): Promise<void> {
    if (this.isOpen) {
      return;
    }

    if (this.#sessionId) {
      throw new Error('Shell cannot be reopened after being closed');
    }

    const result = await client.shell.open({
      engineId: this.engineId,
      containerId: this.containerId,
    });

    this.#sessionId = result.sessionId;
    this.#closed = false;

    this.#read().catch(console.error);
  }

  subscribe(handler: ShellDataHandler): void {
    this.#handler = handler;
  }

  async write(content: string): Promise<void> {
    const sessionId = this.#requireSession();

    await client.shell.write({
      sessionId,
      content,
    });
  }

  async resize(width: number, height: number): Promise<void> {
    const sessionId = this.#requireSession();

    await client.shell.resize({
      sessionId,
      width,
      height,
    });
  }

  async close(): Promise<void> {
    if (!this.#sessionId || this.#closed) {
      return;
    }

    const sessionId = this.#sessionId;

    this.#closed = true;

    try {
      await client.shell.close({ sessionId });
    } finally {
      await this.#reader?.cancel();

      this.#reader?.releaseLock();

      this.#reader = undefined;
      this.#handler = undefined;
      this.#sessionId = undefined;
    }
  }

  async #read(): Promise<void> {
    const sessionId = this.#requireSession();

    try {
      const stream = await client.shell.read({
        sessionId,
      });

      console.log('receive stream res');
      this.#reader = stream.getReader();

      while (!this.#closed) {
        const { done, value } = await this.#reader.read();

        if (done) {
          break;
        }

        console.log('receive value', value);

        this.#handler?.(value);
      }
    } finally {
      this.#reader?.releaseLock();
      this.#reader = undefined;
    }
  }

  #requireSession(): string {
    if (!this.#sessionId || this.#closed) {
      throw new Error('Shell is not open');
    }

    return this.#sessionId;
  }
}
