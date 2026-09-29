<script lang="ts">
import { faCircleArrowUp } from '@fortawesome/free-solid-svg-icons';
import type { ExtensionInfo } from '@podman-desktop/core-api';
import { Button } from '@podman-desktop/ui-svelte';

interface Props {
  extension: Pick<ExtensionInfo, 'id' | 'update'>;
}

let { extension }: Props = $props();

let inProgress = $state(false);

async function updateExtension(): Promise<void> {
  if (!extension.update) {
    return;
  }
  inProgress = true;
  try {
    await window.updateExtension(extension.id, extension.update.ociUri);
  } finally {
    inProgress = false;
  }
}
</script>

{#if extension.update}
  <Button
    type="secondary"
    icon={faCircleArrowUp}
    {inProgress}
    aria-label="Update {extension.id} to v{extension.update.version}"
    onclick={updateExtension}>Update to v{extension.update.version}</Button>
{/if}
