import { oc, type } from '@orpc/contract';
import type { ItemInfo } from '/@/help-menu.js';

export const helpMenuContract = {
  getItems: oc.output(type<ItemInfo[]>()),
};
