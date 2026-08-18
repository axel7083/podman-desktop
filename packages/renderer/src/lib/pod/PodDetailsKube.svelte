<script lang="ts">
import { onMount } from 'svelte';

import { client } from '/@/client';
import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';

import type { PodInfoUI } from './PodInfoUI';

interface Props {
  pod: PodInfoUI;
}

let { pod }: Props = $props();

let kubeDetails: string = $state('');

onMount(async () => {
  // grab kube result from the pod
  kubeDetails = await client.container.generatePodmanKube({ engine: pod.engineId, names: [pod.id] });
});
</script>

{#if kubeDetails}
  <MonacoEditor content={kubeDetails} language="yaml" />
{/if}
