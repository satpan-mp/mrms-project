import { ThemeProvider } from '@mrms/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { App } from './App';

vi.mock('./lib/api', () => ({
  api: {
    system: {
      health: vi.fn().mockResolvedValue({ status: 'ok', info: {}, error: {}, details: {} }),
      version: vi.fn().mockResolvedValue({
        name: 'mrms-backend',
        version: '0.1.0',
        environment: 'test',
        commit: 'test',
        timestamp: '',
      }),
      ping: vi.fn().mockResolvedValue({ message: 'pong', timestamp: '' }),
    },
  },
}));

describe('Display App', () => {
  it('renders the kiosk brand header and awaiting-config prompt', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <ThemeProvider defaultTheme="dark">
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>,
    );
    expect(screen.getByText(/PT Mitra Prodin/i)).toBeInTheDocument();
    // With no ?room= param in the test URL, the display prompts for kiosk config.
    expect(screen.getByRole('heading', { name: /meeting room display/i })).toBeInTheDocument();
  });
});
