<script lang="ts">
import {
  NavPage,
  Table,
  TableColumn,
  TableDurationColumn,
  TableRow,
  TableSimpleColumn,
} from '@podman-desktop/ui-svelte';
import moment from 'moment/moment';

import type { SecretInfoUI } from '/@/lib/secrets/SecretInfoUI';
import { secretsInfo } from '/@/stores/secrets';

let searchTerm = $state('');

let secrets: Array<SecretInfoUI> = $derived(
  $secretsInfo
    .map(info => ({
      ...info,
      Name: info.Name ?? '<none>',
      selected: false,
    }))
    .filter(info => info.Name.toLowerCase().includes(searchTerm.toLowerCase())),
);

let nameColumn = new TableColumn<SecretInfoUI, string>('Name', {
  align: 'left',
  renderMapping: (object): string => object.Name,
  renderer: TableSimpleColumn,
  comparator: (a, b): number => a.Name.localeCompare(b.Name),
  initialOrder: 'descending',
});

let createdColumn = new TableColumn<SecretInfoUI, Date | undefined>('CreatedAt', {
  renderMapping: (deployment): Date | undefined => (deployment.CreatedAt ? new Date(deployment.CreatedAt) : undefined),
  renderer: TableDurationColumn,
  comparator: (a, b): number => moment(b.CreatedAt).diff(moment(a.CreatedAt)),
});

const columns = [nameColumn, createdColumn];

const row = new TableRow<SecretInfoUI>({
  selectable(_): boolean {
    return false; // todo
  },
});
</script>

<NavPage bind:searchTerm={searchTerm} title="secrets">
  {#snippet content()}
    <div class="flex min-w-full h-full">
      <Table
        kind="secrets"
        data={secrets}
        columns={columns}
        row={row}
        defaultSortColumn="Id">
      </Table>
    </div>
  {/snippet}
</NavPage>
