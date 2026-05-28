import { Moon, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("pingme-theme") || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("pingme-theme", theme);
  }, [theme]);

  return (
    <Button
      variant="ghost"
      className="h-11 w-11 rounded-full p-0"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
    >
      {theme === "dark" ? <SunMedium size={18} /> : <Moon size={18} />}
    </Button>
  );
}
