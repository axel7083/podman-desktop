import { oc, type } from '@orpc/contract';

export const cancellationContract = {
  createTokenSource: oc.output(type<number>()),
  cancelToken: oc.input(type<{ id: number }>()).output(type<void>()),
};
