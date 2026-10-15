const Logo: React.FC = () => {
  return (
    <div
      className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300
            bg-slate-100 border border-slate-200 hover:border-slate-300
            dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
    >
      <div
        className="flex items-center justify-center w-9 h-9 rounded-lg font-black text-lg tracking-wider transition-transform duration-300 hover:scale-105
              bg-indigo-600 text-white shadow-md shadow-indigo-200
              dark:bg-sky-400 dark:text-slate-950 dark:shadow-none"
      >
        A
      </div>
      <div className="flex flex-col justify-center leading-none">
        <span
          className="text-xl font-extrabold tracking-tight transition-colors duration-300
                 text-slate-900
                 dark:text-white"
        >
          ANALYTICS
          <span className="text-indigo-600 dark:text-sky-400">.</span>
        </span>
        <span
          className="text-[10px] font-semibold tracking-widest uppercase mt-0.5 transition-colors duration-300
                 text-slate-500
                 dark:text-slate-400"
        >
          DASHBOARD
        </span>
      </div>
    </div>
  );
};

export default Logo;
