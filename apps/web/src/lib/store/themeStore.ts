import { create } from "zustand";
import { persist } from "zustand/middleware";
import { themeState } from "@/types/store";

export const useThemeStore = create<themeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "rk-theme" }
  )
);
