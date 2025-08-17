"use client";

import { useMemo } from "react";
import { format, addMinutes, setHours, setMinutes, isAfter } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function TimeGrid({
  date,
  value,
  onChange,
  startHour = 10,
  endHour = 18,
  stepMinutes = 30,
}: {
  date?: Date;
  value: string; // HH:mm
  onChange: (t: string) => void;
  startHour?: number;
  endHour?: number;
  stepMinutes?: number;
}) {
  const items = useMemo(() => {
    if (!date) return [] as Array<{ label: string; hh: number; mm: number }>;
    const start = setMinutes(setHours(date, startHour), 0);
    const end = setMinutes(setHours(date, endHour), 0);
    const arr: Array<{ label: string; hh: number; mm: number }> = [];
    let cur = start;
    while (!isAfter(cur, end)) {
      const hh = cur.getHours();
      const mm = cur.getMinutes();
      const label = format(cur, "hh:mm a");
      arr.push({ label, hh, mm });
      cur = addMinutes(cur, stepMinutes);
    }
    return arr;
  }, [date, startHour, endHour, stepMinutes]);

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it) => {
        const t = `${String(it.hh).padStart(2, "0")}:${String(it.mm).padStart(2, "0")}`;
        const active = value === t;
        return (
          <Button
            key={t}
            type="button"
            variant={active ? "default" : "outline"}
            onClick={() => onChange(t)}
            className={cn("w-full", active && "ring-2 ring-offset-1")}
          >
            {it.label}
          </Button>
        );
      })}
    </div>
  );
}


export default TimeGrid;
