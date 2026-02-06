<script lang="ts">
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons/faExternalLink';
import { Button } from '@podman-desktop/ui-svelte';

import type { ImageSearchResult } from '/@api/image-registry';

interface Props {
  object: ImageSearchResult;
}

let { object: repository }: Props = $props();

function pullImage(): void {
  console.log('not implemented');
}
</script>

<div
  class="rounded-lg border border-[var(--pd-content-bg)] flex flex-col bg-[var(--pd-content-card-bg)] hover:border-[var(--pd-content-card-border-selected)] min-h-40 max-h-40"
  role="group"
  aria-label={repository.name}>
  <div class="p-3 h-full w-full flex flex-col gap-y-4 justify-between">
    <!-- card body -->
    <div class="flex flex-col w-full">
      <div class="flex flex-row items-center gap-x-2">
        <svg class="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" fill="currentColor" opacity="0.2"></polygon>
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
        </svg>
        <div class="flex flex-col">
          <div class="text-(--pd-content-header)">
            {repository.name}
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-y-2 divide-y divide-[var(--pd-content-divider)]">
        {#if repository.description}
          <div class="py-2 text-(--pd-content-text)">
            {repository.description}
          </div>
        {/if}
        <div class="flex">
          <div class="flex flex row justify-between w-full text-(--pd-content-text)">
            <span>Stars</span>
            <span class="flex gap-x-1">
              {repository.star_count}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- card footer -->
    <div class="flex">
      <Button type="primary" class="grow" disabled={true} icon={faDownload} aria-label="Pull" onclick={pullImage}
        >Pull</Button>
    </div>
  </div>
</div>
