<script lang="ts">
import type { NetworkInspectInfo } from '@podman-desktop/core-api';
import { onMount } from 'svelte';

import { client } from '/@/client';
import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';

import type { NetworkInfoUI } from './NetworkInfoUI';

interface Props {
  network: NetworkInfoUI;
}

let { network }: Props = $props();

let inspectDetails: string = $state('');

onMount(async () => {
  // grab inspect result from the network
  let inspectResult = (await client.container.inspectNetwork({
    engine: network.engineId,
    networkId: network.id,
  })) as Partial<NetworkInspectInfo>;
  // remove engine* properties from the inspect result as it's more internal
  delete inspectResult.engineId;
  delete inspectResult.engineName;
  delete inspectResult.engineType;

  inspectDetails = JSON.stringify(inspectResult, undefined, 2);
});
</script>

{#if inspectDetails}
  <MonacoEditor content={inspectDetails} language="json" />
{/if}
