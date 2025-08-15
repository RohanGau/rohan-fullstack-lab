"use client";

import { useThemeStore } from "@/lib/store/themeStore";
import { Theme } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const ThemeOption = ({
  value,
  label,
  icon: Icon,
  active,
  onSelect,
}: {
  value: Theme;
  label: string;
  icon: React.ComponentType<any>;
  active: boolean;
  onSelect: (t: Theme) => void;
}) => (
  <DropdownMenuItem
    className={cn(active && "bg-muted")}
    onClick={() => onSelect(value)}
  >
    <Icon className="mr-2 h-4 w-4" />
    {label}
  </DropdownMenuItem>
);

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const icon =
    theme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : theme === "light" ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Laptop className="h-4 w-4" />
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="mx-3" variant="ghost" size="icon" aria-label="Toggle theme">
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ThemeOption
          value="light"
          label="Light"
          icon={Sun}
          active={theme === "light"}
          onSelect={setTheme}
        />
        <ThemeOption
          value="dark"
          label="Dark"
          icon={Moon}
          active={theme === "dark"}
          onSelect={setTheme}
        />
        <ThemeOption
          value="system"
          label="System"
          icon={Laptop}
          active={theme === "system"}
          onSelect={setTheme}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
