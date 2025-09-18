// apps/web/app/layout.tsx
import type { Metadata } from "next";
import NavClient from "./nav-client";

export const metadata: Metadata = {
  title: "Athlete Client Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#fafafa" }}>
        {/* Mount client nav so it can react to alerts changes */}
        <NavClient />
        <main>{children}</main>
      </body>
    </html>
  );
}