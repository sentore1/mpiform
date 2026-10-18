// Top-level admin layout is a bare pass-through.
// Child route groups ((auth) and (dashboard)) each provide their own layouts.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
