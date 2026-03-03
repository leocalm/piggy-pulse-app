import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { fetchAccounts } from '@/api/account';
import { fetchCategories } from '@/api/category';
import { fetchPeriodModel } from '@/api/settings';
import { SummaryStep } from './SummaryStep';

vi.mock('@/api/account', () => ({ fetchAccounts: vi.fn() }));
vi.mock('@/api/category', () => ({ fetchCategories: vi.fn() }));
vi.mock('@/api/settings', () => ({ fetchPeriodModel: vi.fn() }));

function renderStep(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

const mockAccounts = [
  {
    id: '1',
    name: 'My Checking',
    accountType: 'Checking',
    balance: 100000,
    currency: { currency: 'USD', symbol: '$', decimalPlaces: 2 },
    isArchived: false,
  },
];

const mockCategories = [
  {
    id: '1',
    name: 'Income',
    categoryType: 'Incoming',
    parentId: null,
    isSystem: false,
    isArchived: false,
  },
  {
    id: '2',
    name: 'Housing',
    categoryType: 'Outgoing',
    parentId: null,
    isSystem: false,
    isArchived: false,
  },
];

const mockPeriodModel = {
  periodMode: 'automatic',
  periodSchedule: {
    startDay: 1,
    durationValue: 1,
    durationUnit: 'Month',
    generateAhead: 3,
    saturdayAdjustment: 'keep',
    sundayAdjustment: 'keep',
    namePattern: '{MONTH} {YEAR}',
  },
};

describe('SummaryStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchAccounts).mockResolvedValue(mockAccounts as any);
    vi.mocked(fetchCategories).mockResolvedValue(mockCategories as any);
    vi.mocked(fetchPeriodModel).mockResolvedValue(mockPeriodModel as any);
  });

  it('shows account names after loading', async () => {
    renderStep(<SummaryStep onEnter={vi.fn()} onBack={vi.fn()} />);
    expect(await screen.findByText('My Checking')).toBeInTheDocument();
  });

  it('shows period information', async () => {
    renderStep(<SummaryStep onEnter={vi.fn()} onBack={vi.fn()} />);
    await screen.findByText('My Checking');
    expect(screen.getByText(/monthly/i)).toBeInTheDocument();
  });

  it('shows categories grouped by type', async () => {
    renderStep(<SummaryStep onEnter={vi.fn()} onBack={vi.fn()} />);
    await screen.findByText('Income');
    expect(screen.getByText('Housing')).toBeInTheDocument();
  });

  it('calls onEnter when Enter PiggyPulse is clicked', async () => {
    const onEnter = vi.fn();
    renderStep(<SummaryStep onEnter={onEnter} onBack={vi.fn()} />);
    await screen.findByText('My Checking');
    fireEvent.click(screen.getByRole('button', { name: /enter piggypulse/i }));
    expect(onEnter).toHaveBeenCalled();
  });

  it('Back button calls onBack', async () => {
    const onBack = vi.fn();
    renderStep(<SummaryStep onEnter={vi.fn()} onBack={onBack} />);
    await screen.findByText('My Checking');
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });
});
