<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import ListItemButtonIcon from '/@/lib/ui/ListItemButtonIcon.svelte';
import type { SecretInfo } from '/@api/secret-info';

interface Props {
  object: SecretInfo;
  detailed?: boolean;
}

let { object, detailed = false }: Props = $props();

let loading: boolean = $state(false);

function onDeleteSecret(): void {
  withConfirmation(async () => {
    try {
      loading = true;
      await window.removeSecret(object.engineId, object.Id);
    } finally {
      loading = false;
    }
  }, `delete secret ${object.Name}`);
}
</script>

<ListItemButtonIcon
  title="Delete Secret"
  onClick={onDeleteSecret}
  icon={faTrash}
  inProgress={loading}
  detailed={detailed}
  enabled={true} />
