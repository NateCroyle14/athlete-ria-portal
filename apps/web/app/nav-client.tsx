// apps/web/app/nav-client.tsx
"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const pill = {
  padding: "6px 12px",
  border: "1px solid #ddd",
  borderRadius: 12,
  background: "#fff",
} as const;

const badgeStyle: React.CSSProperties = {
  marginLeft: 6,
  padding: "2px 8px",
  borderRadius: 999,
  background: "#ef4444",
  color: "#fff",
  fontWeight: 700,
  fontSize: 12,
  lineHeight: "16px",
};

export default function NavClient() {
  const [count, setCount] = useState(0);

  const pull = useCallback(async () => {
    try {
      const r = await fetch(`${API}/v1/alerts/stats?_=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      const next =
        typeof j?.unread === "number" ? j.unread :
        typeof j?.total === "number" ? j.total : 0;
      setCount(next);
      localStorage.setItem("alerts_unread", String(next));
    } catch (e) {
      console.warn("stats pull failed", e);
    }
  }, []);

  useEffect(() => {
    pull();

    // listen to local broadcasts
    const onKick = () => pull();
    window.addEventListener("alerts:refresh", onKick);
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "alerts_unread" && ev.newValue != null) {
        const v = parseInt(ev.newValue, 10);
        if (!Number.isNaN(v)) setCount(v);
      }
    };
    window.addEventListener("storage", onStorage);

    // periodic safety net
    const id = setInterval(pull, 30_000);

    return () => {
      window.removeEventListener("alerts:refresh", onKick);
      window.removeEventListener("storage", onStorage);
      clearInterval(id);
    };
  }, [pull]);

  return (
    <div style={{ padding: 16, display: "flex", gap: 12 }}>
      <Link href="/" style={pill}>Dashboard</Link>
      <Link href="/dutydays" style={pill}>Duty-Day Journal</Link>
      <Link href="/contracts" style={pill}>Contracts</Link>
      <Link href="/vault" style={pill}>Vault</Link>
      <Link href="/spending" style={pill}>Spending</Link>
      <Link href="/taxes" style={pill}>Taxes</Link>
      <Link href="/alerts" style={pill}>
        Alerts {count > 0 ? <span style={badgeStyle}>{count}</span> : null}
      </Link>
    </div>
  );
}