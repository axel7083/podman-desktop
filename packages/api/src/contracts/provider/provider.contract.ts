import { oc, type } from '@orpc/contract';
import type { ProviderInfo } from '/@/provider-info.js';

export const providerContract = {
  getInfos: oc.output(type<ProviderInfo[]>()),
};
