<script context="module" lang="ts">
import { Input } from '@podman-desktop/ui-svelte';
import { Story, Template } from '@storybook/addon-svelte-csf';

export const meta = {
  title: 'Example/Input',
  component: Input,
  tags: ['autodocs'],
};
</script>

<Template let:args>
  <Input {...args} />
</Template>

<Story name="Default"></Story>
