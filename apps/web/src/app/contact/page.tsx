'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useContactSubmit } from '@/hooks/useContactSubmit';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const { submitContact, submitting, success, globalError, fieldErrors } = useContactSubmit();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitContact(formData);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Me</h1>
      <Card>
        <CardContent className="p-6">
          {success ? (
            <p className="text-center text-green-600 font-medium">
              Thanks for reaching out! I&apos;ll get back to you soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {globalError && (
                <Alert variant="destructive">
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
                {fieldErrors.name && (
                  <p className="text-sm text-destructive">{fieldErrors.name}</p>
                )}
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
                {fieldErrors.email && (
                  <p className="text-sm text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <Textarea
                  name="message"
                  placeholder="Your Message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleChange}
                />
                {fieldErrors.message && (
                  <p className="text-sm text-destructive">{fieldErrors.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
