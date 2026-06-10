<script lang="ts">
import type { HTMLAttributes } from 'svelte/elements';

interface Props extends HTMLAttributes<HTMLDivElement> {
  object: string;
}
let { object, class: className, ...restProps }: Props = $props();
</script>

<div class={['text-[var(--pd-table-body-text)] max-w-full text-wrap line-clamp-2', className]} {...restProps}>
  {object}
</div>
