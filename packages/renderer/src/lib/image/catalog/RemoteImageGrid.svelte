<script lang="ts">
import { EmptyScreen, FilteredEmptyScreen } from '@podman-desktop/ui-svelte';

import ImageSearchResultCard from '/@/lib/image/catalog/cards/RemoteImageCard.svelte';
import type { RemoteImageInfo } from '/@/lib/image/catalog/remote-image-info';
import Skeleton from '/@/lib/image/catalog/skeletons/RemoteImageCardSkeleton.svelte';
import ImageIcon from '/@/lib/images/ImageIcon.svelte';
import type { ImageSearchOptions, ImageSearchResult } from '/@api/image-registry';

interface Props {
  readonly searchTerm: string;
  onResetFilter(): void;
}

const DOCKER_PREFIX = 'docker.io';

// Get the preferred registries from configuration
let preferredRegistries = $state<string[]>([DOCKER_PREFIX]);

let { searchTerm, onResetFilter }: Props = $props();

async function search(value: string): Promise<RemoteImageInfo[]> {
  if (value.length < 2) return [];

  if (!value.includes('/')) {
    const results = await Promise.allSettled(
      preferredRegistries.map(async registry => {
        const options: ImageSearchOptions = {
          registry: registry,
          query: value,
        };
        const results: Array<ImageSearchResult> = await window.searchImageInRegistry(options);
        return results.map(item => ({
          ...item,
          registry: registry,
        }));
      }),
    );

    return results.reduce((accumulator, current) => {
      if (current.status === 'fulfilled') {
        accumulator.push(...current.value);
      }
      return accumulator;
    }, [] as RemoteImageInfo[]);
  } else {
    // User specified a registry in the search term
    const [registry, ...rest] = value.split('/');
    const options: ImageSearchOptions = {
      registry: registry,
      query: rest.join('/'),
    };
    const results: Array<ImageSearchResult> = await window.searchImageInRegistry(options);
    return results.map(item => ({
      ...item,
      registry: registry,
    }));
  }
}

const repositories: RemoteImageInfo[] = $derived(await search(searchTerm));
</script>

<div class="flex flex-col w-full h-full px-5 py-3">
  <div
    class="w-full h-full"
    role="region">
    {#if $effect.pending()}
      <div class="grid min-[920px]:grid-cols-2 min-[1180px]:grid-cols-3 gap-3">
        {#each Array.from({ length: 10 }) as _, index (index)}
          <Skeleton/>
        {/each}
      </div>
    {:else}
      {#if repositories.length === 0}
        <div class="w-full h-full flex items-center justify-center">
          {#if searchTerm.length > 0}
            <FilteredEmptyScreen icon={ImageIcon} kind="images" searchTerm={searchTerm} onResetFilter={onResetFilter} />
          {:else}
            <EmptyScreen icon={ImageIcon} message="Search for an image to get started" title="Image catalog"/>
          {/if}
        </div>
      {:else}
        <div class="grid min-[920px]:grid-cols-2 min-[1180px]:grid-cols-3 gap-3">
          {#each repositories as repository, index (index)}
            <ImageSearchResultCard object={repository}/>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>
