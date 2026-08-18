<script lang="ts">
import type { PodInspectInfo } from '@podman-desktop/core-api';
import { onMount } from 'svelte';

import { client } from '/@/client';
import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';

import type { PodInfoUI } from './PodInfoUI';

interface Props {
  pod: PodInfoUI;
}

let { pod }: Props = $props();

let inspectDetails: string = $state('');

onMount(async () => {
  // grab inspect result from the container
  let inspectResult = (await client.container.getPodInspect({
    engine: pod.engineId,
    podId: pod.id,
  })) as Partial<PodInspectInfo>;
  // remove engine* properties from the inspect result as it's more internal
  delete inspectResult.engineId;
  delete inspectResult.engineName;

  inspectDetails = JSON.stringify(inspectResult, undefined, 2);
});
</script>

{#if inspectDetails}
  <MonacoEditor content={inspectDetails} language="json" />
{/if}
