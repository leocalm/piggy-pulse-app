import { IconBuildingStore, IconSettings, IconTag, IconWallet } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Drawer, NavLink, Stack } from '@mantine/core';

interface MoreMenuDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export function MoreMenuDrawer({ opened, onClose }: MoreMenuDrawerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const moreItems = [
    {
      icon: <IconWallet size={18} />,
      label: t('layout.navigation.accounts'),
      route: '/accounts',
    },
    {
      icon: <IconTag size={18} />,
      label: t('layout.navigation.categories'),
      route: '/categories',
    },
    {
      icon: <IconBuildingStore size={18} />,
      label: t('layout.navigation.vendors'),
      route: '/vendors',
    },
    {
      icon: <IconSettings size={18} />,
      label: t('layout.navigation.settings'),
      route: '/settings',
    },
  ];

  const handleNavigate = (route: string) => {
    navigate(route);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={t('layout.navigation.more')}
      position="bottom"
      padding="md"
      size="auto"
      styles={{
        content: {
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack gap="md">
        {moreItems.map((item) => (
          <NavLink
            key={item.route}
            label={item.label}
            leftSection={item.icon}
            onClick={() => handleNavigate(item.route)}
            variant="light"
            color="cyan"
            style={{ borderRadius: '8px' }}
          />
        ))}
      </Stack>
    </Drawer>
  );
}
