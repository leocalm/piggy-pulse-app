import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ToastViewport } from '@/components/Notifications/ToastViewport';
import { appLanguageToDayjsLocale } from '@/lib/locale';
import { initSentry, Sentry } from '@/lib/sentry';
import { initUmami } from '@/lib/umami';
import App from './App';
import { theme } from './theme';

import './i18n';

function I18nDatesProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  return (
    <DatesProvider settings={{ locale: appLanguageToDayjsLocale(i18n.language) }}>
      {children}
    </DatesProvider>
  );
}

initSentry();
initUmami();

dayjs.extend(customParseFormat);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <I18nDatesProvider>
          <ToastViewport />
          <Sentry.ErrorBoundary fallback={<div>Something went wrong.</div>}>
            <App />
          </Sentry.ErrorBoundary>
        </I18nDatesProvider>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
