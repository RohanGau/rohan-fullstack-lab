"use client";

import * as React from "react";
import { useThemeStore } from "@/lib/store/themeStore";

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;
  const systemDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const effective = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  root.classList.remove("light", "dark");
  root.classList.add(effective);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  
  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [theme]);

  return <>{children}</>;
}
