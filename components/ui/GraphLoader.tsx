import { GraphLoaderProps } from "@/types/ui";

const GraphLoader: React.FC<GraphLoaderProps> = ({ className }) => {
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className}`}
    >
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-brand-500 border-t-transparent"></div>
    </div>
  );
};

export default GraphLoader;
