<script context="module" lang="ts">
import { ErrorMessage } from '@podman-desktop/ui-svelte';
import { Story, Template } from '@storybook/addon-svelte-csf';

export const meta = {
  title: 'Example/ErrorMessage',
  component: ErrorMessage,
  tags: ['autodocs'],
};
</script>

<Template let:args>
  <ErrorMessage {...args} />
</Template>

<Story
  name="Default"
  args="{{
    error: 'Dummy error message',
  }}" />

<Story
  name="Error icon"
  args="{{
    error: 'Dummy error message with icon',
    icon: true,
  }}" />
