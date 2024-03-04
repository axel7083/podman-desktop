import type { Meta, StoryObj } from '@storybook/svelte';

import { Input } from '@podman-desktop/ui-svelte';

const meta = {
  title: 'Example/Input',
  tags: ['autodocs'],
  component: Input,
} satisfies Meta<Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
