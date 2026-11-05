"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "../src/components/header";
import Footer from "../src/components/Footer";
import ScrollToTop from "../src/components/ScrollToTop";
import ScrollProgress from "../src/components/common/ScrollProgress";
import CursorFollower from "../src/components/common/CursorFollower";
import PortfolioBootLoader from "../src/components/common/PortfolioBootLoader";
import { Toaster } from "sonner";
import { useVisitorTracking } from "../src/hooks/useVisitorTracking";

const PortfolioScene = dynamic(() => import("../src/components/common/PortfolioScene"), { ssr: false });

export default function ClientShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isProjectDetails = pathname.startsWith("/project/");
  const showPortfolioBootLoader = !isAdmin && (pathname === "/" || isProjectDetails);
  useVisitorTracking();

  return (
    <>
      <PortfolioBootLoader enabled={showPortfolioBootLoader} projectDetails={isProjectDetails} />
      {!isAdmin && (pathname === "/" || isProjectDetails) && <PortfolioScene showEngine={pathname === "/"} />}
      <ScrollProgress />
      <Header />
      <div className={isAdmin ? "" : "relative z-10 lg:ml-70"}>
        <main>{children}</main>
        {!isAdmin && <Footer />}
      </div>
      <ScrollToTop />
      <CursorFollower />
      <Toaster theme="dark" position="top-center" />
    </>
  );
}
