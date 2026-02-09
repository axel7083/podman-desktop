<script lang="ts">
import { SearchInput } from '@podman-desktop/ui-svelte';

import RemoteImageTagList from '/@/lib/image/catalog/RemoteImageTagList.svelte';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';

interface Props {
  readonly registry: string;
  readonly name: string;
}

let { registry, name: image }: Props = $props();

let searchTerm = $derived('');

/**
 * Utils method to generate a unique hash value between 0 and 1.
 */
function hash01(n: number): number {
  n = (n << 13) ^ n;
  return 1 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824;
}
</script>

<DetailsPage title={image} subtitle={registry}>
  {#snippet contentSnippet()}
    <div class="flex flex-col gap-y-4 px-5 py-2 flex-col items-start h-full overflow-auto text-[var(--pd-table-body-text)]">
      <div class="w-full">
        <SearchInput bind:searchTerm={searchTerm} title="Tags" class="mt-4" />
      </div>
      <svelte:boundary>
        {#snippet pending()}
          <ul class="flex flex-col w-full gap-y-1">
            {#each Array.from({ length: 20 }) as _, index (index)}
              <li class="flex items-center bg-[var(--pd-invert-content-card-bg)] rounded-md min-h-10 max-h-10">
                <div class="flex items-center flex-row px-2 py-2 w-full text-[color:var(--pd-invert-content-card-text)] animate-pulse">
                  <div style="width: {5 + hash01(index) * 5}rem" class="h-2 rounded bg-gray-900"></div>
                </div>
              </li>
            {/each}
          </ul>
        {/snippet}
        <RemoteImageTagList searchTerm={searchTerm} registry={registry} name={image}/>
      </svelte:boundary>
    </div>
  {/snippet}
</DetailsPage>
