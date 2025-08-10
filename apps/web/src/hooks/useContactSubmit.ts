import { useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { IContactBase } from '@fullstack-lab/types';

export function useContactSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const submitContact = async (data: IContactBase) => {
    setSubmitting(true);
    setSuccess(false);
    setFieldErrors({});
    setGlobalError(null);

    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });

      setSuccess(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.error && Array.isArray(err.error)) {
        const mappedErrors: Record<string, string> = {};
        err.error.forEach((e: { field: string; message: string }) => {
          mappedErrors[e.field] = e.message;
        });
        setFieldErrors(mappedErrors);
      }

      setGlobalError(err?.msg || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitContact,
    submitting,
    success,
    fieldErrors,
    globalError,
  };
}
