import { oc, type } from '@orpc/contract';

export const navigationContract = {
  sendItems: oc.input(type<{ items: { name: string; visible: boolean }[] }>()).output(type<void>()),
};
