// 'use client'; // This directive is no longer necessary as we removed client-side hooks

// The authentication logic has been removed to allow direct access to the admin panel.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Simply render the children, which will be the admin page content.
  return <>{children}</>;
}
