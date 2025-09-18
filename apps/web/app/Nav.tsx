// apps/web/app/Nav.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const badgeStyle: React.CSSProperties = {
  marginLeft: 6,
  fontSize: 12,
  fontWeight: 700,
  background: "#ef4444",
  color: "#fff",
  borderRadius: 999,
  padding: "1px 6px",
  border: "1px solid #dc2626",
};

export default function Nav() {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    let alive = true;

    const tick = async () => {
      try {
        const r = await fetch(`${API}/v1/alerts/stats`, { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          if (alive) setAlertCount(j?.total || 0);
        }
      } catch {
        // ignore network errors in nav
      }
    };

    tick();
    const id = setInterval(tick, 30_000); // refresh every 30s
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <nav style={{ padding: 16, display: "flex", gap: 12 }}>
      <Link href="/" style={btnStyle}>Dashboard</Link>
      <Link href="/dutydays" style={btnStyle}>Duty-Day Journal</Link>
      <Link href="/contracts" style={btnStyle}>Contracts</Link>
      <Link href="/vault" style={btnStyle}>Vault</Link>
      <Link href="/spending" style={btnStyle}>Spending</Link>
      <Link href="/taxes" style={btnStyle}>Taxes</Link>
      <Link href="/alerts" style={btnStyle}>
        Alerts {alertCount ? <span style={badgeStyle}>{alertCount}</span> : null}
      </Link>
    </nav>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 12px",
  border: "1px solid #ddd",
  borderRadius: 12,
  background: "#fff",
};