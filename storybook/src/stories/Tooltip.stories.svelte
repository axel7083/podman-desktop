<script context="module" lang="ts">
import { Button, Tooltip } from '@podman-desktop/ui-svelte';
import { Story, Template } from '@storybook/addon-svelte-csf';

export const meta = {
  title: 'Example/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
};
</script>

<Template let:args>
  <Tooltip {...args}>
    <svelte:fragment slot="content">
      <Button>{args.content}</Button>
    </svelte:fragment>
    <svelte:fragment slot="tip">
      <div class="inline-block py-2 px-4 rounded-md bg-charcoal-800 text-xs text-white" aria-label="tooltip">
        {args.tip}
      </div>
    </svelte:fragment>
  </Tooltip>
</Template>

<Story
  name="Default"
  args="{{
    content: 'Hover me',
    tip: 'Hello world',
  }}"></Story>

<Story
  name="Top"
  args="{{
    content: 'Hover me',
    tip: 'I am on top',
    top: true,
  }}"></Story>

<Story
  name="Bottom"
  args="{{
    content: 'Hover me',
    tip: 'I am on bottom',
    bottom: true,
  }}"></Story>
