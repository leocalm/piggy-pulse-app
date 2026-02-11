import { useEffect, useRef, useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import {
  Alert,
  Avatar,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/context/AuthContext';
import { useCurrencies } from '@/hooks/useCurrencies';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useUpdateUser } from '@/hooks/useUser';
import { LANGUAGE_DISPLAY_NAMES, SettingsRequest, Theme, Language } from '@/types/settings';
import { useTranslation } from 'react-i18next';

export function SettingsPage() {
  const { setColorScheme } = useMantineColorScheme();
  const { user, refreshUser } = useAuth();
  const settingsQuery = useSettings();
  const currenciesQuery = useCurrencies();
  const updateSettingsMutation = useUpdateSettings();
  const updateUserMutation = useUpdateUser();
  const { i18n, t } = useTranslation();

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [theme, setTheme] = useState<Theme>('auto');
  const [language, setLanguage] = useState<Language>('en');
  const [currencyId, setCurrencyId] = useState<string | null>(null);

  const hasInitializedSettings = useRef(false);
  const hasInitializedProfile = useRef(false);

  // Sync form when data loads (only on initial load)
  useEffect(() => {
    if (settingsQuery.data && !hasInitializedSettings.current) {
      setTheme(settingsQuery.data.theme);
      setLanguage(settingsQuery.data.language);
      setCurrencyId(settingsQuery.data.defaultCurrencyId);
      setColorScheme(settingsQuery.data.theme);
      hasInitializedSettings.current = true;
    }
  }, [settingsQuery.data, setColorScheme]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [i18n, language]);

  // Reset initialization when settings are saved
  useEffect(() => {
    if (updateSettingsMutation.isSuccess) {
      hasInitializedSettings.current = false;
    }
  }, [updateSettingsMutation.isSuccess]);

  useEffect(() => {
    if (user && !hasInitializedProfile.current) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      hasInitializedProfile.current = true;
    }
  }, [user]);

  // Reset profile initialization when profile is saved
  useEffect(() => {
    if (updateUserMutation.isSuccess) {
      hasInitializedProfile.current = false;
    }
  }, [updateUserMutation.isSuccess]);

  const handleSaveProfile = async () => {
    if (!user) {
      return;
    }
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: { name: profileName, email: profileEmail },
      });
      await refreshUser();
      notifications.show({
        title: t('common.success'),
        message: t('settings.notifications.profile.success'),
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      notifications.show({
        title: t('common.error'),
        message: t('settings.notifications.profile.error'),
        color: 'red',
      });
    }
  };

  const handleSavePreferences = async () => {
    const settingsData: SettingsRequest = {
      theme,
      language,
      defaultCurrencyId: currencyId,
    };
    try {
      await updateSettingsMutation.mutateAsync(settingsData);
      notifications.show({
        title: t('common.success'),
        message: t('settings.notifications.preferences.success'),
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      notifications.show({
        title: t('common.error'),
        message: t('settings.notifications.preferences.error'),
        color: 'red',
      });
    }
  };

  const isLoading = settingsQuery.isLoading || currenciesQuery.isLoading;
  const isError = settingsQuery.isError || currenciesQuery.isError;

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <Group justify="center">
          <Loader />
        </Group>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container size="lg" py="xl">
          <Alert icon={<IconAlertCircle />} title={t('common.error')} color="red">
            {t('settings.errors.loadFailed')}
          </Alert>
      </Container>
    );
  }

  const currencyOptions =
    currenciesQuery.data?.map((currency) => ({
      value: currency.id,
      label: `${currency.name} (${currency.symbol})`,
    })) || [];

  const currencySelectData =
    currencyOptions.length > 0
      ? currencyOptions
      : [{ value: 'none', label: t('settings.preferences.noCurrencies'), disabled: true }];
  const isCurrencyDisabled = currencyOptions.length === 0;

  const languageOptions = Object.entries(LANGUAGE_DISPLAY_NAMES).map(([code, name]) => ({
    value: code,
    label: name,
  }));

  const themeOptions = [
    { value: 'light', label: t('settings.appearance.themeOptions.light') },
    { value: 'dark', label: t('settings.appearance.themeOptions.dark') },
    { value: 'auto', label: t('settings.appearance.themeOptions.auto') },
  ];

  // Determine avatar initials
  const avatarInitials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'JD';

  return (
    <Container size="lg">
      <Stack gap="xl">
        <div>
          <Title order={2}>{t('settings.pageTitle')}</Title>
          <Text c="dimmed">{t('settings.pageDescription')}</Text>
        </div>

        {/* Profile Information */}
        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={4} mb="xs">
                {t('settings.profile.title')}
              </Title>
              <Text c="dimmed" size="sm">
                {t('settings.profile.description')}
              </Text>
            </div>

            <Group align="flex-start">
              <Avatar size={80} radius={80} color="cyan">
                {avatarInitials}
              </Avatar>
              <Stack style={{ flex: 1 }}>
                <TextInput
                  label={t('settings.profile.fullNameLabel')}
                  value={profileName}
                  onChange={(e) => setProfileName(e.currentTarget.value)}
                  placeholder={t('settings.profile.fullNamePlaceholder')}
                />
                <TextInput
                  label={t('settings.profile.emailLabel')}
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.currentTarget.value)}
                  placeholder={t('settings.profile.emailPlaceholder')}
                />
              </Stack>
            </Group>

            <Group justify="flex-end">
                <Button
                  leftSection={<span>💾</span>}
                  onClick={handleSaveProfile}
                  loading={updateUserMutation.isPending}
                  disabled={!profileName.trim() || !profileEmail.trim()}
                >
                  {t('settings.profile.saveButton')}
                </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Appearance */}
        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={4} mb="xs">
                {t('settings.appearance.title')}
              </Title>
              <Text c="dimmed" size="sm">
                {t('settings.appearance.description')}
              </Text>
            </div>

            <Group justify="space-between">
              <div>
                <Text fw={500}>{t('settings.appearance.themeModeLabel')}</Text>
                <Text c="dimmed" size="sm">
                  {t('settings.appearance.themeModeDescription')}
                </Text>
              </div>
              <Select
                data={themeOptions}
                value={theme}
                onChange={(value) => {
                  const newTheme = value as Theme;
                  setTheme(newTheme);
                  setColorScheme(newTheme);
                }}
                w={250}
              />
            </Group>
          </Stack>
        </Paper>

        {/* Preferences */}
        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={4} mb="xs">
                {t('settings.preferences.title')}
              </Title>
              <Text c="dimmed" size="sm">
                {t('settings.preferences.description')}
              </Text>
            </div>

            <Select
              label={t('settings.preferences.currencyLabel')}
              description={t('settings.preferences.currencyDescription')}
              data={currencySelectData}
              disabled={isCurrencyDisabled}
              value={currencyId}
              onChange={(value) => {
                setCurrencyId(value);
              }}
              placeholder={t('settings.preferences.currencyPlaceholder')}
              clearable
              w={300}
            />

            <Select
              label={t('settings.preferences.languageLabel')}
              description={t('settings.preferences.languageDescription')}
              data={languageOptions}
              value={language}
              onChange={(value) => {
                setLanguage((value || 'en') as Language);
              }}
              w={300}
            />

            <Group justify="flex-end">
              <Button
                leftSection={<span>💾</span>}
                onClick={handleSavePreferences}
                loading={updateSettingsMutation.isPending}
              >
                {t('settings.preferences.saveButton')}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
