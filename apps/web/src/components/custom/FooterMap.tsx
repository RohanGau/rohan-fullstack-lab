'use client';

import * as React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FooterMap({ location, zoom = 13 }: { location?: string; zoom?: number }) {
  const [loaded, setLoaded] = React.useState(false);

  if (!location) return null;

  const embedSrc = `https://www.google.com/maps?&q=${encodeURIComponent(
    location
  )}&z=${zoom}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location
  )}`;

  return (
    <section aria-label="Location map" className="mt-8">
      <div className="overflow-hidden rounded-xl border bg-muted/10">
        <div className="aspect-[16/9] bg-muted/20 flex items-center justify-center">
          {loaded ? (
            <iframe
              title={`Map of ${location}`}
              src={embedSrc}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 px-4 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Interactive map for <span className="font-medium text-foreground">{location}</span>
              </p>
              <Button type="button" size="sm" variant="secondary" onClick={() => setLoaded(true)}>
                Load Interactive Map
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="truncate text-sm text-muted-foreground">{location}</span>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <a href={mapsLink} target="_blank" rel="noopener noreferrer">
                Open in Maps
              </a>
            </Button>
            <Button asChild size="sm">
              <a href={`${mapsLink}&travelmode=driving`} target="_blank" rel="noopener noreferrer">
                Directions
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
