import {
  IconArrowsExchange,
  IconCalendar,
  IconDots,
  IconLayoutDashboard,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Group, Paper, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MoreMenuDrawer } from './MoreMenuDrawer';

export function BottomNavigation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [opened, { open, close }] = useDisclosure(false);

  const items = [
    {
      icon: <IconLayoutDashboard size={22} />,
      label: t('layout.navigation.dashboard'),
      route: '/dashboard' as string | null,
    },
    {
      icon: <IconArrowsExchange size={22} />,
      label: t('layout.navigation.transactions'),
      route: '/transactions' as string | null,
    },
    {
      icon: <IconCalendar size={22} />,
      label: t('layout.navigation.periods'),
      route: '/periods' as string | null,
    },
    {
      icon: <IconDots size={22} />,
      label: t('layout.navigation.more'),
      route: null as string | null,
    },
  ];

  return (
    <Paper
      pos="fixed"
      bottom={0}
      left={0}
      right={0}
      h={80}
      style={{
        zIndex: 100,
        borderTop: '1px solid var(--border-medium)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      radius={0}
    >
      <Group justify="space-around" align="center" h="100%" px="xs" gap={0}>
        {items.map((item) => {
          const isActive =
            item.route !== null &&
            (location.pathname === item.route ||
              (item.route === '/dashboard' && location.pathname === '/'));
          return (
            <UnstyledButton
              key={item.label}
              onClick={() => {
                if (item.route === null) {
                  open();
                } else {
                  navigate(item.route);
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
              }}
            >
              <ThemeIcon
                variant={isActive ? 'light' : 'transparent'}
                color={isActive ? 'cyan' : 'gray'}
                size="lg"
                radius="md"
              >
                {item.icon}
              </ThemeIcon>
              <Text size="xs" mt={4} c={isActive ? 'cyan' : 'dimmed'} fw={500}>
                {item.label}
              </Text>
            </UnstyledButton>
          );
        })}
      </Group>

      <MoreMenuDrawer opened={opened} onClose={close} />
    </Paper>
  );
}
