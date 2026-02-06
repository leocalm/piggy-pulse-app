import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Text, Title } from '@mantine/core';
import classes from './ErrorState.module.css';

export type ErrorStateVariant = 'fullPage' | 'card' | 'inline' | 'network';

export interface ErrorStateAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ErrorDetails {
  code?: string;
  requestId?: string;
  timestamp?: string;
}

export interface ErrorStateProps {
  /** Visual variant of the error state */
  variant?: ErrorStateVariant;
  /** HTTP error code (for fullPage variant) */
  code?: number;
  /** Icon or emoji to display */
  icon?: string | ReactNode;
  /** Main error title */
  title: string;
  /** Error description message */
  message?: string;
  /** Primary action button */
  primaryAction?: ErrorStateAction;
  /** Secondary action button */
  secondaryAction?: ErrorStateAction;
  /** Technical error details (for card variant) */
  errorDetails?: ErrorDetails;
  /** Close handler (for inline variant) */
  onClose?: () => void;
  /** Retry handler */
  onRetry?: () => void;
  /** Test ID for testing */
  'data-testid'?: string;
}

const DEFAULT_ICONS: Record<number, string> = {
  404: '🔍',
  403: '🔒',
  500: '⚠️',
  503: '🔧',
};

const DEFAULT_TITLES: Record<number, string> = {
  404: 'states.error.404.title',
  403: 'states.error.403.title',
  500: 'states.error.500.title',
  503: 'states.error.503.title',
};

const DEFAULT_MESSAGES: Record<number, string> = {
  404: 'states.error.404.message',
  403: 'states.error.403.message',
  500: 'states.error.500.message',
  503: 'states.error.503.message',
};

/**
 * ErrorState component for displaying error conditions.
 * Supports full-page errors (404, 500, etc.), cards, inline alerts, and network errors.
 */
export function ErrorState({
  variant = 'card',
  code,
  icon,
  title,
  message,
  primaryAction,
  secondaryAction,
  errorDetails,
  onClose,
  onRetry,
  'data-testid': testId,
}: ErrorStateProps) {
  const { t } = useTranslation();

  const getIcon = (): string | ReactNode => {
    if (icon) {return icon;}
    if (code && DEFAULT_ICONS[code]) {return DEFAULT_ICONS[code];}
    if (variant === 'network') {return '📡';}
    return '💥';
  };

  const getTitle = (): string => {
    if (title) {return title;}
    if (code && DEFAULT_TITLES[code]) {return t(DEFAULT_TITLES[code]);}
    return t('states.error.generic.title');
  };

  const getMessage = (): string => {
    if (message) {return message;}
    if (code && DEFAULT_MESSAGES[code]) {return t(DEFAULT_MESSAGES[code]);}
    return t('states.error.generic.message');
  };

  const renderButton = (action: ErrorStateAction, isSecondary = false) => {
    const buttonVariant =
      action.variant === 'danger'
        ? 'filled'
        : action.variant === 'secondary' || isSecondary
          ? 'default'
          : 'gradient';

    return (
      <Button
        key={action.label}
        leftSection={action.icon}
        onClick={action.onClick}
        variant={buttonVariant}
        color={action.variant === 'danger' ? 'red' : undefined}
        gradient={buttonVariant === 'gradient' ? { from: 'cyan', to: 'violet' } : undefined}
      >
        {action.label}
      </Button>
    );
  };

  const renderActions = () => {
    const actions: ErrorStateAction[] = [];

    if (onRetry) {
      actions.push({
        label: t('states.error.retry'),
        icon: <span>🔄</span>,
        onClick: onRetry,
      });
    }

    if (primaryAction) {actions.push(primaryAction);}
    if (secondaryAction) {actions.push(secondaryAction);}

    if (actions.length === 0) {return null;}

    return (
      <Group className={classes.errorActions}>
        {actions.map((action, index) => renderButton(action, index > 0))}
      </Group>
    );
  };

  // Full Page Error (404, 500, 403, etc.)
  if (variant === 'fullPage') {
    return (
      <div className={classes.errorContainer} data-testid={testId}>
        <div className={classes.errorPage}>
          <div className={classes.errorIllustration}>{getIcon()}</div>
          {code && <div className={classes.errorCode}>{code}</div>}
          <h1 className={classes.errorTitle}>{getTitle()}</h1>
          <p className={classes.errorMessage}>{getMessage()}</p>
          {renderActions()}
        </div>
      </div>
    );
  }

  // Network Error
  if (variant === 'network') {
    return (
      <div className={classes.networkError} data-testid={testId}>
        <div className={classes.networkIcon}>{getIcon()}</div>
        <h3 className={classes.networkTitle}>{getTitle()}</h3>
        <p className={classes.networkMessage}>{getMessage()}</p>
        {renderActions()}
      </div>
    );
  }

  // Inline Error
  if (variant === 'inline') {
    return (
      <div className={classes.errorInline} data-testid={testId}>
        <div className={classes.errorIcon}>{getIcon()}</div>
        <div className={classes.errorContent}>
          <div className={classes.errorInlineTitle}>{getTitle()}</div>
          <div className={classes.errorInlineMessage}>{getMessage()}</div>
          {renderActions()}
        </div>
        {onClose && (
          <button
            className={classes.errorClose}
            onClick={onClose}
            aria-label={t('common.close')}
            type="button"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  // Card Error (default)
  return (
    <div className={classes.errorCard} data-testid={testId}>
      <div className={classes.errorCardIcon}>{getIcon()}</div>
      <Title order={3} className={classes.errorCardTitle}>
        {getTitle()}
      </Title>
      <Text className={classes.errorCardMessage}>{getMessage()}</Text>
      {renderActions()}
      {errorDetails && (
        <div className={classes.errorDetails}>
          <div className={classes.errorDetailsTitle}>{t('states.error.details.title')}</div>
          <div className={classes.errorDetailsContent}>
            {errorDetails.code && (
              <>
                {t('states.error.details.code')}: {errorDetails.code}
                <br />
              </>
            )}
            {errorDetails.requestId && (
              <>
                {t('states.error.details.requestId')}: {errorDetails.requestId}
                <br />
              </>
            )}
            {errorDetails.timestamp && (
              <>
                {t('states.error.details.timestamp')}: {errorDetails.timestamp}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
