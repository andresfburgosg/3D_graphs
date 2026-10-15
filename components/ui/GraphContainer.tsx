import { GraphContainerProps } from "@/types/ui";

const GraphContainer: React.FC<GraphContainerProps> = ({
  title,
  description,
  graphKey,
  children,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="w-full">
          {title !== undefined ? (
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h3>
          ) : (
            <></>
          )}
          {description !== undefined ? (
            <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          ) : (
            <></>
          )}
        </div>
        <div
          className="flex items-center gap-3 sm:justify-end"
          id={`${graphKey}-controls`}
        ></div>
      </div>
      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="min-w-250 xl:min-w-full">{children}</div>
      </div>
    </div>
  );
};

export default GraphContainer;
