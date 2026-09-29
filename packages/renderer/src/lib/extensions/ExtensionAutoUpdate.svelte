<script lang="ts">
import { Button } from '@podman-desktop/ui-svelte';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

interface Props {
  extension: Pick<CombinedExtensionInfoUI, 'id' | 'type' | 'removable' | 'pinned'>;
}

let { extension }: Props = $props();

let inProgress = $state(false);

async function togglePinned(): Promise<void> {
  inProgress = true;
  try {
    await window.setExtensionPinned(extension.id, !extension.pinned);
  } finally {
    inProgress = false;
  }
}
</script>

<!-- only extensions installed by the user are updated -->
{#if extension.type === 'pd' && extension.removable}
  <div class="flex flex-col lg:mb-4 items-start" role="region" aria-label="Auto-update">
    <div class="uppercase text-sm text-[var(--pd-details-card-header)]">auto-update</div>
    <div class="flex flex-row items-center gap-2 font-thin text-sm text-[var(--pd-details-card-text)]">
      <span>{extension.pinned ? 'Disabled' : 'Enabled'}</span>
      <Button type="link" padding="px-0" {inProgress} onclick={togglePinned}>{extension.pinned ? 'Enable' : 'Disable'}</Button>
    </div>
  </div>
{/if}
