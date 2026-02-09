<script lang="ts">
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';
import { faMedal } from '@fortawesome/free-solid-svg-icons/faMedal';
import { faStar } from '@fortawesome/free-solid-svg-icons/faStar';
import { Button } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { router } from 'tinro';

import type { RemoteImageInfo } from '/@/lib/image/catalog/remote-image-info';

interface Props {
  object: RemoteImageInfo;
}

let { object: repository }: Props = $props();

async function pullLatest(): Promise<void> {}

async function openDetails(): Promise<void> {
  router.goto(
    `/images/remote/details?registry=${encodeURIComponent(repository.registry)}&name=${encodeURIComponent(repository.name)}`,
  );
}
</script>

<div
  class="rounded-lg border border-[var(--pd-content-bg)] flex flex-col bg-[var(--pd-content-card-bg)] hover:border-[var(--pd-content-card-border-selected)] min-h-40 max-h-40"
  role="group"
  aria-label={repository.name}>
  <div class="p-3 h-full w-full flex flex-col gap-y-4 justify-between  divide-y divide-[var(--pd-content-divider)]">
    <!-- card body -->
    <div class="flex flex-col w-full gap-y-2 grow">

      <!-- icon + name + description -->
      <div class="flex flex-col gap-y-2 pb-2">
        <div class="flex flex-row items-center gap-x-2">
          <svg class="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" fill="currentColor" opacity="0.2"></polygon>
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
          </svg>
          <div class="flex flex-row grow items-center gap-x-1">
            <div class="flex flex-col">
              <div class="text-(--pd-content-header)">
                {repository.name}
              </div>
              <span class="text-[var(--pd-content-text)]">{repository.registry}</span>
            </div>
          </div>

          <div class="flex flex-row items-center gap-x-1 text-sm text-[var(--pd-content-text)]">
            {#if repository.is_official}
              <div class="text-[#538dd7]">
                <Icon icon={faMedal}></Icon>
              </div>
            {/if}
            <Icon icon={faStar}></Icon>
            <span>{repository.star_count}</span>
          </div>
        </div>


        {#if repository.description}
          <div class="text-(--pd-content-text) line-clamp-2 overflow-hidden">
            {repository.description}
          </div>
        {/if}
      </div>
    </div>

    <!-- card footer -->
    <div class="flex w-full justify-end gap-x-2">
      <Button type="primary" disabled={true} icon={faDownload} aria-label="Pull latest" onclick={pullLatest}>Pull latest</Button>

      <Button type="link" aria-label="More details" onclick={openDetails}>More details</Button>
    </div>
  </div>
</div>
