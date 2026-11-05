"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../src/store/useAuthStore";
import VisitorAnalytics from "../../../src/components/admin/VisitorAnalytics";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (hydrated && !token) router.replace("/admin");
  }, [hydrated, token, router]);

  if (!hydrated || !token) return null;
  return <VisitorAnalytics />;
}
