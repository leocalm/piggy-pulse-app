import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AccountsPage } from './pages/Accounts.page';
import { CategoriesPage } from './pages/Categories.page';
import { HomePage } from './pages/Home.page';
import { BudgetPage } from '@/pages/Budget.page';
import { TransactionsPage } from '@/pages/Transactions.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/accounts',
    element: <AccountsPage />,
  },
  {
    path: '/categories',
    element: <CategoriesPage />,
  },
  {
    path: '/budget',
    element: <BudgetPage />,
  },
  {
    path: '/transactions',
    element: <TransactionsPage />
  }
]);

export function Router() {
  return <RouterProvider router={router} />;
}
