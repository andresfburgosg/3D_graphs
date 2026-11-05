import React, { useState } from "react";
import { GraphTabButtonsProps } from "@/types/ui";

const GraphTabButtons: React.FC<GraphTabButtonsProps> = ({
  buttons,
  activeTabValue,
  onTabChange,
}) => {
  const [selectedTab, setSelectedTab] = useState(activeTabValue);

  const getButtonClass = (value: string) =>
    selectedTab === value
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    onTabChange(value);
  };

  return (
    <div className="flex max-h-10 items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      {buttons.map((button) => (
        <button
          key={button.value}
          className={`w-max rounded-md px-3 py-2 text-theme-sm font-medium hover:text-gray-900 dark:hover:text-white ${getButtonClass(
            button.value,
          )}`}
          onClick={() => handleTabChange(button.value)}
        >
          {button.title}
        </button>
      ))}
    </div>
  );
};

export default GraphTabButtons;
