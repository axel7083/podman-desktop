<script lang="ts">
import { NavPage } from '@podman-desktop/ui-svelte';

import ContainerConnectionDropdown from '/@/lib/forms/ContainerConnectionDropdown.svelte';
import ImageGrid from '/@/lib/image/catalog/RemoteImageGrid.svelte';
import { providerInfos } from '/@/stores/providers';
import type { ProviderContainerConnectionInfo } from '/@api/provider-info';

let searchTerm: string = $state('');

let providerConnections = $derived(
  $providerInfos
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started'),
);

let selectedProviderConnection: ProviderContainerConnectionInfo | undefined = $state<ProviderContainerConnectionInfo>();
</script>

<NavPage bind:searchTerm={searchTerm} title="Image catalog">
  {#snippet additionalActions()}
    {#if providerConnections.length > 1}
      <div class="flex items-center">
        <ContainerConnectionDropdown
          id="providerChoice"
          class="w-[200px]"
          name="providerChoice"
          bind:value={selectedProviderConnection}
          connections={providerConnections} />
      </div>
    {/if}
  {/snippet}
  {#snippet content()}
    <div class="flex flex-col grow">
      <ImageGrid searchTerm={searchTerm} />
    </div>
  {/snippet}
</NavPage>
