import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactCard from '@/components/contact/ContactCard';

const mockSubmitContact = vi.fn();
let mockHookState = {
  submitting: false,
  success: false,
  globalError: null as string | null,
  fieldErrors: {} as Record<string, string>,
};

vi.mock('@/hooks/useContactSubmit', () => ({
  useContactSubmit: () => ({
    submitContact: mockSubmitContact,
    ...mockHookState,
  }),
}));

vi.mock('@/hooks/useTurnstileResponsive', () => ({
  useTurnstileResponsive: () => ({ ref: { current: null }, size: 'normal' }),
}));

vi.mock('react-turnstile', () => ({
  default: ({ onVerify }: { onVerify: (token: string) => void }) => (
    <button type="button" onClick={() => onVerify('test-turnstile-token')}>
      Verify Captcha
    </button>
  ),
}));

vi.mock('@/components/monitoring/GoogleAnalytics', () => ({
  trackEvent: vi.fn(),
}));

describe('ContactCard accessibility and submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHookState = {
      submitting: false,
      success: false,
      globalError: null,
      fieldErrors: {},
    };
  });

  it('associates explicit labels with name, email, and message inputs', () => {
    render(<ContactCard />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    expect(nameInput).toHaveAttribute('id', 'contact-name');
    expect(emailInput).toHaveAttribute('id', 'contact-email');
    expect(messageInput).toHaveAttribute('id', 'contact-message');
    expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    expect(messageInput).toHaveAttribute('aria-invalid', 'false');
  });

  it('links field errors via aria-invalid and aria-describedby', () => {
    mockHookState.fieldErrors = {
      email: 'Please enter a valid email',
      message: 'Message is too short',
    };

    render(<ContactCard />);

    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby', 'contact-email-error');
    expect(screen.getByText('Please enter a valid email')).toHaveAttribute(
      'id',
      'contact-email-error'
    );

    expect(messageInput).toHaveAttribute('aria-invalid', 'true');
    expect(messageInput).toHaveAttribute('aria-describedby', 'contact-message-error');
  });

  it('submits form after Turnstile verification', async () => {
    const user = userEvent.setup();
    mockSubmitContact.mockResolvedValue(true);

    render(<ContactCard />);

    await user.type(screen.getByLabelText(/name/i), 'Rohan Kumar');
    await user.type(screen.getByLabelText(/email/i), 'rohan@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello, this is a test message.');
    await user.click(screen.getByRole('button', { name: /verify captcha/i }));

    const submitBtn = screen.getByRole('button', { name: /send message/i });
    expect(submitBtn).toBeEnabled();
    await user.click(submitBtn);

    expect(mockSubmitContact).toHaveBeenCalledWith(
      {
        name: 'Rohan Kumar',
        email: 'rohan@example.com',
        message: 'Hello, this is a test message.',
      },
      'test-turnstile-token'
    );
  });

  it('renders polite live region on success', () => {
    mockHookState.success = true;
    render(<ContactCard />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(/thanks for reaching out/i);
  });
});
