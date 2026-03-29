import { useCallback, useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Button, SimpleGrid, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  AccountCard,
  CashFlowCard,
  CurrentPeriodCard,
  FixedCategoriesCard,
  NetPositionCard,
  RecentTransactionsCard,
  SpendingTrendCard,
  SubscriptionsCard,
  TopVendorsCard,
  VariableCategoriesCard,
} from '@/components/v2/Dashboard';
import { AddWidgetModal } from '@/components/v2/Dashboard/AddWidgetModal';
import customizeClasses from '@/components/v2/Dashboard/DashboardCustomize.module.css';
import {
  DEFAULT_WIDGET_ORDER,
  WIDGET_DEFINITIONS,
} from '@/components/v2/Dashboard/widgetDefinitions';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts } from '@/hooks/v2/useAccounts';
import { usePreferences, useUpdatePreferences } from '@/hooks/v2/useSettings';
import { toast } from '@/lib/toast';

function renderWidget(widgetId: string, periodId: string) {
  switch (widgetId) {
    case 'current_period':
      return <CurrentPeriodCard periodId={periodId} />;
    case 'net_position':
      return <NetPositionCard periodId={periodId} />;
    case 'cash_flow':
      return <CashFlowCard periodId={periodId} />;
    case 'recent_transactions':
      return <RecentTransactionsCard periodId={periodId} />;
    case 'spending_trend':
      return <SpendingTrendCard periodId={periodId} />;
    case 'top_vendors':
      return <TopVendorsCard periodId={periodId} />;
    case 'variable_categories':
      return <VariableCategoriesCard periodId={periodId} />;
    case 'fixed_categories':
      return <FixedCategoriesCard periodId={periodId} />;
    case 'subscriptions':
      return <SubscriptionsCard periodId={periodId} />;
    default:
      return null;
  }
}

export function DashboardV2Page() {
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: accountsData } = useAccounts();
  const { data: prefsData } = usePreferences();
  const updatePrefs = useUpdatePreferences();

  const [isEditing, setIsEditing] = useState(false);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const accounts = accountsData?.data ?? [];
  const activeAccounts = accounts.filter((a) => a.status === 'active');

  const layout = useMemo(() => {
    const prefs = prefsData?.dashboardLayout;
    const order = prefs?.widgetOrder?.length ? prefs.widgetOrder : DEFAULT_WIDGET_ORDER;
    const hidden = new Set(prefs?.hiddenWidgets ?? []);
    const visibleAccountIds = prefs?.visibleAccountIds ?? null;
    const activeWidgets = order.filter((id) => !hidden.has(id));
    return { order, hidden, activeWidgets, visibleAccountIds };
  }, [prefsData]);

  const [editOrder, setEditOrder] = useState<string[]>([]);
  const [editHidden, setEditHidden] = useState<Set<string>>(new Set());
  const [editAccountIds, setEditAccountIds] = useState<string[] | null>(null);

  const startEditing = () => {
    setEditOrder([...layout.activeWidgets]);
    setEditHidden(new Set(layout.hidden));
    setEditAccountIds(layout.visibleAccountIds ? [...layout.visibleAccountIds] : null);
    setIsEditing(true);
  };

  const saveEditing = async () => {
    try {
      const currentPrefs = prefsData!;
      await updatePrefs.mutateAsync({
        theme: currentPrefs.theme,
        dateFormat: currentPrefs.dateFormat,
        numberFormat: currentPrefs.numberFormat,
        language: currentPrefs.language,
        compactMode: currentPrefs.compactMode,
        colorTheme: currentPrefs.colorTheme,
        dashboardLayout: {
          widgetOrder: editOrder,
          hiddenWidgets: Array.from(editHidden),
          visibleAccountIds: editAccountIds ?? undefined,
        },
      });
      setIsEditing(false);
      toast.success({ message: 'Dashboard layout saved' });
    } catch {
      toast.error({ message: 'Failed to save layout' });
    }
  };

  const handleRemoveWidget = useCallback((id: string) => {
    setEditOrder((prev) => prev.filter((w) => w !== id));
    setEditHidden((prev) => new Set([...prev, id]));
  }, []);

  const handleRemoveAccount = useCallback(
    (accountId: string) => {
      setEditAccountIds((prev) => {
        if (prev === null) {
          return activeAccounts.filter((a) => a.id !== accountId).map((a) => a.id);
        }
        return prev.filter((id) => id !== accountId);
      });
    },
    [activeAccounts]
  );

  const handleAddWidget = useCallback((id: string) => {
    setEditHidden((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setEditOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const handleAddAccount = useCallback((accountId: string) => {
    setEditAccountIds((prev) => {
      if (prev === null) {
        return null;
      }
      return prev.includes(accountId) ? prev : [...prev, accountId];
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEditOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const visibleWidgetIds = isEditing ? editOrder : layout.activeWidgets;
  const visibleAccounts = useMemo(() => {
    const ids = isEditing ? editAccountIds : layout.visibleAccountIds;
    if (ids === null) {
      return activeAccounts;
    }
    const idSet = new Set(ids);
    return activeAccounts.filter((a) => idSet.has(a.id));
  }, [isEditing, editAccountIds, layout.visibleAccountIds, activeAccounts]);

  const activeWidgetIdSet = useMemo(
    () => new Set(isEditing ? editOrder : layout.activeWidgets),
    [isEditing, editOrder, layout.activeWidgets]
  );
  const activeAccountIdSet = useMemo(
    () => new Set(visibleAccounts.map((a) => a.id)),
    [visibleAccounts]
  );

  if (!selectedPeriodId) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <div>
          <Title order={2} fw={700}>
            Dashboard
          </Title>
          <Text c="dimmed" fz="sm">
            No budget period selected. Please select a period to view your dashboard.
          </Text>
        </div>
      </Stack>
    );
  }

  const heroWidgetIds = visibleWidgetIds.filter((id) => {
    const def = WIDGET_DEFINITIONS.find((w) => w.id === id);
    return def?.isHero;
  });
  const gridWidgetIds = visibleWidgetIds.filter((id) => {
    const def = WIDGET_DEFINITIONS.find((w) => w.id === id);
    return def && !def.isHero;
  });

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title order={2} fw={700}>
            Dashboard
          </Title>
          <Text c="dimmed" fz="sm">
            Your finance pulse, at a glance
          </Text>
        </div>
        {isEditing ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="subtle" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveEditing} loading={updatePrefs.isPending}>
              Done
            </Button>
          </div>
        ) : (
          <Button variant="subtle" size="sm" onClick={startEditing}>
            Customize
          </Button>
        )}
      </div>

      {isEditing ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={editOrder} strategy={verticalListSortingStrategy}>
            <Stack gap="sm">
              {editOrder.map((id) => (
                <SortableWidgetPlaceholder key={id} id={id} onRemove={handleRemoveWidget} />
              ))}
            </Stack>
          </SortableContext>

          {visibleAccounts.length > 0 && (
            <Stack gap="sm">
              <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
                Account Cards
              </Text>
              {visibleAccounts.map((acct) => (
                <div key={acct.id} className={customizeClasses.placeholderCard}>
                  <span className={customizeClasses.dragHandle}>
                    <Text fz="sm" c="dimmed">
                      🏦
                    </Text>
                  </span>
                  <div className={customizeClasses.placeholderInfo}>
                    <Text fz="sm" fw={600}>
                      {acct.name}
                    </Text>
                    <Text fz="xs" c="dimmed">
                      Individual account card
                    </Text>
                  </div>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => handleRemoveAccount(acct.id)}
                    aria-label={`Remove ${acct.name}`}
                  >
                    <Text fz="sm">✕</Text>
                  </ActionIcon>
                </div>
              ))}
            </Stack>
          )}

          <UnstyledButton className={customizeClasses.addWidgetButton} onClick={openModal}>
            <Text fz="sm" c="dimmed">
              + Add widget
            </Text>
          </UnstyledButton>
        </DndContext>
      ) : (
        <>
          {heroWidgetIds.map((id) => (
            <div key={id}>{renderWidget(id, selectedPeriodId)}</div>
          ))}

          {gridWidgetIds.length > 0 && (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {gridWidgetIds.map((id) => (
                <div key={id}>{renderWidget(id, selectedPeriodId)}</div>
              ))}
            </SimpleGrid>
          )}

          {visibleAccounts.length > 0 && (
            <>
              <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mt="md">
                Your Accounts
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                {visibleAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    accountId={account.id}
                    periodId={selectedPeriodId}
                  />
                ))}
              </SimpleGrid>
            </>
          )}
        </>
      )}

      <AddWidgetModal
        opened={modalOpened}
        onClose={closeModal}
        activeWidgetIds={activeWidgetIdSet}
        accounts={activeAccounts}
        activeAccountIds={activeAccountIdSet}
        onAddWidget={handleAddWidget}
        onAddAccount={handleAddAccount}
      />
    </Stack>
  );
}

function SortableWidgetPlaceholder({
  id,
  onRemove,
}: {
  id: string;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const def = WIDGET_DEFINITIONS.find((w) => w.id === id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${customizeClasses.placeholderCard} ${isDragging ? customizeClasses.dragging : ''}`}
      {...attributes}
    >
      <span className={customizeClasses.dragHandle} {...listeners}>
        <Text fz="sm" c="dimmed" style={{ cursor: 'grab' }}>
          ⠿
        </Text>
      </span>
      <div className={customizeClasses.placeholderInfo}>
        <Text fz="sm" fw={600}>
          {def?.emoji} {def?.name ?? id}
        </Text>
        <Text fz="xs" c="dimmed">
          {def?.desc ?? ''}
        </Text>
      </div>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        onClick={() => onRemove(id)}
        aria-label={`Remove ${def?.name ?? id}`}
      >
        <Text fz="sm">✕</Text>
      </ActionIcon>
    </div>
  );
}
