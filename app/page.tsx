import Logo from "@/components/ui/Logo";
import { mainPageTexts } from "@/lib/constants";

export default function Home() {
  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <div className="mx-auto w-full max-w-68.5 text-center sm:max-w-138.75">
        <div className="mx-auto mb-10 w-full max-w-25 text-center sm:max-w-40">
          <Logo />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-800 xl:text-[48px] dark:text-white/90">
          {mainPageTexts.title}
        </h1>
        <p className="mt-6 mb-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
          {mainPageTexts.description}
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs transition-all hover:bg-gray-50 hover:text-gray-800 focus-visible:ring-3 focus-visible:ring-gray-300/50 active:translate-y-px dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
        >
          {mainPageTexts.callToAction}
        </a>
      </div>
    </div>
  );
}
