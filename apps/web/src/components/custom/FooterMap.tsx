import * as React from "react";
import { Button } from "@/components/ui/button";

export function FooterMap({
  location,
  zoom = 13,
}: {
  location?: string;
  zoom?: number;
}) {
  if (!location) return null;

  const embedSrc = `https://www.google.com/maps?&q=${encodeURIComponent(
    location
  )}&z=${zoom}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location
  )}`;

  return (
    <div className="mx-auto mt-4 max-w-5xl px-4">
      <div className="overflow-hidden rounded-xl border bg-muted/10">
        <div className="aspect-[16/9]">
          <iframe
            title={`Map of ${location}`}
            src={embedSrc}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
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
              <a
                href={`${mapsLink}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Directions
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
