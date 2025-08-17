'use client';

import { format, startOfDay, isBefore } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import TimeGrid from './TimeGrid';
import { Check, Loader2 } from 'lucide-react';
import { useSlotBooking } from '@/hooks/useSlotBooking';
import Turnstile from 'react-turnstile';
import { TURNSTILE_SITE_KEY } from '@/lib/constant';
import { useTurnstileResponsive } from '@/hooks/useTurnstileResponsive';

function SlotBookingCard() {
  const {
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
    startDateTime,
    endDateTime,
    submit,
    captchaToken,
    setCaptchaToken,
    submitting,
    success,
    error,
  } = useSlotBooking();

  const { ref: turnstileWrapRef, size: turnstileSize } = useTurnstileResponsive();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a meeting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {success ? (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertTitle>Booked!</AlertTitle>
            <AlertDescription>
              Your slot {startDateTime ? `on ${format(startDateTime, 'PPPp')}` : ''} has been
              reserved. A confirmation email has been sent.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Booking failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="block">Pick a date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={(d) => isBefore(d, startOfDay(new Date()))}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="block">Choose a time</Label>
                  <TimeGrid date={date} value={time} onChange={setTime} />
                  <div className="flex items-center gap-3">
                    <Label htmlFor="duration">Duration</Label>
                    <select
                      id="duration"
                      className="border rounded-md px-3 py-2"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    >
                      {[15, 30, 45, 60, 90].map((m) => (
                        <option key={m} value={m}>
                          {m} minutes
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {date && startDateTime && (
                      <>
                        Selected:{' '}
                        <span className="font-medium">{format(startDateTime, 'PPP p')}</span> –{' '}
                        <span className="font-medium">{format(endDateTime!, 'p')}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@doe.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message (optional)</Label>
                  <Textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What would you like to discuss?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Verification</Label>
                  <div ref={turnstileWrapRef} className="w-full">
                    <Turnstile
                      sitekey={TURNSTILE_SITE_KEY}
                      size={turnstileSize}
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                      onError={() => setCaptchaToken(null)}
                      retry="never"
                    />
                  </div>
                </div>

                <Button
                  onClick={submit}
                  disabled={
                    submitting || !date || !name || !email || !startDateTime || !captchaToken
                  }
                  className="w-full"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Book Slot'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Note: If the selected time is already taken, the server will reject the booking
                  and you’ll see an error here.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default SlotBookingCard;
