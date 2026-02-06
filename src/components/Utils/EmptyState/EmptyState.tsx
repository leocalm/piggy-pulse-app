import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Group, Text, Title } from '@mantine/core';
import classes from './EmptyState.module.css';

export type EmptyStateVariant = 'standard' | 'solid' | 'compact' | 'inline' | 'search' | 'filter';

export interface EmptyStateAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

export interface EmptyStateExample {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}

export interface OnboardingStep {
  title: string;
  description: string;
}

export interface FilterTag {
  label: string;
  onRemove: () => void;
}

export interface EmptyStateProps {
  /** Visual variant of the empty state */
  variant?: EmptyStateVariant;
  /** Icon or emoji to display */
  icon?: string | ReactNode;
  /** Main title text */
  title: string;
  /** Description message */
  message?: string;
  /** Primary action button */
  primaryAction?: EmptyStateAction;
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  /** List of tips to display */
  tips?: string[];
  /** Example cards for suggestions */
  examples?: EmptyStateExample[];
  /** Onboarding steps for first-time users */
  onboardingSteps?: OnboardingStep[];
  /** Search query to display (for search variant) */
  searchQuery?: string;
  /** Active filter tags (for filter variant) */
  filterTags?: FilterTag[];
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * EmptyState component for displaying when no data is available.
 * Supports multiple variants for different contexts.
 */
export function EmptyState({
  variant = 'standard',
  icon = '📭',
  title,
  message,
  primaryAction,
  secondaryAction,
  tips,
  examples,
  onboardingSteps,
  searchQuery,
  filterTags,
  'data-testid': testId,
}: EmptyStateProps) {
  const { t } = useTranslation();

  const containerClass = [
    classes.emptyState,
    variant === 'solid' && classes.solid,
    variant === 'compact' && classes.compact,
    variant === 'inline' && classes.inline,
    variant === 'search' && classes.search,
    variant === 'filter' && classes.search,
  ]
    .filter(Boolean)
    .join(' ');

  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <div className={classes.illustration}>{icon}</div>;
    }
    return <div className={classes.illustration}>{icon}</div>;
  };

  const renderMessage = () => {
    if (!message && !searchQuery) {
      return null;
    }

    if (variant === 'search' && searchQuery) {
      return (
        <Text className={classes.message}>
          {message || t('states.empty.search.noResults')}{' '}
          <span className={classes.searchQuery}>"{searchQuery}"</span>
        </Text>
      );
    }

    return <Text className={classes.message}>{message}</Text>;
  };

  const renderActions = () => {
    if (!primaryAction && !secondaryAction) {
      return null;
    }

    return (
      <Group className={classes.actions} mt={onboardingSteps ? 'xl' : undefined}>
        {primaryAction && (
          <Button
            leftSection={primaryAction.icon}
            onClick={primaryAction.onClick}
            variant="gradient"
            gradient={{ from: 'cyan', to: 'violet' }}
          >
            {primaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            leftSection={secondaryAction.icon}
            onClick={secondaryAction.onClick}
            variant="default"
          >
            {secondaryAction.label}
          </Button>
        )}
      </Group>
    );
  };

  const renderTips = () => {
    if (!tips || tips.length === 0) {
      return null;
    }

    return (
      <div className={classes.tips}>
        <div className={classes.tipsTitle}>
          <span>💡</span>
          <span>{t('states.empty.tips.title')}</span>
        </div>
        {tips.map((tip, index) => (
          <div key={index} className={classes.tip}>
            {tip}
          </div>
        ))}
      </div>
    );
  };

  const renderExamples = () => {
    if (!examples || examples.length === 0) {
      return null;
    }

    return (
      <div className={classes.examples}>
        {examples.map((example, index) => (
          <Box
            key={index}
            className={classes.exampleCard}
            onClick={example.onClick}
            role={example.onClick ? 'button' : undefined}
            tabIndex={example.onClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (example.onClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                example.onClick();
              }
            }}
          >
            <div className={classes.exampleIcon}>{example.icon}</div>
            <div className={classes.exampleTitle}>{example.title}</div>
            <div className={classes.exampleDescription}>{example.description}</div>
          </Box>
        ))}
      </div>
    );
  };

  const renderOnboardingSteps = () => {
    if (!onboardingSteps || onboardingSteps.length === 0) {
      return null;
    }

    return (
      <div className={classes.onboardingSteps}>
        {onboardingSteps.map((step, index) => (
          <div key={index} className={classes.onboardingStep}>
            <div className={classes.onboardingNumber}>{index + 1}</div>
            <div className={classes.onboardingContent}>
              <div className={classes.onboardingStepTitle}>{step.title}</div>
              <div className={classes.onboardingStepDescription}>{step.description}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFilterTags = () => {
    if (!filterTags || filterTags.length === 0) {
      return null;
    }

    return (
      <div className={classes.filterTags}>
        {filterTags.map((tag, index) => (
          <div key={index} className={classes.filterTag}>
            <span>{tag.label}</span>
            <span
              className={classes.filterRemove}
              onClick={tag.onRemove}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  tag.onRemove();
                }
              }}
              aria-label={t('states.empty.filter.removeTag', { tag: tag.label })}
            >
              ✕
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={containerClass} data-testid={testId}>
      {renderIcon()}
      <Title order={3} className={classes.title}>
        {title}
      </Title>
      {renderMessage()}
      {variant === 'filter' && renderFilterTags()}
      {renderOnboardingSteps()}
      {renderExamples()}
      {renderActions()}
      {renderTips()}
    </div>
  );
}
