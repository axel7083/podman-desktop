<script lang="ts">
import Label from '/@/lib/ui/Label.svelte';
import ProviderInfoCircle from '/@/lib/ui/ProviderInfoCircle.svelte';
import { containerConnectionCount, providerInfos } from '/@/stores/providers';

interface Props {
  object: {
    engineId: string;
  };
}

let { object }: Props = $props();

const [providerId, connectionName] = $derived(object.engineId.split('.'));

const connection = $derived(
  $providerInfos
    .find(provider => provider.id === providerId)
    ?.containerConnections?.find(({ name }) => name === connectionName),
);

const displayName = $derived.by(() => {
  if (!connection) return object.engineId;

  if ($containerConnectionCount[connection.type] > 1) return connection.displayName;

  return connection.type;
});

const tip = $derived.by(() => {
  if (!connection) return '';
  if ('socketPath' in connection.endpoint) {
    return connection?.endpoint.socketPath;
  } else {
    return `${connection.endpoint.host}:${connection.endpoint.port}`;
  }
});
</script>

<Label tip={tip} name={displayName}>
  <ProviderInfoCircle type={connection?.type} />
</Label>
