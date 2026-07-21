import { useHealth, useVersion } from '@mrms/hooks';
import { Card, CardContent, CardHeader, CardTitle, Spinner } from '@mrms/ui';

import { api } from '../lib/api';

/**
 * Live backend connectivity card. Demonstrates the full data path
 * (React Query -> api-client -> backend) and the loading/error/success states
 * required by the frontend architecture (Doc 15 §10).
 */
export function BackendStatusCard(): JSX.Element {
  const health = useHealth(api);
  const version = useVersion(api);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backend connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {health.isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Spinner label="Checking backend" />
            <span>Checking backend…</span>
          </div>
        ) : health.isError ? (
          <p role="alert" className="text-sm text-error">
            Backend unreachable. Ensure the API is running, then it will reconnect
            automatically.
          </p>
        ) : (
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true" />
              <span className="font-medium">Healthy</span>
              <span className="text-muted-foreground">
                (database + redis: {health.data?.status})
              </span>
            </p>
            {version.data && (
              <p className="text-muted-foreground">
                {version.data.name} v{version.data.version} · {version.data.environment} ·{' '}
                {version.data.commit}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
