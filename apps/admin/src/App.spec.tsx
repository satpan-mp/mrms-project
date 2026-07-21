import { ThemeProvider } from '@mrms/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { App } from './App';

// Isolate the smoke test from the network: the system API resolves instantly.
vi.mock('./lib/api', () => ({
  api: {
    system: {
      health: vi.fn().mockResolvedValue({ status: 'ok', info: {}, error: {}, details: {} }),
      version: vi
        .fn()
        .mockResolvedValue({ name: 'mrms-backend', version: '0.1.0', environment: 'test', commit: 'test', timestamp: '' }),
      ping: vi.fn().mockResolvedValue({ message: 'pong', timestamp: '' }),
    },
  },
}));

function renderApp(): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe('Admin App', () => {
  it('renders the shell title and dashboard heading', () => {
    renderApp();
    expect(screen.getByText('MRMS')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('exposes a skip-to-content link for accessibility', () => {
    renderApp();
    expect(screen.getByRole('link', { name: /skip to content/i })).toBeInTheDocument();
  });
});
