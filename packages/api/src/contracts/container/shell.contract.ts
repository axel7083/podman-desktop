import { oc, type } from '@orpc/contract';

export const shellContract = {
  open: oc
    .input(
      type<{
        engineId: string;
        containerId: string;
      }>(),
    )
    .output(type<{ sessionId: string }>()),

  read: oc.input(type<{ sessionId: string }>()).output(type<ReadableStream<Uint8Array<ArrayBufferLike>>>()),
  write: oc
    .input(
      type<{
        sessionId: string;
        content: string;
      }>(),
    )
    .output(type<void>()),
  resize: oc
    .input(
      type<{
        sessionId: string;
        width: number;
        height: number;
      }>(),
    )
    .output(type<void>()),

  close: oc
    .input(
      type<{
        sessionId: string;
      }>(),
    )
    .output(type<void>()),
};
