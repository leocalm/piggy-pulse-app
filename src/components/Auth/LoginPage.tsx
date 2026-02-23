import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  PinInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { apiPost } from '@/api/client';
import { ApiError } from '@/api/errors';
import { useAuth } from '@/context/AuthContext';
import { AuthCard, AuthMessage } from './AuthCard';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : t('auth.login.validation.invalidEmail')),
      password: (val) => (val.length < 6 ? t('auth.login.validation.passwordMinLength') : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    setLockedMessage(null);

    try {
      await Promise.all([
        apiPost<void, { email: string; password: string; twoFactorCode?: string }>(
          '/api/users/login',
          {
            email: values.email,
            password: values.password,
            twoFactorCode: requires2FA && twoFactorCode ? twoFactorCode : undefined,
          }
        ),
        sleep(400),
      ]);

      // Login successful — hydrate user from cookie-backed endpoint
      const refreshed = await refreshUser(false, false);
      if (!refreshed) {
        throw new Error(t('auth.login.errors.generic'));
      }

      // Navigate to the page user was trying to access, or dashboard
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 428) {
        const data = err.data as { twoFactorRequired?: boolean } | undefined;
        if (data?.twoFactorRequired) {
          setRequires2FA(true);
          setLoading(false);
          return;
        }
      }

      if (err instanceof ApiError && (err.status === 423 || err.status === 429)) {
        setLockedMessage("We're temporarily limiting sign-in attempts. Please try again later.");
        setLoading(false);
        return;
      }

      if (requires2FA) {
        setError('Verification failed. Please try again.');
      } else {
        setError("We couldn't sign you in. Please verify your credentials and try again.");
      }
      setLoading(false);
    }
  };

  const handleBack = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    setError(null);
    setLockedMessage(null);
  };

  if (requires2FA) {
    return (
      <AuthCard>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Text fw={600} size="lg" ta="center">
              {t('auth.login.twoFactor.title', 'Verify your identity')}
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Enter your 6-digit verification code from your authenticator app.
            </Text>
            <Group justify="center">
              <PinInput
                length={6}
                size="lg"
                type="number"
                autoFocus
                value={twoFactorCode}
                onChange={setTwoFactorCode}
                onComplete={() => form.onSubmit(handleSubmit)()}
                disabled={loading}
              />
            </Group>
            <AuthMessage message={error} />
            <Button
              fullWidth
              type="submit"
              loading={loading}
              disabled={twoFactorCode.length !== 6}
            >
              {loading ? 'Verifying…' : 'Verify'}
            </Button>
            <Text ta="center" size="sm">
              <Anchor onClick={handleBack} style={{ cursor: 'pointer' }}>
                Back to login
              </Anchor>
            </Text>
          </Stack>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard tagline="Clarity begins with structure.">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Text fw={600} size="lg" ta="center">
            {t('auth.login.welcomeBack', 'Welcome back')}
          </Text>
          <TextInput
            label="Email"
            placeholder="name@example.com"
            required
            disabled={loading}
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter password"
            required
            disabled={loading}
            {...form.getInputProps('password')}
          />
          <AuthMessage message={error} />
          {lockedMessage && (
            <Text size="xs" c="dimmed" ta="center">
              {lockedMessage}
            </Text>
          )}
          <Button fullWidth type="submit" loading={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </Button>
          <Text ta="center" size="sm">
            <Anchor component={Link} to="/auth/forgot-password">
              Forgot password?
            </Anchor>
          </Text>
        </Stack>
      </form>
    </AuthCard>
  );
}
