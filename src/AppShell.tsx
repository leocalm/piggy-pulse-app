import type { ReactNode } from 'react';
import { AppShell, Box, Group, Stack, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { PeriodHeaderControl } from '@/components/BudgetPeriodSelector';
import { BottomNavigation } from '@/components/Layout/BottomNavigation';
import { Logo } from '@/components/Layout/Logo';
import { Sidebar } from '@/components/Layout/Sidebar';
import { UserMenu } from '@/components/Layout/UserMenu';
import { usePageTitle } from '@/hooks/usePageTitle';

const CONTENT_WRAPPER_STYLE = { maxWidth: '1100px', margin: '0 auto' } as const;

const PERIOD_STRIP_STYLE = {
  borderTop: '1px solid var(--border-soft)',
  padding: '0 var(--mantine-spacing-md)',
  display: 'flex',
  alignItems: 'center',
  height: 48,
  width: '100%',
} as const;

export function BasicAppShell({ children }: { children: ReactNode }) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const pageTitle = usePageTitle();

  return (
    <AppShell
      data-testid="app-shell"
      header={{ height: isMobile ? 108 : 60 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: true, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        {isMobile ? (
          <Stack gap={0} h="100%">
            <Group h={60} px="md" justify="space-between" align="center" wrap="nowrap">
              <Logo />
              <UserMenu variant="topbar" />
            </Group>
            <Box style={PERIOD_STRIP_STYLE}>
              <PeriodHeaderControl fullWidth />
            </Box>
          </Stack>
        ) : (
          <Group h="100%" px="md" justify="space-between" align="center" wrap="nowrap">
            <Text size="sm" fw={600} c="dimmed" style={{ letterSpacing: '0.01em' }}>
              {pageTitle}
            </Text>
            <Group gap="sm" align="center" wrap="nowrap" justify="flex-end" style={{ minWidth: 0 }}>
              <PeriodHeaderControl />
              <UserMenu variant="topbar" />
            </Group>
          </Group>
        )}
      </AppShell.Header>

      <Sidebar />

      <AppShell.Main pb={isMobile ? 80 : undefined} data-testid="app-shell-main">
        <div style={CONTENT_WRAPPER_STYLE}>{children}</div>
      </AppShell.Main>

      {isMobile && <BottomNavigation />}
    </AppShell>
  );
}
