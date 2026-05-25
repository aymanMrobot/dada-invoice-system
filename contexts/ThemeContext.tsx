import * as React from "react";

type Theme = "light" | "dark";

const ThemeContext = React.createContext({
  theme: "light" as Theme,
  setTheme: (_theme: Theme) => {},
});

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    return (localStorage.getItem("dada_theme") as Theme | null) || defaultTheme;
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("dada_theme", theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => React.useContext(ThemeContext);
