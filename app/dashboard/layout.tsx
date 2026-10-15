import AppHeader from "@/components/ui/AppHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen xl:flex">
      <div className="flex-1">
        <AppHeader />
        <main className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
          <div className="grid grid-cols-12 gap-4 md:gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
