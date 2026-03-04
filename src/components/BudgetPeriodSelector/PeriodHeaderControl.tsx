import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useBudgetPeriods } from '@/hooks/useBudget';
import { BudgetPeriodSelector } from './BudgetPeriodSelector';
import classes from './BudgetPeriodSelector.module.css';

export function PeriodHeaderControl({ fullWidth }: { fullWidth?: boolean }) {
  const { data: periods = [] } = useBudgetPeriods();
  const { selectedPeriodId, setSelectedPeriodId } = useBudgetPeriodSelection();

  return (
    <div
      className={classes.headerControl}
      style={fullWidth ? { width: '100%', minWidth: 0 } : undefined}
    >
      <BudgetPeriodSelector
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        onPeriodChange={setSelectedPeriodId}
      />
    </div>
  );
}
