"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../src/store/useAuthStore";
import AdminDashboard from "../../../src/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (hydrated && !token) router.replace("/admin");
  }, [hydrated, token, router]);

  if (!hydrated || !token) return null;
  return <AdminDashboard />;
}
