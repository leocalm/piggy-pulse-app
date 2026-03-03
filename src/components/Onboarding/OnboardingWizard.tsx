import { IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Group, Stepper, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { completeOnboarding } from '@/api/onboarding';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { FocusLayout } from './FocusLayout';
import { AccountsStep } from './steps/AccountsStep';
import { CategoriesStep } from './steps/CategoriesStep';
import { PeriodModelStep } from './steps/PeriodModelStep';
import { SummaryStep } from './steps/SummaryStep';

const STEP_LABELS = ['Period', 'Accounts', 'Categories', 'Summary'];

interface StepChipsProps {
  activeStep: number;
}

function StepChips({ activeStep }: StepChipsProps) {
  const theme = useMantineTheme();
  const primary = theme.colors[theme.primaryColor][5];

  return (
    <Group gap={8} align="center" mb="lg">
      {STEP_LABELS.map((label, i) => {
        const isActive = i === activeStep;
        const isDone = i < activeStep;
        return (
          <Box
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Box
              style={{
                width: isActive ? undefined : 10,
                height: 10,
                borderRadius: 999,
                padding: isActive ? '4px 12px' : 0,
                background: isActive
                  ? primary
                  : isDone
                    ? primary
                    : 'var(--mantine-color-default-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              {isActive && (
                <Text size="xs" fw={600} c="white" style={{ lineHeight: 1 }}>
                  {label}
                </Text>
              )}
            </Box>
          </Box>
        );
      })}
    </Group>
  );
}

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { activeStep, isResuming, isLoading, goToStep, markStepComplete } = useOnboardingWizard();
  const isMobile = useMediaQuery('(max-width: 48em)');

  async function handleComplete() {
    await completeOnboarding();
    void navigate('/dashboard', { replace: true });
  }

  if (isLoading) {
    return null;
  }

  return (
    <FocusLayout>
      {isResuming && (
        <Alert icon={<IconInfoCircle size={16} />} mb="lg" withCloseButton>
          Your setup was saved. Continue where you left off.
        </Alert>
      )}

      {isMobile ? (
        <>
          <StepChips activeStep={activeStep} />
          {activeStep === 0 && <PeriodModelStep onComplete={() => markStepComplete(0)} />}
          {activeStep === 1 && (
            <AccountsStep onComplete={() => markStepComplete(1)} onBack={() => goToStep(0)} />
          )}
          {activeStep === 2 && (
            <CategoriesStep onComplete={() => markStepComplete(2)} onBack={() => goToStep(1)} />
          )}
          {activeStep === 3 && <SummaryStep onEnter={handleComplete} onBack={() => goToStep(2)} />}
        </>
      ) : (
        <Stepper active={activeStep} onStepClick={goToStep}>
          <Stepper.Step label="Period">
            <PeriodModelStep onComplete={() => markStepComplete(0)} />
          </Stepper.Step>
          <Stepper.Step label="Accounts">
            <AccountsStep onComplete={() => markStepComplete(1)} onBack={() => goToStep(0)} />
          </Stepper.Step>
          <Stepper.Step label="Categories">
            <CategoriesStep onComplete={() => markStepComplete(2)} onBack={() => goToStep(1)} />
          </Stepper.Step>
          <Stepper.Step label="Summary">
            <SummaryStep onEnter={handleComplete} onBack={() => goToStep(2)} />
          </Stepper.Step>
        </Stepper>
      )}
    </FocusLayout>
  );
}
