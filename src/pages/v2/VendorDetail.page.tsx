import { useParams } from 'react-router-dom';
import { Stack, Text } from '@mantine/core';
import { VendorDetail } from '@/components/v2/Vendors';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';

export function VendorDetailV2Page() {
  const { id } = useParams<{ id: string }>();
  const { selectedPeriodId } = useBudgetPeriodSelection();

  if (!id) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text c="dimmed" fz="sm">
          Vendor not found.
        </Text>
      </Stack>
    );
  }

  if (!selectedPeriodId) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text c="dimmed" fz="sm">
          No budget period selected. Please select a period.
        </Text>
      </Stack>
    );
  }

  return <VendorDetail vendorId={id} periodId={selectedPeriodId} />;
}
