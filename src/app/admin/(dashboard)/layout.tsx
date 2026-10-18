import { Sidebar } from "@/components/admin/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-auto bg-white">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
