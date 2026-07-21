/**
 * Display environment loader. Public Vite variables only (never secrets), with
 * local defaults.
 */
interface AppEnv {
  apiBaseUrl: string;
  wsUrl: string;
}

export const env: AppEnv = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1',
  wsUrl: import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000/realtime',
};
