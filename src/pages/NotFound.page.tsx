import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ErrorState } from '@/components/Utils';

/**
 * 404 Not Found error page.
 * Displayed when the user navigates to a non-existent route.
 */
export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <ErrorState
      variant="fullPage"
      code={404}
      icon="🔍"
      title={t('states.error.404.title')}
      message={t('states.error.404.message')}
      primaryAction={{
        label: t('states.error.actions.goHome'),
        icon: <span>🏠</span>,
        onClick: () => navigate('/dashboard'),
      }}
      secondaryAction={{
        label: t('states.error.actions.goBack'),
        icon: <span>←</span>,
        onClick: () => navigate(-1),
      }}
      data-testid="not-found-page"
    />
  );
}
