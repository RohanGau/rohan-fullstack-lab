import { useEffect, useRef, useState } from 'react';

export function useTurnstileResponsive() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<'flexible' | 'compact'>('flexible');

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setSize(w < 320 ? 'compact' : 'flexible');
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return { ref, size } as const;
}
