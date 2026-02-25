import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { mockAccountManagementList } from '@/mocks/budgetData';
import { AccountsManagement } from './AccountsManagement';

const meta: Meta<typeof AccountsManagement> = {
  title: 'Pages/Accounts/AccountsManagement',
  component: AccountsManagement,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof AccountsManagement>;

export const Default: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.success('/api/v1/accounts/management', mockAccountManagementList)] },
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/accounts/management')] },
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.error('/api/v1/accounts/management')] },
  },
};

export const Empty: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.empty('/api/v1/accounts/management')] },
  },
};

export const WithArchivedAccounts: Story = {
  parameters: {
    msw: {
      handlers: [
        mswHandlers.success('/api/v1/accounts/management', mockAccountManagementList),
      ],
    },
  },
};
