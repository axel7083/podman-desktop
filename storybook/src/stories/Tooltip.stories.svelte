<script context="module" lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';
import { Story, Template } from '@storybook/addon-svelte-csf';

export const meta = {
  title: 'Example/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
};
</script>

<Template let:args>
  <Tooltip {...args} />
</Template>

<Story name="Default"></Story>
