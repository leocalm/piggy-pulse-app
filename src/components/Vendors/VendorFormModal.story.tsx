import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@mantine/core';
import { http, HttpResponse } from 'msw';
import { createStoryDecorator } from '@/stories/storyUtils';
import { mockVendorsWithStats } from '@/mocks/budgetData';
import { VendorFormModal } from './VendorFormModal';

const meta: Meta<typeof VendorFormModal> = {
  title: 'Components/Vendors/VendorFormModal',
  component: VendorFormModal,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof VendorFormModal>;

const mutationHandlers = [
  http.post('/api/v1/vendors', () => HttpResponse.json(mockVendorsWithStats[0], { status: 201 })),
  http.patch('/api/v1/vendors/:id', () => HttpResponse.json(mockVendorsWithStats[0])),
];

export const Create: Story = {
  parameters: { msw: { handlers: mutationHandlers } },
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open</Button>
        <VendorFormModal opened={opened} onClose={() => setOpened(false)} />
      </>
    );
  },
};

export const Edit: Story = {
  parameters: { msw: { handlers: mutationHandlers } },
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <>
        <Button onClick={() => setOpened(true)}>Open</Button>
        <VendorFormModal
          opened={opened}
          onClose={() => setOpened(false)}
          vendor={mockVendorsWithStats[0]}
        />
      </>
    );
  },
};
