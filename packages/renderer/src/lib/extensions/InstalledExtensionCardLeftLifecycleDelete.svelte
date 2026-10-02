<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import LoadingIconButton from '/@/lib/ui/LoadingIconButton.svelte';
import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

interface Props {
  extension: CombinedExtensionInfoUI;
}

let { extension }: Props = $props();

let inProgress = $state(false);

async function deleteExtension(): Promise<void> {
  inProgress = true;
  if (extension.type === 'dd') {
    await window.ddExtensionDelete(extension.id);
  } else {
    await window.removeExtension(extension.id);
  }
  inProgress = false;
}

function confirmDeleteExtension(): void {
  withConfirmation(deleteExtension, `delete extension ${extension.displayName || extension.name}`, {
    title: 'Delete Extension?',
    variant: 'delete',
    detail: extension.overrides
      ? `The bundled extension ${extension.overrides.id} will be restored, without being updated automatically.`
      : undefined,
  });
}
</script>

  <LoadingIconButton
    clickAction={confirmDeleteExtension}
    action="delete"
    icon={faTrash}
    state={{ status: extension.type === 'dd' ? 'stopped' : extension.removable ? extension.state : '', inProgress }} />
