import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mrms/ui';

import { BackendStatusCard } from '../components/BackendStatusCard';

/**
 * Foundation dashboard. Sprint 1A renders the initial admin layout per the
 * Design System; KPI cards, the live room grid, and device monitoring are added
 * in Sprint 1F (P6).
 */
export function DashboardPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Administration foundation. Rooms, monitoring, and analytics arrive in
          later sprints.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BackendStatusCard />
        <Card>
          <CardHeader>
            <CardTitle>Rooms</CardTitle>
            <CardDescription>Master data management</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Available in Sprint 1C.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>NUC monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Available in Sprint 1F.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
