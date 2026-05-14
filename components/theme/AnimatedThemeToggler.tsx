"use client";

import { Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
  };
};

const STORAGE_KEY = "theme";

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

function shouldSkipViewTransition() {
  return (
    !("startViewTransition" in document) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function AnimatedThemeToggler() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const initialTheme = readStoredTheme();
    applyTheme(initialTheme);
    setTheme(initialTheme);
  }, []);

  const toggleTheme = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
      const updateTheme = () => {
        applyTheme(nextTheme);
        setTheme(nextTheme);
      };

      if (shouldSkipViewTransition()) {
        updateTheme();
        return;
      }

      const { clientX, clientY } = event;
      const endRadius = Math.hypot(
        Math.max(clientX, window.innerWidth - clientX),
        Math.max(clientY, window.innerHeight - clientY),
      );
      const transition = (document as ViewTransitionDocument).startViewTransition?.(
        updateTheme,
      );

      transition?.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${clientX}px ${clientY}px)`,
              `circle(${endRadius}px at ${clientX}px ${clientY}px)`,
            ],
          },
          {
            duration: 560,
            easing: "cubic-bezier(0.22, 0.68, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });
    },
    [theme],
  );

  const nextLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      aria-label={nextLabel}
      title={nextLabel}
      onClick={toggleTheme}
      className="theme-toggle focus-ring"
    >
      <Sun className="theme-toggle__icon theme-toggle__icon--sun" size={16} aria-hidden />
      <Moon className="theme-toggle__icon theme-toggle__icon--moon" size={16} aria-hidden />
    </button>
  );
}
