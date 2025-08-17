import { useMemo, useState } from 'react';
import { addMinutes, setHours, setMinutes } from 'date-fns';
import { apiFetch } from '@/lib/apiClient';

export function useSlotBooking() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('10:00'); // HH:mm
  const [duration, setDuration] = useState<number>(30);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDateTime = useMemo(() => {
    if (!date) return undefined;
    const [hh, mm] = time.split(':').map(Number);
    let d = setHours(date, hh);
    d = setMinutes(d, mm);
    return d;
  }, [date, time]);

  const endDateTime = useMemo(
    () => (startDateTime ? addMinutes(startDateTime, duration) : undefined),
    [startDateTime, duration]
  );

  const submit = async () => {
    setSubmitting(true);
    setSuccess(false);
    setError(null);
    try {
      if (!startDateTime) throw new Error('Pick a date & time');
      if (!captchaToken) throw new Error('Please complete the CAPTCHA');
      const payload = {
        name,
        email,
        message,
        date: startDateTime.toISOString(),
        duration,
        status: 'booked',
        captchaToken,
      };
      await apiFetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSuccess(true);
    } catch (e: any) {
      // Expecting server to send 409 with { msg: "Slot overlaps..." } for conflicts
      setError(e?.msg || e?.message || 'Could not book the slot');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    date,
    setDate,
    time,
    setTime,
    duration,
    setDuration,
    name,
    setName,
    email,
    setEmail,
    message,
    setMessage,
    captchaToken,
    setCaptchaToken,
    startDateTime,
    endDateTime,
    submit,
    submitting,
    success,
    error,
  } as const;
}
