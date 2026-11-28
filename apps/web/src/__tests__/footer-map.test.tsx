import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FooterMap } from '@/components/custom/FooterMap';

describe('FooterMap click-to-load facade', () => {
  it('renders nothing when location is missing', () => {
    const { container } = render(<FooterMap />);
    expect(container.firstChild).toBeNull();
  });

  it('defers iframe mounting until user clicks Load Interactive Map', async () => {
    const user = userEvent.setup();
    render(<FooterMap location="Bengaluru, India" />);

    expect(screen.queryByTitle(/map of bengaluru/i)).not.toBeInTheDocument();
    const loadBtn = screen.getByRole('button', { name: /load interactive map/i });
    await user.click(loadBtn);

    const iframe = screen.getByTitle('Map of Bengaluru, India');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', expect.stringContaining('https://www.google.com/maps'));
  });
});
