import { AppShell, ThemeToggle } from '@mrms/ui';
import { Navigate, Route, Routes } from 'react-router-dom';

import { DashboardPage } from './pages/DashboardPage';

/** Admin application shell + routes. Route guards (RequireRole) land in Sprint 1B. */
export function App(): JSX.Element {
  return (
    <AppShell title="MRMS" subtitle="Admin" actions={<ThemeToggle />}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
