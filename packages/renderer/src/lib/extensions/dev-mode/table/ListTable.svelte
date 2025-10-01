<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, TableColumn, TableRow, TableSimpleColumn } from '@podman-desktop/ui-svelte';
import { SvelteSet } from 'svelte/reactivity';

import { withBulkConfirmation } from '/@/lib/actions/BulkActions';
import type { SelectableExtensionDevelopmentFolderInfoUI } from '/@/lib/extensions/dev-mode/development-folder-info-ui';
import DevelopmentExtensionTableActionsColumn from '/@/lib/extensions/dev-mode/table/ActionsColumn.svelte';
import TableSvelte5 from '/@/lib/table/TableSvelte5.svelte';

interface Props {
  selected?: SvelteSet<string>;
  extensionFolderUIInfos: SelectableExtensionDevelopmentFolderInfoUI[];
}

let { extensionFolderUIInfos, selected = $bindable(new SvelteSet()) }: Props = $props();

const nameColumn = new TableColumn<SelectableExtensionDevelopmentFolderInfoUI, string>('Name', {
  width: '3fr',
  renderer: TableSimpleColumn,
  renderMapping: (extensionFolder): string => extensionFolder.name,
  comparator: (a, b): number => a.name.localeCompare(b.name),
});

const extensionNameColumn = new TableColumn<SelectableExtensionDevelopmentFolderInfoUI, string>('Extension', {
  width: '2fr',
  renderer: TableSimpleColumn,
  renderMapping: (extensionFolder): string => extensionFolder.extension?.name ?? 'Unknown',
  comparator: (a, b): number => a.name.localeCompare(b.name),
});
const extensionStateColumn = new TableColumn<SelectableExtensionDevelopmentFolderInfoUI, string>('State', {
  width: '2fr',
  renderer: TableSimpleColumn,
  renderMapping: (extensionFolder): string => extensionFolder.extension?.state ?? '',
  comparator: (a, b): number => a.name.localeCompare(b.name),
});
const actionsColumn = new TableColumn<SelectableExtensionDevelopmentFolderInfoUI>('Actions', {
  align: 'right',
  width: '150px',
  renderer: DevelopmentExtensionTableActionsColumn,
  overflow: true,
});

const columns = [nameColumn, extensionNameColumn, extensionStateColumn, actionsColumn];

const row = new TableRow<SelectableExtensionDevelopmentFolderInfoUI>({
  selectable: (): boolean => true,
});

function deleteSelectedFolders(): void {}
let bulkDeleteInProgress = false;

/**
 * Utility function for the Table to get the key to use for each item
 */
function key(folder: SelectableExtensionDevelopmentFolderInfoUI): string {
  return folder.name;
}

/**
 * Utility function for the Table to get the label to display for each item
 */
function label(folder: SelectableExtensionDevelopmentFolderInfoUI): string {
  return folder.name;
}
</script>

<TableSvelte5
  kind="extensions"
  data={extensionFolderUIInfos}
  {columns}
  {row}
  bind:selected={selected}
  defaultSortColumn="Name"
  key={key}
  label={label}
>
</TableSvelte5>

<div class="h-5 px-6 mb-2">
  {#if selected.size > 0}
    <Button
      on:click={(): void =>
        withBulkConfirmation(
          deleteSelectedFolders,
          `Untrack loading extension from ${selected.size} folder${selected.size > 1 ? 's' : ''}`,
        )}
      title="Untrack {selected.size} selected items"
      inProgress={bulkDeleteInProgress}
      icon={faTrash} />
    <span>On {selected.size} selected items.</span>
  {:else}
    <div>&nbsp;</div>
  {/if}
</div>
