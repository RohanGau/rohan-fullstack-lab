'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { extractApiErrors } from '@/lib/utils';

export function useContactSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const submitContact = async (
    data: { name: string; email: string; message: string },
    captchaToken: string | null
  ): Promise<boolean> => {
    setSubmitting(true);
    setSuccess(false);
    setFieldErrors({});
    setGlobalError(null);
    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ ...data, captchaToken }),
        headers: { 'Content-Type': 'application/json' },
      });
      setSuccess(true);
      return true;
    } catch (err: any) {
      const { fieldErrors: fe, global } = extractApiErrors(err);
      if (Object.keys(fe).length) setFieldErrors(fe);
      setGlobalError(global);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitContact, submitting, success, fieldErrors, globalError };
}
