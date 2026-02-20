import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { AccountsManagement } from './AccountsManagement';
import { AccountsOverview } from './AccountsOverview';
import styles from './Accounts.module.css';

type ViewMode = 'overview' | 'management';

export function AccountsContainer() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  return (
    <Box className={styles.accountsRoot}>
      <Stack gap="xl">
        <Stack gap={0}>
          <Title order={1} className={styles.accountsTitle}>
            {t('accounts.overview.title')}
          </Title>
          <Text className={styles.accountsSubtitle}>{t('accounts.overview.subtitle')}</Text>
          <Box component="nav" className={styles.modeSwitch} aria-label="Accounts page mode">
            <UnstyledButton
              className={`${styles.modePill} ${viewMode === 'overview' ? styles.modePillActive : ''}`}
              aria-label={t('accounts.overview.viewModeOverview')}
              onClick={() => setViewMode('overview')}
            >
              {t('accounts.overview.viewModeOverview')}
            </UnstyledButton>
            <UnstyledButton
              className={`${styles.modePill} ${viewMode === 'management' ? styles.modePillActive : ''}`}
              aria-label={t('accounts.overview.viewModeManagement')}
              onClick={() => setViewMode('management')}
            >
              {t('accounts.overview.viewModeManagement')}
            </UnstyledButton>
          </Box>
        </Stack>

        {viewMode === 'overview' ? <AccountsOverview /> : <AccountsManagement />}
      </Stack>
    </Box>
  );
}
