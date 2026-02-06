<script lang="ts">
  import {
    NavPage,
  } from '@podman-desktop/ui-svelte';
  import { providerInfos } from '/@/stores/providers';
  import ContainerConnectionDropdown from '/@/lib/forms/ContainerConnectionDropdown.svelte';
  import type { ProviderContainerConnectionInfo } from '/@api/provider-info';
  import type { ImageSearchOptions, ImageSearchResult } from '/@api/image-registry';
  import ImageSearchResultCard from '/@/lib/image/ImageSearchResultCard.svelte';

  const DOCKER_PREFIX = 'docker.io';

  // Get the preferred registries from configuration
  let preferredRegistries = $state<string[]>([DOCKER_PREFIX]);

  let searchTerm: string = $state('');

  let providerConnections = $derived(
    $providerInfos
      .map(provider => provider.containerConnections)
      .flat()
      .filter(providerContainerConnection => providerContainerConnection.status === 'started'),
  );

  let selectedProviderConnection: ProviderContainerConnectionInfo | undefined = $state<ProviderContainerConnectionInfo>();

  async function search(value: string): Promise<ImageSearchResult[]> {
    if (value.length < 2) return [];

    if (!value.includes('/')) {
      const results = await Promise.allSettled(
        preferredRegistries.map(async (registry) => {
          const options: ImageSearchOptions = {
            registry: registry,
            query: value,
          };
          return window.searchImageInRegistry(options);
        }),
      );

      return results.reduce((accumulator, current) => {
        if (current.status === 'fulfilled') {
          accumulator.push(...current.value);
        }
        return accumulator;
      }, [] as ImageSearchResult[]);
    } else {
      // User specified a registry in the search term
      const [registry, ...rest] = value.split('/');
      const options: ImageSearchOptions = {
        registry: registry,
        query: rest.join('/'),
      };
      return await window.searchImageInRegistry(options);
    }
  }

  const repositories: ImageSearchResult[] = $derived(await search(searchTerm));
</script>

<NavPage bind:searchTerm={searchTerm} title="Catalog">
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
    <div class="flex flex-col grow px-5 py-3">
      <div class="flex flex-col w-full">
        <div
          class="grid min-[920px]:grid-cols-2 min-[1180px]:grid-cols-3 gap-3"
          role="region">
          {#each repositories as repository}
            <ImageSearchResultCard object={repository}/>
          {/each}
        </div>
      </div>
    </div>
  {/snippet}
</NavPage>
