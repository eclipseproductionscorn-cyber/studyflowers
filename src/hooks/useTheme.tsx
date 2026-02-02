import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getThemeById, AppTheme } from "@/lib/themes";

interface ThemeContextType {
  currentTheme: AppTheme;
  setTheme: (themeId: string) => void;
  ownedThemes: string[];
  purchaseTheme: (themeId: string) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    return localStorage.getItem("studyflow-theme") || "default";
  });

  const [ownedThemes, setOwnedThemes] = useState<string[]>(() => {
    const saved = localStorage.getItem("studyflow-owned-themes");
    return saved ? JSON.parse(saved) : ["default"];
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("studyflow-dark-mode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const currentTheme = getThemeById(currentThemeId);

  const applyTheme = (theme: AppTheme, dark: boolean) => {
    const colors = dark ? theme.colors.dark : theme.colors.light;
    const root = document.documentElement;

    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-soft", colors.primarySoft);
    root.style.setProperty("--primary-glow", colors.primaryGlow);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-soft", colors.accentSoft);
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--card", colors.card);
    root.style.setProperty("--border", colors.border);

    // Update dark class
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  useEffect(() => {
    applyTheme(currentTheme, isDark);
    localStorage.setItem("studyflow-theme", currentThemeId);
    localStorage.setItem("studyflow-dark-mode", String(isDark));
  }, [currentTheme, isDark]);

  useEffect(() => {
    localStorage.setItem("studyflow-owned-themes", JSON.stringify(ownedThemes));
  }, [ownedThemes]);

  const setTheme = (themeId: string) => {
    if (ownedThemes.includes(themeId)) {
      setCurrentThemeId(themeId);
    }
  };

  const purchaseTheme = (themeId: string) => {
    if (!ownedThemes.includes(themeId)) {
      setOwnedThemes((prev) => [...prev, themeId]);
    }
  };

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        ownedThemes,
        purchaseTheme,
        isDark,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
