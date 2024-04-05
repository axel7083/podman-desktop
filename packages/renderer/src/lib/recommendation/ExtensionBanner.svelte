<script lang="ts">
import FeaturedExtension from '/@/lib/featured/FeaturedExtension.svelte';

import type { ExtensionBanner } from '../../../../main/src/plugin/recommendations/recommendations-api';

export let banner: ExtensionBanner;

const hasBackground = (): boolean => {
  return !!banner.background && (!!banner.background.image || !!banner.background.gradient);
};

const style = (): string | undefined => {
  if (banner.background?.gradient) {
    return `background: linear-gradient(${banner.background.gradient.start}, ${banner.background.gradient.end});`;
  }

  if (banner.background?.image) {
    return `background-image: url("${banner.background.image}")`;
  }

  return undefined;
};
</script>

<div
  style="{style()}"
  class:bg-charcoal-800="{hasBackground()}"
  class="bg-charcoal-800 max-h-[175px] px-5 pt-5 rounded-lg grid grid-cols-[20px_8fr_7fr] gap-4">
  <!-- icon column -->
  <div>
    <img class="w-4 h-4' object-contain mt-1" alt="banner icon" src="{banner.icon}" />
  </div>

  <!-- content column -->
  <div class="flex flex-col">
    <span class="text-xl">{banner.title}</span>

    <div class="grid grid-cols-[2fr_1fr]">
      <span class="text-base">{banner.description}</span>
      <img class="w-24 h-24 object-contain" alt="banner thumbnail" src="{banner.thumbnail}" />
    </div>
  </div>

  <!-- feature extension actions -->
  <div class="flex flex-col">
    <FeaturedExtension featuredExtension="{banner.featured}" />
    <span class="text-base w-full text-end">{banner.featured.description}</span>
  </div>
</div>
