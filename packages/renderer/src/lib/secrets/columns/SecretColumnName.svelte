<script lang="ts">
import { handleNavigation } from '/@/navigation';
import { NavigationPage } from '/@api/navigation-page';
import type { SecretInfo } from '/@api/secret-info';

interface Props {
  object: SecretInfo;
}

let { object }: Props = $props();

function onOpenSecretDetails(): void {
  console.log(object);
  handleNavigation({
    page: NavigationPage.SECRET,
    parameters: {
      engineId: object.engineId,
      id: object.Id,
    },
  });
}
</script>

<button
  class="hover:cursor-pointer flex text-(--pd-table-body-text-highlight) max-w-full overflow-hidden text-ellipsis"
  onclick={onOpenSecretDetails}>
  {object.Name}
</button>
