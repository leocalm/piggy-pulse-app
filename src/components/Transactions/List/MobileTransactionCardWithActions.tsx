import React from 'react';
import { IconArrowRight, IconRepeat } from '@tabler/icons-react';
import { ActionIcon, Card, Group, Stack, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { TransactionResponse } from '@/types/transaction';
import { getIcon } from '@/utils/IconMap';
import { ActionButtons } from '../Table/ActionButtons';

interface MobileTransactionCardWithActionsProps {
  transaction: TransactionResponse;
  onEdit: () => void;
  onDelete: () => void;
}

export const MobileTransactionCardWithActions = ({
  transaction,
  onEdit,
  onDelete,
}: MobileTransactionCardWithActionsProps) => {
  const isTransfer = transaction.category.categoryType === 'Transfer';
  const isOutgoing = transaction.category.categoryType === 'Outgoing';
  const amountColor = isTransfer ? undefined : isOutgoing ? 'red.6' : 'green.6';
  const categoryColor = isTransfer ? undefined : isOutgoing ? 'red.4' : 'green.4';

  return (
    <Card withBorder radius="md" p="sm" style={{ border: '1px solid var(--border-medium)' }}>
      <Stack gap="sm">
        {/* Top section: Icon, Description, Amount */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <ActionIcon
              variant="light"
              color={isTransfer ? 'blue' : categoryColor}
              size="lg"
              radius="md"
              style={{ flexShrink: 0 }}
            >
              {isTransfer ? <IconRepeat size={20} /> : getIcon(transaction.category.icon, 20)}
            </ActionIcon>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={700} truncate>
                {transaction.description}
              </Text>
              {isTransfer ? (
                <Group gap={4} wrap="nowrap">
                  <Text size="xs" c="dimmed">
                    {transaction.fromAccount.name}
                  </Text>
                  <IconArrowRight size={10} />
                  <Text size="xs" c="dimmed">
                    {transaction.toAccount?.name || ''}
                  </Text>
                </Group>
              ) : (
                <Text size="xs" c="dimmed">
                  {`${transaction.category.name} | ${transaction.vendor?.name}`}
                </Text>
              )}
              <Text size="xs" c="dimmed">
                {transaction.occurredAt}
              </Text>
            </div>
          </Group>
          <Text fw={800} size="md" style={{ fontFamily: 'monospace' }} c={amountColor}>
            <CurrencyValue currency={transaction.fromAccount.currency} cents={transaction.amount} />
          </Text>
        </Group>

        {/* Bottom section: Action buttons */}
        <Group justify="flex-end">
          <ActionButtons onEdit={onEdit} onDelete={onDelete} />
        </Group>
      </Stack>
    </Card>
  );
};
