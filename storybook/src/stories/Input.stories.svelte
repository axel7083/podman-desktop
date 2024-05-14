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

<Story
  name="Default"
  args="{{
    id: 'default-input',
    placeholder: 'Default input',
  }}"></Story>

<Story
  name="Clearable"
  args="{{
    id: 'clearable-input',
    placeholder: 'clearable input',
    clearable: true,
  }}"></Story>

<Story
  name="Required"
  args="{{
    id: 'required-input',
    placeholder: 'required input',
    required: true,
  }}"></Story>

<Story
  name="Error"
  args="{{
    id: 'error-input',
    error: 'invalid input',
    showError: true,
  }}"></Story>

<Story
  name="Disabled"
  args="{{
    id: 'disabled-input',
    placeholder: 'disabled input',
    disabled: true,
  }}"></Story>
