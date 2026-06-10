<script lang="ts">
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { Snippet } from 'svelte';

interface Props {
  referenceElement: HTMLElement;
  children?: Snippet;
}

let { referenceElement, children }: Props = $props();

let dropDownElement: HTMLElement | undefined = $state(undefined);
let isPositioned = $state(false);

async function updatePosition(): Promise<void> {
  if (!referenceElement || !dropDownElement) return;

  const { x, y } = await computePosition(referenceElement, dropDownElement, {
    placement: 'bottom-start',
    middleware: [offset(4), flip({ padding: 5 }), shift({ padding: 5 })],
  });

  if (!dropDownElement) return;

  Object.assign(dropDownElement.style, {
    left: `${Math.round(x)}px`,
    top: `${Math.round(y)}px`,
  });

  isPositioned = true;
}

$effect((): (() => void) => {
  if (referenceElement && dropDownElement) {
    updatePosition().catch(console.error);

    const cleanup = autoUpdate(referenceElement, dropDownElement, () => {
      updatePosition().catch(console.error);
    });

    window.dispatchEvent(new Event('tooltip-hide'));

    return (): void => {
      cleanup();
      window.dispatchEvent(new Event('tooltip-show'));
    };
  }

  return (): void => {};
});
</script>

<div
  title="Drop Down Menu Items"
  bind:this={dropDownElement}
  class="fixed z-10 rounded-md shadow-lg bg-[var(--pd-dropdown-bg)] ring-2 ring-[var(--pd-dropdown-ring)] hover:ring-[var(--pd-dropdown-hover-ring)] divide-y divide-[var(--pd-dropdown-divider)] focus:outline-hidden"
  class:opacity-0={!isPositioned}
  style="left: 0; top: 0;">
  {@render children?.()}
</div>
