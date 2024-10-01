<script lang="ts">
import { Button } from '@podman-desktop/ui-svelte';

import KubeIcon from '/@/lib/images/KubeIcon.svelte';
import type { ContextGeneralState } from '/@api/kubernetes-contexts-states';

interface Props {
  contextState: ContextGeneralState;
}

let { contextState }: Props = $props();
let loading: boolean = $state(false);

async function reconnect(): Promise<void> {
  loading = true;
  try {
    await window.kubernetesRestartCurrentContext();
  } catch (err: unknown) {
    console.error(err);
  } finally {
    loading = false;
  }
}
</script>

<div class="mt-8 flex justify-center overflow-auto">
  <div class="max-w-[800px] flex flex-col text-center space-y-3">
    <div class="flex justify-center text-[var(--pd-details-empty-icon)] py-2">
      <KubeIcon />
    </div>
    <h1 class="text-xl text-[var(--pd-details-empty-header)]">Cluster not reachable</h1>
    <div class="text-[var(--pd-details-empty-sub-header)] text-pretty">
      {contextState.error}
    </div>
    <div>
      <Button inProgress={loading} disabled={loading} on:click={reconnect}>Reconnect</Button>
    </div>
  </div>
</div>
