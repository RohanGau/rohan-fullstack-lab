'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Turnstile from 'react-turnstile';
import { useContactSubmit } from '@/hooks/useContactSubmit';
import { TURNSTILE_SITE_KEY } from '@/lib/constant';

function ContactCard() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [captchaKey, setCaptchaKey] = useState(0);
  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaKey((k) => k + 1);
  };

  const { submitContact, submitting, success, globalError, fieldErrors } = useContactSubmit();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitContact(formData, captchaToken);
    resetCaptcha();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact me</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {success ? (
          <p className="text-center text-green-600 font-medium">
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

            <div className="space-y-1">
              <Input
                name="name"
                type="text"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={handleChange}
              />
              {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
            </div>

            <div className="space-y-1">
              <Input
                name="email"
                type="email"
                placeholder="Your Email"
                required
                value={formData.email}
                onChange={handleChange}
              />
              {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-1">
              <Textarea
                name="message"
                placeholder="Your Message"
                rows={6}
                minLength={10}
                required
                value={formData.message}
                onChange={handleChange}
              />
              {fieldErrors.message && (
                <p className="text-sm text-destructive">{fieldErrors.message}</p>
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
                <Turnstile
                  key={captchaKey} // ← this resets the widget on each submit/error
                  sitekey={TURNSTILE_SITE_KEY}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                />
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
