import { IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Alert, Stepper } from '@mantine/core';
import { completeOnboarding } from '@/api/onboarding';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { FocusLayout } from './FocusLayout';
import { AccountsStep } from './steps/AccountsStep';
import { CategoriesStep } from './steps/CategoriesStep';
import { PeriodModelStep } from './steps/PeriodModelStep';
import { SummaryStep } from './steps/SummaryStep';

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { activeStep, isResuming, isLoading, goToStep, markStepComplete } = useOnboardingWizard();

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
    </FocusLayout>
  );
}
