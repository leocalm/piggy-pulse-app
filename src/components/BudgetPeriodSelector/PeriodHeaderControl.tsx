import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useBudgetPeriods } from '@/hooks/useBudget';
import { BudgetPeriodSelector } from './BudgetPeriodSelector';
import classes from './BudgetPeriodSelector.module.css';

export function PeriodHeaderControl() {
  const { data: periods = [] } = useBudgetPeriods();
  const { selectedPeriodId, setSelectedPeriodId } = useBudgetPeriodSelection();

  return (
    <div className={classes.headerControl}>
      <BudgetPeriodSelector
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        onPeriodChange={setSelectedPeriodId}
      />
    </div>
  );
}
