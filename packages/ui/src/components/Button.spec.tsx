import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Book room</Button>);
    expect(screen.getByRole('button', { name: 'Book room' })).toBeInTheDocument();
  });

  it('is disabled and marked busy while loading', () => {
    render(<Button loading>Saving</Button>);
    const btn = screen.getByRole('button', { name: 'Saving' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });
});
