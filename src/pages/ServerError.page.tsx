import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ErrorState } from '@/components/Utils';

/**
 * 500 Server Error page.
 * Displayed when an unexpected server error occurs.
 */
export function ServerErrorPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <ErrorState
      variant="fullPage"
      code={500}
      icon="⚠️"
      title={t('states.error.500.title')}
      message={t('states.error.500.message')}
      primaryAction={{
        label: t('states.error.actions.refresh'),
        icon: <span>🔄</span>,
        onClick: handleRefresh,
      }}
      secondaryAction={{
        label: t('states.error.actions.goHome'),
        icon: <span>🏠</span>,
        onClick: () => navigate('/dashboard'),
      }}
      data-testid="server-error-page"
    />
  );
}
