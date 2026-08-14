<script lang="ts">
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { Button, EmptyScreen } from '@podman-desktop/ui-svelte';

import { client } from '/@/client';

let extDevelopementLink = $derived(await client.extension.getDevelopmentDocsLink());

async function openExtensionDocumentation(): Promise<void> {
  if (extDevelopementLink) {
    await client.system.openExternal({ link: extDevelopementLink });
  }
}
</script>

<EmptyScreen
  icon={faCog}
  title="Local extensions (developer mode)"
  message="Enable Preferences > Extensions > Development Mode to test local extensions">
  {#if extDevelopementLink}
    <div class="flex gap-2 justify-center">
      <Button type="link" on:click={openExtensionDocumentation}>How to write your first extension</Button>
    </div>
  {/if}
</EmptyScreen>
