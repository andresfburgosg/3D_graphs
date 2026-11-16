import { GraphPopupProps } from "@/types/ui";

const GraphPopup: React.FC<GraphPopupProps> = ({ message }) => {
  return (
    <div className="absolute w-full h-full left-0 top-0 bg-transparent z-50 grid place-items-center p-4 overflow-y-auto">
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 py-6 px-12">
        {message}
      </div>
    </div>
  );
};

export default GraphPopup;
