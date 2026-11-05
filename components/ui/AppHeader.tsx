"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useState } from "react";
import ThemeToggleButton from "../features/common/ThemeToogleButton";
import { MdClose, MdList } from "react-icons/md";
//import { useTheme } from "next-themes";

const AppHeader: React.FC = () => {
  const [rightOptionsOpen, setRightOptionsOpen] = useState(false);
  //const { theme } = useTheme();

  const toggleRightOptionsOpen = () => {
    setRightOptionsOpen(!rightOptionsOpen);
  };

  return (
    <header className="sticky top-0 z-99999 flex w-full border-gray-200 bg-white xl:border-b dark:border-gray-800 dark:bg-gray-900">
      <div className="flex grow flex-col items-center justify-between xl:flex-row xl:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 sm:gap-4 xl:justify-normal xl:border-b-0 xl:px-0 xl:py-4 dark:border-gray-800">
          <Link href="/dashboard">
            <Logo />
          </Link>

          <button
            onClick={toggleRightOptionsOpen}
            className="z-99999 flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 xl:hidden dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <MdList
              className={`${rightOptionsOpen ? "hidden" : ""}`}
              size={24}
            />
            <MdClose
              className={`${!rightOptionsOpen ? "hidden" : ""}`}
              size={24}
            />
          </button>
        </div>

        <div
          className={`flex w-full items-center justify-between gap-4 px-5 py-4 shadow-theme-md xl:flex xl:justify-end xl:px-0 xl:shadow-none ${rightOptionsOpen ? "flex" : "hidden"}`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
