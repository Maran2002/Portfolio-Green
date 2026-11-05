"use client";

import { usePathname } from "next/navigation";
import Header from "../src/components/header";
import Footer from "../src/components/Footer";
import ScrollToTop from "../src/components/ScrollToTop";
import ScrollProgress from "../src/components/common/ScrollProgress";
import CursorFollower from "../src/components/common/CursorFollower";
import { Toaster } from "sonner";
import { useVisitorTracking } from "../src/hooks/useVisitorTracking";

export default function ClientShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  useVisitorTracking();

  return (
    <>
      <ScrollProgress />
      <Header />
      <div className={isAdmin ? "" : "lg:ml-70"}>
        <main>{children}</main>
        {!isAdmin && <Footer />}
      </div>
      <ScrollToTop />
      <CursorFollower />
      <Toaster theme="dark" position="top-center" />
    </>
  );
}
