<script lang="ts">
import { Checkbox } from '@podman-desktop/ui-svelte';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';
import type { SecretInfo } from '/@api/secret-info';

interface Props {
  secret: SecretInfo;
}

let { secret }: Props = $props();

let showsecret = $state(false);
let inspect: SecretInfo = $derived(await window.inspectSecret(secret.engineId, secret.Id, { showsecret }));
let stringify: string = $derived(JSON.stringify(inspect, null, 2));
</script>

{#if stringify}
  {#if secret.engineType === 'podman'}
    <div class="flex flex-row py-2 h-[40px] items-center mx-4">
      <Checkbox bind:checked={showsecret}>Show secret</Checkbox>
    </div>
  {/if}
  <MonacoEditor content={stringify} language="json" />
{/if}
