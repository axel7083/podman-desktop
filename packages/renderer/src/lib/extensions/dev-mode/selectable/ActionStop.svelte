<script lang="ts">
import { faStop } from '@fortawesome/free-solid-svg-icons';

import { client } from '/@/client';
import type { SelectableExtensionDevelopmentFolderInfoUI } from '/@/lib/extensions/dev-mode/development-folder-info-ui';
import ListItemButtonIcon from '/@/lib/ui/ListItemButtonIcon.svelte';

interface Props {
  extensionFolder: SelectableExtensionDevelopmentFolderInfoUI;
}
const { extensionFolder }: Props = $props();

async function stopExtension(): Promise<void> {
  if (!extensionFolder.extension) {
    return;
  }
  await client.extension.stop({ extensionId: extensionFolder.extension.id });
}
</script>

<ListItemButtonIcon
  title="Stop the extension"
  onClick={stopExtension}
  hidden={!extensionFolder.extension || extensionFolder.extension?.state === 'stopped'}
  icon={faStop} />
