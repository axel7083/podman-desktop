<script lang="ts">
import { faArrowCircleDown } from '@fortawesome/free-solid-svg-icons/faArrowCircleDown';
import { Button } from '@podman-desktop/ui-svelte';

import { DOCKER_PREFIX } from '/@/lib/image/catalog/remote-image-info';

interface Props {
  readonly registry: string;
  readonly name: string;
  readonly searchTerm: string;
}

let { registry, name: image, searchTerm }: Props = $props();

let tags = $derived(await getImageTags());
let filtered = $derived(tags.filter(tag => tag.includes(searchTerm)));

async function getImageTags(): Promise<Array<string>> {
  if (registry !== DOCKER_PREFIX) {
    return await window.listImageTagsInRegistry({ image: `${registry}/${image}` });
  }
  return await window.listImageTagsInRegistry({ image });
}
</script>

<ul class="flex flex-col w-full gap-y-1">
  {#each filtered as tag (tag)}
    <li class="bg-[var(--pd-invert-content-card-bg)] rounded-md min-h-10 max-h-10">
      <div class="flex items-center flex-row px-2 py-2 w-full text-[color:var(--pd-invert-content-card-text)]">
              <span class="grow">
                {tag}
              </span>
        <Button type="link" icon={faArrowCircleDown}/>
      </div>
    </li>
  {/each}
</ul>
