'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/lib/store/themeStore';
import { EffectiveTheme } from '@/types/store';

export function useEffectiveTheme(): EffectiveTheme {
  const pref = useThemeStore((s) => s.theme);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return pref === 'system' ? (systemDark ? 'dark' : 'light') : (pref as EffectiveTheme);
}
