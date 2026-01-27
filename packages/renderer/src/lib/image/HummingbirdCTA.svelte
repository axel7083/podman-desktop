<script lang="ts">
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import { router } from 'tinro';

interface Props {
  imageName?: string;
}

const { imageName }: Props = $props();

function handleAddExtensions(): void {
  window
    .telemetryTrack('securityInsights.pullCTA.clicked', {
      imageName: imageName ?? '',
    })
    .catch((err: unknown) => console.error('Error tracking telemetry', err));
  router.goto('/extensions?screen=catalog&searchTerm=' + encodeURIComponent('Hummingbird'));
}
</script>

<!-- Always show the CTA to promote security extensions -->
  <div class="mt-3 p-3 rounded-md bg-[var(--pd-content-card-bg)] border border-[var(--pd-content-card-border)]">
    <div class="flex items-center gap-2">
      <Fa icon={faShieldHalved} class="text-[var(--pd-content-text)] opacity-70" />
      <span class="text-sm text-[var(--pd-content-text)]">
        Display security insights.
        <button
          class="text-[var(--pd-link)] hover:underline cursor-pointer ml-1"
          on:click={handleAddExtensions}
        >
          Add Image security recommendations extensions.
        </button>
      </span>
    </div>
  </div>

