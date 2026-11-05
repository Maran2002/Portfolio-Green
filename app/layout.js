import "../src/App.css";
import ClientShell from "./client-shell";
import { CONTACT_INFO, USER_INFO } from "../src/utils/apiConfig";

export const metadata = {
  metadataBase: new URL("https://elamaran-portfolio.web.app"),
  title: "Elamaran A | Full Stack Developer — MERN",
  description: "Full-stack developer building scalable applications, secure APIs, and polished digital experiences with the MERN stack.",
  keywords: ["Elamaran A", "MERN Stack Developer", "React Developer", "Full Stack Developer", "Node.js", "MongoDB"],
  authors: [{ name: "Elamaran A" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Elamaran A | Full Stack Developer Portfolio",
    description: "Explore projects and services by Elamaran A, a full-stack developer building scalable digital products.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elamaran A | Full Stack Developer",
    description: "Full-stack developer building scalable web applications and APIs.",
  },
};

export default function RootLayout({ children }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: USER_INFO.name,
    url: "https://elamaran-portfolio.web.app/",
    jobTitle: USER_INFO.rolePrimary,
    sameAs: [CONTACT_INFO.linkedin, CONTACT_INFO.github, CONTACT_INFO.leetcode].filter(Boolean),
    knowsAbout: ["MERN Stack", "React", "Next.js", "Node.js", "MongoDB", "Express.js", "React Native", "Docker", "Microservices", "JavaScript"],
  };

  return (
    <html lang="en" className="dark">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
