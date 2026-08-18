<script lang="ts">
import { onMount } from 'svelte';

import { client } from '/@/client';
import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';

import type { ContainerInfoUI } from './ContainerInfoUI';

interface Props {
  container: ContainerInfoUI;
}

let { container }: Props = $props();

let kubeDetails: string = $state('');

onMount(async () => {
  // grab kube result from the container
  const kubeResult = await client.container.generatePodmanKube({ engine: container.engineId, names: [container.id] });
  kubeDetails = kubeResult;
});
</script>

{#if kubeDetails}
  <MonacoEditor content={kubeDetails} language="yaml" />
{/if}
