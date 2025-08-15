export type Theme = "light" | "dark" | "system";

export type themeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};