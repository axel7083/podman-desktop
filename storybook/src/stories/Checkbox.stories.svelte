<script context="module" lang="ts">
import { Checkbox } from '@podman-desktop/ui-svelte';
import { Story, Template } from '@storybook/addon-svelte-csf';

export const meta = {
  title: 'Example/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};
</script>

<Template let:args>
  <Checkbox {...args} />
</Template>

<Story
  name="Default"
  args="{{
    id: 'default',
    name: 'default',
  }}" />

<Story
  name="Checked"
  args="{{
    id: 'checked',
    name: 'checked',
    checked: true,
  }}" />

<Story
  name="Indeterminate"
  args="{{
    id: 'indeterminate',
    name: 'indeterminate',
    indeterminate: true,
  }}" />

<Story
  name="Disabled"
  args="{{
    id: 'disabled',
    name: 'disabled',
    disabled: true,
  }}" />
