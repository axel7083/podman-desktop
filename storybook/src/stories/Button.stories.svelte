<script context="module" lang="ts">
import { Button } from '@podman-desktop/ui-svelte';
import { Story, Template } from '@storybook/addon-svelte-csf';

export const meta = {
  title: 'Example/Button',
  component: Button,
  tags: ['autodocs'],
};
</script>

<Template let:args>
  <Button {...args}>Button</Button>
</Template>

<Story name="Default"></Story>

<Story name="Secondary" args="{{ type: 'secondary' }}" />

<Story name="Danger" args="{{ type: 'danger' }}" />

<Story name="Link" args="{{ type: 'link' }}" />

<Story name="Tab" args="{{ type: 'tab' }}" />
