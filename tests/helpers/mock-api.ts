import dayjs from 'dayjs';
import type { BrowserContext, Route } from 'playwright/test';
import type { TestUserCredentials } from './test-data';

interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface MockSession {
  token: string;
  userId: string;
}

interface MockApiResponse {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
}

interface MockCurrency {
  id: string;
  name: string;
  symbol: string;
  currency: string;
  decimal_places: number;
}

interface MockAccount {
  id: string;
  name: string;
  color: string;
  icon: string;
  account_type: string;
  currency: MockCurrency;
  balance: number;
  spend_limit?: number;
}

interface MockCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  parent_id: string | null;
  category_type: 'Incoming' | 'Outgoing' | 'Transfer';
}

interface MockVendor {
  id: string;
  name: string;
}

interface MockPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_auto_generated?: boolean;
}

interface MockTransaction {
  id: string;
  description: string;
  amount: number;
  occurred_at: string;
  category_id: string;
  from_account_id: string;
  to_account_id: string | null;
  vendor_id: string | null;
}

const SESSION_COOKIE_NAME = 'budget_session';

export class MockApiServer {
  private users = new Map<string, MockUser>();
  private sessions = new Map<string, MockSession>();

  private readonly currency: MockCurrency = {
    id: 'currency-eur',
    name: 'Euro',
    symbol: '€',
    currency: 'EUR',
    decimal_places: 2,
  };

  private accounts: MockAccount[] = [
    {
      id: 'account-1',
      name: 'Checking Account',
      color: '#0088cc',
      icon: 'wallet',
      account_type: 'Checking',
      currency: {
        id: 'currency-eur',
        name: 'Euro',
        symbol: '€',
        currency: 'EUR',
        decimal_places: 2,
      },
      balance: 250000,
    },
    {
      id: 'account-2',
      name: 'Savings Account',
      color: '#2f9e44',
      icon: 'bank',
      account_type: 'Savings',
      currency: {
        id: 'currency-eur',
        name: 'Euro',
        symbol: '€',
        currency: 'EUR',
        decimal_places: 2,
      },
      balance: 100000,
    },
  ];

  private categories: MockCategory[] = [
    {
      id: 'category-1',
      name: 'Salary',
      color: '#0ca678',
      icon: '💼',
      parent_id: null,
      category_type: 'Incoming',
    },
    {
      id: 'category-2',
      name: 'Groceries',
      color: '#2f9e44',
      icon: '🛒',
      parent_id: null,
      category_type: 'Outgoing',
    },
    {
      id: 'category-3',
      name: 'Transfer',
      color: '#1c7ed6',
      icon: '🔄',
      parent_id: null,
      category_type: 'Transfer',
    },
  ];

  private vendors: MockVendor[] = [{ id: 'vendor-1', name: 'Demo Vendor' }];

  private periods: MockPeriod[] = [
    {
      id: 'period-1',
      name: 'February 2026',
      start_date: '2026-02-01',
      end_date: '2026-02-28',
    },
  ];

  private transactions: MockTransaction[] = [
    {
      id: 'transaction-1',
      description: 'Grocery Store',
      amount: 2500,
      occurred_at: '2026-02-07',
      category_id: 'category-2',
      from_account_id: 'account-1',
      to_account_id: null,
      vendor_id: 'vendor-1',
    },
  ];

  private accountSequence = 3;
  private categorySequence = 4;
  private vendorSequence = 2;
  private periodSequence = 2;
  private transactionSequence = 2;

  private readonly routeHandler = async (route: Route): Promise<void> => {
    const url = new URL(route.request().url());
    if (!this.shouldHandlePath(url.pathname)) {
      await route.continue();
      return;
    }

    await this.handleRoute(route);
  };

  async install(context: BrowserContext): Promise<void> {
    await context.route('**/*', this.routeHandler);
  }

  async uninstall(context: BrowserContext): Promise<void> {
    await context.unroute('**/*', this.routeHandler);
  }

  createUser(credentials: TestUserCredentials): MockUser {
    const existing = this.users.get(credentials.email.toLowerCase());
    if (existing) {
      return existing;
    }

    const newUser: MockUser = {
      id: `mock-user-${this.users.size + 1}`,
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
    };

    this.users.set(credentials.email.toLowerCase(), newUser);
    return newUser;
  }

  private async handleRoute(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const path = this.normalizeApiPath(url.pathname);
    const method = request.method().toUpperCase();
    const cookieHeader = await request.headerValue('cookie');
    const authUser = this.findAuthenticatedUser(cookieHeader);

    if (method === 'POST' && path === '/users/register') {
      const response = this.handleRegister(this.parseBody(request.postData()));
      await this.fulfill(route, response);
      return;
    }

    if (method === 'POST' && path === '/users/login') {
      const response = this.handleLogin(this.parseBody(request.postData()));
      await this.fulfill(route, response);
      return;
    }

    if (method === 'GET' && path === '/users/me') {
      if (!authUser) {
        await this.fulfill(route, { status: 401, body: { message: 'Unauthorized' } });
        return;
      }

      await this.fulfill(route, {
        body: {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
        },
      });
      return;
    }

    if (method === 'POST' && path === '/users/logout') {
      const sessionToken = this.extractSessionToken(cookieHeader);
      if (sessionToken) {
        this.sessions.delete(sessionToken);
      }

      await this.fulfill(route, {
        body: { success: true },
        headers: {
          'set-cookie': `${SESSION_COOKIE_NAME}=deleted; Path=/; Max-Age=0`,
        },
      });
      return;
    }

    if (!authUser) {
      await this.fulfill(route, { status: 401, body: { message: 'Unauthorized' } });
      return;
    }

    const response = this.resolveAuthenticatedRoute(method, path, request.postData());
    await this.fulfill(route, response);
  }

  private resolveAuthenticatedRoute(
    method: string,
    path: string,
    rawBody: string | null
  ): MockApiResponse {
    const body = this.parseBody(rawBody);

    if (method === 'GET' && path === '/currencies') {
      return { body: [this.currency] };
    }

    if (method === 'GET' && path === '/overlays') {
      return { body: [] };
    }

    if (method === 'GET' && path === '/budgets') {
      return {
        body: [
          {
            id: 'budget-1',
            name: 'Main Budget',
            start_day: 1,
          },
        ],
      };
    }

    if (method === 'GET' && path === '/budget-categories') {
      return { body: [] };
    }

    if (method === 'GET' && path === '/budget_period') {
      return {
        body: this.periods.map((period) => this.toPeriodResponse(period)),
      };
    }

    if (method === 'GET' && path === '/budget_period/current') {
      return {
        body: this.getCurrentPeriodResponse(),
      };
    }

    if (method === 'POST' && path === '/budget_period') {
      const created = this.createPeriod(body);
      return { body: created.id };
    }

    if (method === 'PUT' && path.startsWith('/budget_period/')) {
      const id = path.replace('/budget_period/', '');
      const updated = this.updatePeriod(id, body);
      if (!updated) {
        return { status: 404, body: { message: 'Period not found' } };
      }

      return { body: this.toPeriodResponse(updated) };
    }

    if (method === 'DELETE' && path.startsWith('/budget_period/')) {
      const id = path.replace('/budget_period/', '');
      this.periods = this.periods.filter((period) => period.id !== id);
      return { status: 204, body: {} };
    }

    if (method === 'GET' && path === '/budget_period/gaps') {
      return {
        body: {
          unassigned_count: 0,
          transactions: [],
        },
      };
    }

    if (method === 'GET' && path === '/budget_period/schedule') {
      return { status: 404, body: { message: 'Not Found' } };
    }

    if (method === 'GET' && path === '/accounts') {
      return { body: this.accounts.map((account) => this.toAccountResponse(account)) };
    }

    if (method === 'POST' && path === '/accounts') {
      const created = this.createAccount(body);
      return { status: 201, body: this.toAccountResponse(created) };
    }

    if (method === 'PUT' && path.startsWith('/accounts/')) {
      const id = path.replace('/accounts/', '');
      const updated = this.updateAccount(id, body);
      if (!updated) {
        return { status: 404, body: { message: 'Account not found' } };
      }

      return { body: this.toAccountResponse(updated) };
    }

    if (method === 'DELETE' && path.startsWith('/accounts/')) {
      const id = path.replace('/accounts/', '');
      this.accounts = this.accounts.filter((account) => account.id !== id);
      this.transactions = this.transactions.filter(
        (transaction) => transaction.from_account_id !== id && transaction.to_account_id !== id
      );
      return { status: 204, body: {} };
    }

    if (method === 'GET' && path === '/categories') {
      return { body: this.categories.map((category) => this.toCategoryWithStats(category)) };
    }

    if (method === 'GET' && path === '/categories/not-in-budget') {
      return { body: [] };
    }

    if (method === 'POST' && path === '/categories') {
      const created = this.createCategory(body);
      return { status: 201, body: created };
    }

    if (method === 'PUT' && path.startsWith('/categories/')) {
      const id = path.replace('/categories/', '');
      const updated = this.updateCategory(id, body);
      if (!updated) {
        return { status: 404, body: { message: 'Category not found' } };
      }
      return { body: updated };
    }

    if (method === 'DELETE' && path.startsWith('/categories/')) {
      const id = path.replace('/categories/', '');
      this.categories = this.categories.filter((category) => category.id !== id);
      this.transactions = this.transactions.filter((transaction) => transaction.category_id !== id);
      return { status: 204, body: {} };
    }

    if (method === 'GET' && path === '/vendors') {
      return { body: this.vendors.map((vendor) => this.toVendorWithStats(vendor)) };
    }

    if (method === 'POST' && path === '/vendors') {
      const name = this.readString(body.name);
      if (!name) {
        return { status: 422, body: { message: 'Vendor name is required' } };
      }

      const existing = this.vendors.find(
        (vendor) => vendor.name.toLowerCase() === name.toLowerCase()
      );
      if (existing) {
        return { body: existing };
      }

      const created: MockVendor = {
        id: `vendor-${this.vendorSequence}`,
        name,
      };
      this.vendorSequence += 1;
      this.vendors.push(created);

      return { status: 201, body: created };
    }

    if (method === 'PUT' && path.startsWith('/vendors/')) {
      const id = path.replace('/vendors/', '');
      const vendor = this.vendors.find((item) => item.id === id);
      if (!vendor) {
        return { status: 404, body: { message: 'Vendor not found' } };
      }

      vendor.name = this.readString(body.name) || vendor.name;
      return { body: vendor };
    }

    if (method === 'DELETE' && path.startsWith('/vendors/')) {
      const id = path.replace('/vendors/', '');
      this.vendors = this.vendors.filter((vendor) => vendor.id !== id);
      this.transactions = this.transactions.map((transaction) =>
        transaction.vendor_id === id
          ? {
              ...transaction,
              vendor_id: null,
            }
          : transaction
      );
      return { status: 204, body: {} };
    }

    if (method === 'GET' && path === '/transactions') {
      return {
        body: this.transactions.map((transaction) => this.toTransactionResponse(transaction)),
      };
    }

    if (method === 'POST' && path === '/transactions') {
      const created = this.createTransaction(body);
      if (!created) {
        return { status: 422, body: { message: 'Invalid transaction payload' } };
      }

      return { status: 201, body: this.toTransactionResponse(created) };
    }

    if (method === 'PUT' && path.startsWith('/transactions/')) {
      const id = path.replace('/transactions/', '');
      const updated = this.updateTransaction(id, body);
      if (!updated) {
        return { status: 404, body: { message: 'Transaction not found' } };
      }

      return { body: this.toTransactionResponse(updated) };
    }

    if (method === 'DELETE' && path.startsWith('/transactions/')) {
      const id = path.replace('/transactions/', '');
      this.transactions = this.transactions.filter((transaction) => transaction.id !== id);
      return { status: 204, body: {} };
    }

    if (method === 'GET' && path === '/dashboard/spent-per-category') {
      return { body: this.getSpentPerCategory() };
    }

    if (method === 'GET' && path === '/dashboard/monthly-burn-in') {
      return {
        body: {
          total_budget: 500000,
          spent_budget: this.getTotalSpentOutgoing(),
          current_day: 10,
          days_in_period: 28,
        },
      };
    }

    if (method === 'GET' && path === '/dashboard/month-progress') {
      return {
        body: {
          current_date: '2026-02-10',
          days_in_period: 28,
          remaining_days: 18,
          days_passed_percentage: 35.7,
        },
      };
    }

    if (method === 'GET' && path === '/dashboard/recent-transactions') {
      return {
        body: [...this.transactions]
          .sort(
            (left, right) => dayjs(right.occurred_at).valueOf() - dayjs(left.occurred_at).valueOf()
          )
          .slice(0, 5)
          .map((transaction) => this.toTransactionResponse(transaction)),
      };
    }

    if (method === 'GET' && path === '/dashboard/budget-per-day') {
      const today = dayjs('2026-02-10').format('YYYY-MM-DD');
      return {
        body: this.accounts.map((account) => ({
          account_name: account.name,
          date: today,
          balance: account.balance,
        })),
      };
    }

    if (method === 'GET' && path === '/dashboard/total-assets') {
      const totalAssets = this.accounts.reduce((sum, account) => sum + account.balance, 0);
      return {
        body: {
          total_assets: totalAssets,
        },
      };
    }

    return {
      status: 404,
      body: { message: `Unhandled mock route: ${method} ${path}` },
    };
  }

  private createAccount(payload: Record<string, unknown>): MockAccount {
    const account: MockAccount = {
      id: `account-${this.accountSequence}`,
      name: this.readString(payload.name) || `Account ${this.accountSequence}`,
      color: this.readString(payload.color) || '#228be6',
      icon: this.readString(payload.icon) || 'wallet',
      account_type: this.readString(payload.account_type) || 'Checking',
      currency: this.currency,
      balance: this.readNumber(payload.balance),
      spend_limit: this.readOptionalNumber(payload.spend_limit),
    };

    this.accountSequence += 1;
    this.accounts.push(account);
    return account;
  }

  private updateAccount(id: string, payload: Record<string, unknown>): MockAccount | null {
    const account = this.accounts.find((item) => item.id === id);
    if (!account) {
      return null;
    }

    account.name = this.readString(payload.name) || account.name;
    account.color = this.readString(payload.color) || account.color;
    account.icon = this.readString(payload.icon) || account.icon;
    account.account_type = this.readString(payload.account_type) || account.account_type;

    if (payload.balance !== undefined) {
      account.balance = this.readNumber(payload.balance);
    }

    if (payload.spend_limit !== undefined) {
      account.spend_limit = this.readOptionalNumber(payload.spend_limit);
    }

    return account;
  }

  private createCategory(payload: Record<string, unknown>): MockCategory {
    const categoryType = this.readCategoryType(payload.category_type);
    const category: MockCategory = {
      id: `category-${this.categorySequence}`,
      name: this.readString(payload.name) || `Category ${this.categorySequence}`,
      color: this.readString(payload.color) || '#868e96',
      icon: this.readString(payload.icon) || '🏷️',
      parent_id: this.readNullableString(payload.parent_id),
      category_type: categoryType,
    };

    this.categorySequence += 1;
    this.categories.push(category);
    return category;
  }

  private updateCategory(id: string, payload: Record<string, unknown>): MockCategory | null {
    const category = this.categories.find((item) => item.id === id);
    if (!category) {
      return null;
    }

    category.name = this.readString(payload.name) || category.name;
    category.color = this.readString(payload.color) || category.color;
    category.icon = this.readString(payload.icon) || category.icon;
    category.parent_id = this.readNullableString(payload.parent_id);
    category.category_type = this.readCategoryType(payload.category_type, category.category_type);

    return category;
  }

  private createPeriod(payload: Record<string, unknown>): MockPeriod {
    const startDate = this.readString(payload.start_date) || dayjs().format('YYYY-MM-DD');
    const endDate =
      this.readString(payload.end_date) || dayjs(startDate).add(1, 'month').format('YYYY-MM-DD');
    const name = this.readString(payload.name) || dayjs(startDate).format('MMMM YYYY');

    const created: MockPeriod = {
      id: `period-${this.periodSequence}`,
      name,
      start_date: startDate,
      end_date: endDate,
    };

    this.periodSequence += 1;
    this.periods.push(created);
    return created;
  }

  private updatePeriod(id: string, payload: Record<string, unknown>): MockPeriod | null {
    const period = this.periods.find((item) => item.id === id);
    if (!period) {
      return null;
    }

    period.name = this.readString(payload.name) || period.name;
    period.start_date = this.readString(payload.start_date) || period.start_date;
    period.end_date = this.readString(payload.end_date) || period.end_date;
    return period;
  }

  private createTransaction(payload: Record<string, unknown>): MockTransaction | null {
    const categoryId = this.readString(payload.category_id);
    const fromAccountId = this.readString(payload.from_account_id);
    const occurredAt = this.readString(payload.occurred_at) || dayjs().format('YYYY-MM-DD');

    if (!categoryId || !fromAccountId) {
      return null;
    }

    const category = this.categories.find((item) => item.id === categoryId);
    const fromAccount = this.accounts.find((item) => item.id === fromAccountId);
    if (!category || !fromAccount) {
      return null;
    }

    const toAccountId = this.readNullableString(payload.to_account_id);
    const vendorId = this.readNullableString(payload.vendor_id);

    const transaction: MockTransaction = {
      id: `transaction-${this.transactionSequence}`,
      description: this.readString(payload.description) || 'New transaction',
      amount: this.readNumber(payload.amount),
      occurred_at: occurredAt,
      category_id: category.id,
      from_account_id: fromAccount.id,
      to_account_id: toAccountId,
      vendor_id: vendorId,
    };

    this.transactionSequence += 1;
    this.transactions.push(transaction);
    this.applyTransactionToAccounts(transaction);
    return transaction;
  }

  private updateTransaction(id: string, payload: Record<string, unknown>): MockTransaction | null {
    const transaction = this.transactions.find((item) => item.id === id);
    if (!transaction) {
      return null;
    }

    transaction.description = this.readString(payload.description) || transaction.description;
    if (payload.amount !== undefined) {
      transaction.amount = this.readNumber(payload.amount);
    }

    transaction.occurred_at = this.readString(payload.occurred_at) || transaction.occurred_at;

    const categoryId = this.readString(payload.category_id);
    if (categoryId && this.categories.some((category) => category.id === categoryId)) {
      transaction.category_id = categoryId;
    }

    const fromAccountId = this.readString(payload.from_account_id);
    if (fromAccountId && this.accounts.some((account) => account.id === fromAccountId)) {
      transaction.from_account_id = fromAccountId;
    }

    if (payload.to_account_id !== undefined) {
      transaction.to_account_id = this.readNullableString(payload.to_account_id);
    }

    if (payload.vendor_id !== undefined) {
      transaction.vendor_id = this.readNullableString(payload.vendor_id);
    }

    return transaction;
  }

  private applyTransactionToAccounts(transaction: MockTransaction): void {
    const category = this.categories.find((item) => item.id === transaction.category_id);
    if (!category) {
      return;
    }

    const fromAccount = this.accounts.find((item) => item.id === transaction.from_account_id);
    if (!fromAccount) {
      return;
    }

    if (category.category_type === 'Incoming') {
      fromAccount.balance += transaction.amount;
      return;
    }

    if (category.category_type === 'Outgoing') {
      fromAccount.balance -= transaction.amount;
      return;
    }

    if (category.category_type === 'Transfer') {
      fromAccount.balance -= transaction.amount;

      if (transaction.to_account_id) {
        const toAccount = this.accounts.find((item) => item.id === transaction.to_account_id);
        if (toAccount) {
          toAccount.balance += transaction.amount;
        }
      }
    }
  }

  private getCurrentPeriodResponse(): Record<string, unknown> {
    const today = dayjs('2026-02-10');

    const current = this.periods.find((period) => {
      const start = dayjs(period.start_date).startOf('day');
      const end = dayjs(period.end_date).startOf('day');
      return today.isAfter(start.subtract(1, 'day')) && today.isBefore(end.add(1, 'day'));
    });

    return this.toPeriodResponse(current || this.periods[0]);
  }

  private toPeriodResponse(period: MockPeriod | undefined): Record<string, unknown> {
    if (!period) {
      return {
        id: 'period-fallback',
        name: 'Fallback Period',
        start_date: '2026-02-01',
        end_date: '2026-02-28',
        transaction_count: this.transactions.length,
        budget_used_percentage: 0,
      };
    }

    const transactionCount = this.transactions.filter((transaction) => {
      const occurred = dayjs(transaction.occurred_at).startOf('day');
      return (
        occurred.isAfter(dayjs(period.start_date).subtract(1, 'day')) &&
        occurred.isBefore(dayjs(period.end_date).add(1, 'day'))
      );
    }).length;

    return {
      id: period.id,
      name: period.name,
      start_date: period.start_date,
      end_date: period.end_date,
      is_auto_generated: period.is_auto_generated || false,
      transaction_count: transactionCount,
      budget_used_percentage: 0,
    };
  }

  private toAccountResponse(account: MockAccount): Record<string, unknown> {
    const relatedTransactions = this.transactions.filter(
      (transaction) =>
        transaction.from_account_id === account.id || transaction.to_account_id === account.id
    );

    return {
      id: account.id,
      name: account.name,
      color: account.color,
      icon: account.icon,
      account_type: account.account_type,
      currency: account.currency,
      balance: account.balance,
      spend_limit: account.spend_limit,
      balance_per_day: [
        {
          date: '2026-02-01',
          balance: account.balance,
        },
      ],
      balance_change_this_period: 0,
      transaction_count: relatedTransactions.length,
    };
  }

  private toCategoryWithStats(category: MockCategory): Record<string, unknown> {
    const relatedTransactions = this.transactions.filter(
      (transaction) => transaction.category_id === category.id
    );

    const usedInPeriod = relatedTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    return {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      parent_id: category.parent_id,
      category_type: category.category_type,
      used_in_period: usedInPeriod,
      difference_vs_average_percentage: 0,
      transaction_count: relatedTransactions.length,
    };
  }

  private toVendorWithStats(vendor: MockVendor): Record<string, unknown> {
    const relatedTransactions = this.transactions.filter(
      (transaction) => transaction.vendor_id === vendor.id
    );

    const latest = [...relatedTransactions]
      .sort((left, right) => dayjs(right.occurred_at).valueOf() - dayjs(left.occurred_at).valueOf())
      .at(0);

    return {
      id: vendor.id,
      name: vendor.name,
      transaction_count: relatedTransactions.length,
      last_used_at: latest?.occurred_at,
    };
  }

  private toTransactionResponse(transaction: MockTransaction): Record<string, unknown> {
    const category = this.categories.find((item) => item.id === transaction.category_id);
    const fromAccount = this.accounts.find((item) => item.id === transaction.from_account_id);
    const toAccount = transaction.to_account_id
      ? this.accounts.find((item) => item.id === transaction.to_account_id)
      : null;
    const vendor = transaction.vendor_id
      ? this.vendors.find((item) => item.id === transaction.vendor_id)
      : null;

    if (!category || !fromAccount) {
      throw new Error(`Invalid mock transaction state: ${transaction.id}`);
    }

    return {
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      occurred_at: transaction.occurred_at,
      category: {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        parent_id: category.parent_id,
        category_type: category.category_type,
      },
      from_account: this.toAccountResponse(fromAccount),
      to_account: toAccount ? this.toAccountResponse(toAccount) : null,
      vendor: vendor
        ? {
            id: vendor.id,
            name: vendor.name,
          }
        : null,
    };
  }

  private getSpentPerCategory(): Array<Record<string, unknown>> {
    const spendingCategories = this.categories.filter(
      (category) => category.category_type === 'Outgoing'
    );

    return spendingCategories.map((category) => {
      const spent = this.transactions
        .filter((transaction) => transaction.category_id === category.id)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const budgetedValue = 150000;
      const percentageSpent = budgetedValue > 0 ? Math.round((spent / budgetedValue) * 100) : 0;

      return {
        category_name: category.name,
        budgeted_value: budgetedValue,
        amount_spent: spent,
        percentage_spent: percentageSpent,
      };
    });
  }

  private getTotalSpentOutgoing(): number {
    return this.transactions
      .filter((transaction) => {
        const category = this.categories.find((item) => item.id === transaction.category_id);
        return category?.category_type === 'Outgoing';
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  private handleRegister(payload: Record<string, unknown>): MockApiResponse {
    const email = this.readString(payload.email);
    const name = this.readString(payload.name);
    const password = this.readString(payload.password);

    if (!email || !name || !password) {
      return {
        status: 422,
        body: { message: 'Invalid registration payload' },
      };
    }

    const existing = this.users.get(email.toLowerCase());
    if (existing) {
      return {
        status: 409,
        body: { message: 'User already exists' },
      };
    }

    const user = this.createUser({ name, email, password });
    return {
      status: 201,
      body: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  private handleLogin(payload: Record<string, unknown>): MockApiResponse {
    const email = this.readString(payload.email);
    const password = this.readString(payload.password);

    const user = this.users.get(email.toLowerCase());
    if (!user || user.password !== password) {
      return {
        status: 401,
        body: { message: 'Invalid email or password' },
      };
    }

    const token = `mock-session-${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
    this.sessions.set(token, {
      token,
      userId: user.id,
    });

    return {
      status: 200,
      body: { success: true },
      headers: {
        'set-cookie': `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly`,
      },
    };
  }

  private findAuthenticatedUser(rawCookieHeader: string | null): MockUser | null {
    const token = this.extractSessionToken(rawCookieHeader);
    if (!token) {
      return null;
    }

    const session = this.sessions.get(token);
    if (!session) {
      return null;
    }

    for (const user of this.users.values()) {
      if (user.id === session.userId) {
        return user;
      }
    }

    return null;
  }

  private extractSessionToken(rawCookieHeader: string | null): string | null {
    if (!rawCookieHeader) {
      return null;
    }

    const cookiePairs = rawCookieHeader.split(';').map((part) => part.trim());
    const sessionCookie = cookiePairs.find((entry) =>
      entry.toLowerCase().startsWith(`${SESSION_COOKIE_NAME}=`)
    );

    if (!sessionCookie) {
      return null;
    }

    const [, value] = sessionCookie.split('=', 2);
    return value || null;
  }

  private normalizeApiPath(pathname: string): string {
    if (pathname.startsWith('/api/v1/')) {
      return pathname.slice('/api/v1'.length);
    }

    if (pathname === '/api/v1') {
      return '/';
    }

    if (pathname.startsWith('/api/')) {
      return pathname.slice('/api'.length);
    }

    if (pathname === '/api') {
      return '/';
    }

    return pathname;
  }

  private shouldHandlePath(pathname: string): boolean {
    return pathname === '/api' || pathname.startsWith('/api/');
  }

  private parseBody(rawBody: string | null): Record<string, unknown> {
    if (!rawBody) {
      return {};
    }

    try {
      const parsed = JSON.parse(rawBody) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  }

  private readString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private readNullableString(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const stringValue = this.readString(value);
    return stringValue.length > 0 ? stringValue : null;
  }

  private readNumber(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return 0;
  }

  private readOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    return this.readNumber(value);
  }

  private readCategoryType(
    value: unknown,
    fallback: MockCategory['category_type'] = 'Outgoing'
  ): MockCategory['category_type'] {
    if (value === 'Incoming' || value === 'Outgoing' || value === 'Transfer') {
      return value;
    }

    return fallback;
  }

  private async fulfill(route: Route, response: MockApiResponse): Promise<void> {
    const status = response.status ?? 200;
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...response.headers,
    };

    await route.fulfill({
      status,
      headers,
      body: JSON.stringify(response.body ?? {}),
    });
  }
}
