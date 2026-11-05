"use client";

import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useTheme } from "next-themes";
import { useCallback } from "react";

const ThemeToggleButton: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(() => (theme === "light" ? "dark" : "light"));
  }, [setTheme, theme]);

  return (
    <button
      onClick={toggleTheme}
      className="hover:text-dark-900 relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      <MdLightMode className="hidden dark:block" size={20} />
      <MdDarkMode className="dark:hidden" size={20} />
    </button>
  );
};

export default ThemeToggleButton;
