<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import { client } from '/@/client';
import VolumeIcon from '/@/lib/images/VolumeIcon.svelte';

const commandLine = 'podman volume create myFirstVolume';
</script>

<EmptyScreen
  icon={VolumeIcon}
  title="No volumes"
  message="Create a volume using the following command line:"
  commandline={commandLine}
  onclick={(): Promise<void> => client.system.clipboardWriteText({ text: commandLine })} />
