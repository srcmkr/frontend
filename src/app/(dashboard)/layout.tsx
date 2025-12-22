import { FloatingNav } from "@/components/layout/floating-nav";
import { CommandPalette } from "@/components/layout/command-palette";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen">
      <FloatingNav />
      <CommandPalette />
      <main className="px-6 lg:px-8 pb-12 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}
