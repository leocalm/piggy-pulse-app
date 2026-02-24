import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { createStoryDecorator } from '@/stories/storyUtils';
import { Emergency2FADisablePage } from './Emergency2FADisablePage';

const meta: Meta<typeof Emergency2FADisablePage> = {
  title: 'Pages/Auth/Emergency2FADisable',
  component: Emergency2FADisablePage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator({ withBudgetProvider: false, padding: false })],
};

export default meta;
type Story = StoryObj<typeof Emergency2FADisablePage>;

export const Default: Story = {};

export const RequestLoading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/two-factor/emergency-disable-request', async () => {
          await new Promise(() => {});
        }),
      ],
    },
  },
};

export const RequestError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/two-factor/emergency-disable-request', () =>
          HttpResponse.json({ message: 'Invalid email' }, { status: 400 })
        ),
      ],
    },
  },
};

export const ConfirmError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/two-factor/emergency-disable-confirm', () =>
          HttpResponse.json({ message: 'Invalid or expired code' }, { status: 400 })
        ),
      ],
    },
  },
};
