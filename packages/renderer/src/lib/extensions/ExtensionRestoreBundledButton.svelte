<script lang="ts">
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import type { ExtensionInfo } from '@podman-desktop/core-api';
import { Button } from '@podman-desktop/ui-svelte';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';

interface Props {
  extension: Pick<ExtensionInfo, 'id' | 'displayName' | 'version' | 'overrides'>;
}

let { extension }: Props = $props();

let inProgress = $state(false);

async function restoreBundled(): Promise<void> {
  inProgress = true;
  try {
    // uninstalling the extension, even started, loads back the bundled one
    await window.removeExtension(extension.id);
  } finally {
    inProgress = false;
  }
}

function confirmRestoreBundled(): void {
  withConfirmation(
    restoreBundled,
    `restore bundled extension ${extension.overrides?.id} v${extension.overrides?.version}`,
    {
      title: 'Restore Bundled Extension?',
      buttonLabel: 'Restore',
      detail: `${extension.displayName} v${extension.version} will be uninstalled.`,
    },
  );
}
</script>

{#if extension.overrides}
  <Button type="secondary" icon={faRotateLeft} {inProgress} onclick={confirmRestoreBundled}>Restore bundled</Button>
{/if}
