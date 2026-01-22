<script lang="ts">
import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

interface Props {
  imageName?: string;
}

const { imageName }: Props = $props();

async function handleLearnMore(): Promise<void> {
  await window.openExternal('https://developers.redhat.com/hummingbird');
  await window.telemetryTrack('hummingbird.pullCTA.clicked', {
    imageName: imageName ?? '',
  });
}
</script>

<!-- Always show the CTA to promote Hummingbird awareness -->
  <div class="mt-3 p-3 rounded-md bg-[var(--pd-content-card-bg)] border border-[var(--pd-content-card-border)]">
    <div class="flex items-center gap-2">
      <Fa icon={faLeaf} class="text-green-500" />
      <span class="text-sm text-[var(--pd-content-text)]">
        Looking for a hardened version?
        <button
          class="text-[var(--pd-link)] hover:underline cursor-pointer ml-1"
          on:click={handleLearnMore}
        >
          Explore Hummingbird images
        </button>
      </span>
    </div>
  </div>

