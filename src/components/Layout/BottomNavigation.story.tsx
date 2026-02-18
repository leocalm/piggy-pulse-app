import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';

const meta: Meta<typeof BottomNavigation> = {
  title: 'Components/Layout/BottomNavigation',
  component: BottomNavigation,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ paddingTop: '500px', minHeight: '600px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BottomNavigation>;

const NavigationWrapper = ({ route }: { route: string }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(route);
  }, [navigate, route]);

  return <BottomNavigation />;
};

export const Default: Story = {
  render: () => <NavigationWrapper route="/dashboard" />,
};

export const OnTransactions: Story = {
  render: () => <NavigationWrapper route="/transactions" />,
};

export const OnPeriods: Story = {
  render: () => <NavigationWrapper route="/periods" />,
};
