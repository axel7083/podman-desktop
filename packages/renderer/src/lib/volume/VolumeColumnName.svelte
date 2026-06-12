<script lang="ts">
import { NavigationPage } from '@podman-desktop/core-api';

import { handleNavigation } from '/@/navigation';

import type { VolumeInfoUI } from './VolumeInfoUI';

interface Props {
  object: VolumeInfoUI;
}

let { object }: Props = $props();

function openDetailsVolume(volume: VolumeInfoUI): void {
  handleNavigation({
    page: NavigationPage.VOLUME,
    parameters: {
      engineId: volume.engineId,
      name: volume.name,
    },
  });
}
</script>

<button
  class="hover:cursor-pointer flex text-[var(--pd-table-body-text-highlight)] w-full overflow-hidden text-ellipsis"
  onclick={(): void => openDetailsVolume(object)}>
  {object.shortName}
</button>
