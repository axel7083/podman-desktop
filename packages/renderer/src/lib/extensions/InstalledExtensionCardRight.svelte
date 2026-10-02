<script lang="ts">
import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import ExtensionDetailsLink from './ExtensionDetailsLink.svelte';
import ExtensionRestoreBundledButton from './ExtensionRestoreBundledButton.svelte';
import ExtensionUpdateButton from './ExtensionUpdateButton.svelte';

interface Props {
  extension: CombinedExtensionInfoUI;
}

let { extension }: Props = $props();

// the bundled extension replaced by this one, e.g. podman-desktop.kind v1.31.0
let overridden = $derived(extension.overrides ? `${extension.overrides.id} v${extension.overrides.version}` : '');
</script>

<div class="relative px-5 py-2" role="region" aria-label="Extension {extension.name} right actions">
  <ExtensionDetailsLink class="font-bold ml-2" extension={extension} />

  <div class="flex text-[var(--pd-content-text)]">
    {#if extension.description}
      {extension.description}
    {/if}
  </div>
  <div class="absolute bottom-0 flex flex-row items-center gap-4 whitespace-nowrap">
    <div class="flex flex-col text-[var(--pd-content-text)] text-sm">
      <div>
        {#if !extension.removable}
          Pre-installed
        {:else if extension.overrides}
          Overriding {overridden}
        {/if}
      </div>
      <div class="flex flex-row gap-2">
        <div aria-label="Version">
          {#if extension.version}
            v{extension.version}
          {/if}
        </div>
        {#if extension.pinned}
          <div>· Auto-update disabled</div>
        {/if}
      </div>
    </div>
    <ExtensionUpdateButton {extension} />
    <ExtensionRestoreBundledButton {extension} />
  </div>
</div>
