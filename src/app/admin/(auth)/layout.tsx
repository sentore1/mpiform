// Auth pages (login) get no sidebar — just a bare full-page layout
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
