<script lang="ts">
import type { SecretInfo } from '/@api/secret-info';

import ProviderInfo from '../../ui/ProviderInfo.svelte';

interface Props {
  object: SecretInfo;
}

let { object }: Props = $props();
</script>

<ProviderInfo provider={object.engineName} context={object.engineId} />
