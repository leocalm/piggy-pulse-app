import { BasicAppShell } from '@/AppShell';
import { Dashboard } from '@/components/Dashboard/Dashboard';

export function HomePage() {
  return (
    <BasicAppShell>
      <Dashboard />
    </BasicAppShell>
  );
}
