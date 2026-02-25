import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { Dashboard } from './Dashboard';

const meta: Meta<typeof Dashboard> = {
  title: 'Pages/Dashboard',
  component: Dashboard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator({ padding: false })],
};

export default meta;
type Story = StoryObj<typeof Dashboard>;

export const Default: Story = {
  args: { selectedPeriodId: 'per-1' },
};

export const Loading: Story = {
  args: { selectedPeriodId: 'per-1' },
  parameters: {
    msw: {
      handlers: [
        mswHandlers.loading('/api/v1/dashboard/monthly-burn-in'),
        mswHandlers.loading('/api/v1/dashboard/month-progress'),
      ],
    },
  },
};

export const Error: Story = {
  args: { selectedPeriodId: 'per-1' },
  parameters: {
    msw: {
      handlers: [
        mswHandlers.error('/api/v1/dashboard/monthly-burn-in'),
        mswHandlers.error('/api/v1/dashboard/month-progress'),
      ],
    },
  },
};

export const LockedNoPeriodConfigured: Story = {
  args: { selectedPeriodId: null },
};

export const LockedNoActivePeriod: Story = {
  args: { selectedPeriodId: 'per-1' },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/budget_period/current', () => new HttpResponse(null, { status: 404 })),
      ],
    },
  },
};
