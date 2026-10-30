<script lang="ts">
import CopyIcon from '@lucide/svelte/icons/copy';
import MinusIcon from '@lucide/svelte/icons/minus';
import XIcon from '@lucide/svelte/icons/x';

import logo from '#lib/assets/podman-desktop.svg';

let { platform }: { platform: string } = $props();

// macOS draws its own window buttons (traffic lights) at the left of the title bar
let isMac = $derived(platform === 'darwin');

const BUTTON = 'flex h-full w-11 items-center justify-center text-foreground';
</script>

<header class="drag-region flex h-titlebar shrink-0 items-center bg-chrome text-foreground">
  <!-- the platform is fetched once the page is loaded: wait for it to know which side the window buttons are on -->
  <div class={['flex flex-1 items-center gap-2', isMac ? 'pl-20' : 'pl-3']}>
    {#if platform}
      <img src={logo} alt="" class="size-5" />
      <span class="text-sm font-semibold">Podman Desktop</span>
    {/if}
  </div>
  {#if platform && !isMac}
    <div class="no-drag-region flex h-full">
      <button class={[BUTTON, 'hover:bg-chrome-hover']} aria-label="Minimize" onclick={(): Promise<void> => window.windowMinimize()}>
        <MinusIcon class="size-4" />
      </button>
      <button class={[BUTTON, 'hover:bg-chrome-hover']} aria-label="Maximize" onclick={(): Promise<void> => window.windowMaximize()}>
        <CopyIcon class="size-3.5" />
      </button>
      <button class={[BUTTON, 'hover:bg-destructive hover:text-primary-foreground']} aria-label="Close" onclick={(): Promise<void> => window.windowClose()}>
        <XIcon class="size-4" />
      </button>
    </div>
  {/if}
</header>
