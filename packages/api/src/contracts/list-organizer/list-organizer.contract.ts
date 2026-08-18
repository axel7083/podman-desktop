import { oc, type } from '@orpc/contract';
import type { ListOrganizerItem } from '@podman-desktop/core-api';

export const listOrganizerContract = {
  loadListConfig: oc.input(type<{ key: string; availableColumns: string[] }>()).output(type<ListOrganizerItem[]>()),
  saveListConfig: oc.input(type<{ key: string; items: ListOrganizerItem[] }>()).output(type<void>()),
  resetListConfig: oc.input(type<{ key: string; availableColumns: string[] }>()).output(type<ListOrganizerItem[]>()),
};
