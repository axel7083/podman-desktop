<script context="module" lang="ts">
import { Spinner } from '@podman-desktop/ui-svelte';
import { Story, Template } from '@storybook/addon-svelte-csf';

export const meta = {
  title: 'Example/Spinner',
  component: Spinner,
  tags: ['autodocs'],
};
</script>

<Template let:args>
  <Spinner {...args} />
</Template>

<Story name="Default" args="{{}}" />

<Story
  name="Small"
  args="{{
    size: '1em',
  }}" />
