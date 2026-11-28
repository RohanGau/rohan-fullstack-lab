'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Turnstile from 'react-turnstile';
import { useContactSubmit } from '@/hooks/useContactSubmit';
import { TURNSTILE_SITE_KEY } from '@/lib/constant';
import { useTurnstileResponsive } from '@/hooks/useTurnstileResponsive';
import { trackEvent } from '@/components/monitoring/GoogleAnalytics';

function ContactCard() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [captchaKey, setCaptchaKey] = useState(0);
  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaKey((k) => k + 1);
  };

  const { submitContact, submitting, success, globalError, fieldErrors } = useContactSubmit();

  const { ref: turnstileWrapRef, size: turnstileSize } = useTurnstileResponsive();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitContact(formData, captchaToken);
    resetCaptcha();

    // Track successful submission in Google Analytics
    if (result) {
      trackEvent('contact_form_submit', {
        event_category: 'engagement',
        event_label: 'Contact Form',
      });
    }
  };

  // Track form view
  useEffect(() => {
    trackEvent('contact_form_view', {
      event_category: 'engagement',
      event_label: 'Contact Form Loaded',
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact me</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {success ? (
          <p className="text-center text-green-600 font-medium" role="status" aria-live="polite">
            Thanks for reaching out! I&apos;ll get back to you soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {globalError && (
              <Alert variant="destructive" role="alert" aria-live="polite">
                <AlertTitle>Submission failed</AlertTitle>
                <AlertDescription>{globalError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="contact-name">
                Name <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your Name"
                required
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                value={formData.name}
                onChange={handleChange}
              />
              {fieldErrors.name && (
                <p id="contact-name-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">
                Email <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Your Email"
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                value={formData.email}
                onChange={handleChange}
              />
              {fieldErrors.email && (
                <p id="contact-email-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">
                Message <span aria-hidden="true">*</span>
              </Label>
              <Textarea
                id="contact-message"
                name="message"
                placeholder="Your Message"
                rows={6}
                minLength={10}
                required
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                value={formData.message}
                onChange={handleChange}
              />
              {fieldErrors.message && (
                <p id="contact-message-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Verification</Label>
              {!TURNSTILE_SITE_KEY ? (
                <Alert variant="destructive">
                  <AlertTitle>Captcha not configured</AlertTitle>
                  <AlertDescription>
                    Set NEXT_PUBLIC_TURNSTILE_SITE_KEY and restart the dev server.
                  </AlertDescription>
                </Alert>
              ) : (
                <div ref={turnstileWrapRef} className="w-full">
                  <Turnstile
                    key={captchaKey}
                    sitekey={TURNSTILE_SITE_KEY}
                    size={turnstileSize}
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    onError={() => setCaptchaToken(null)}
                  />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting || !captchaToken}>
              {submitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default ContactCard;
