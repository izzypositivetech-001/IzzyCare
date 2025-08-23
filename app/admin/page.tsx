import AdminGuard from "@/components/AdminGuard";
import AdminDashboard from "@/components/AdminDashboard"; // your actual dashboard component

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
