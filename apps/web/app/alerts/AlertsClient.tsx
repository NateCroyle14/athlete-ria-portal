// apps/web/app/alerts/AlertsClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Alert = {
  id: string;
  type: string;
  title: string;
  detail: string;
  when: string;
  severity: "info" | "warn";
  read?: boolean;
};

const pillBtn: React.CSSProperties = {
  padding: "6px 12px",
  border: "1px solid #ddd",
  borderRadius: 12,
  background: "#fff",
  cursor: "pointer",
};

const th: React.CSSProperties = {
  padding: "12px 14px",
  textAlign: "left",
  fontWeight: 700,
  borderBottom: "1px solid #e5e7eb",
};
const td: React.CSSProperties = { padding: "12px 14px", verticalAlign: "top" };

export default function AlertsClient() {
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (onlyUnread) p.set("unread", "1");
    p.set("_", String(Date.now()));
    return p.toString();
  }, [onlyUnread]);

  const unreadCount = (arr: Alert[]) => arr.filter(a => !a.read).length;

  const broadcast = (n?: number) => {
    // double broadcast so the nav always hears it
    window.dispatchEvent(new CustomEvent("alerts:refresh"));
    if (typeof n === "number") localStorage.setItem("alerts_unread", String(n));
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/v1/alerts?${qs}`, { cache: "no-store" });
      if (!r.ok) {
        console.warn("GET /v1/alerts ->", r.status);
        setItems([]);
        broadcast(0);
        return;
      }
      const list = (await r.json()) as Alert[];
      setItems(Array.isArray(list) ? list : []);
      broadcast(unreadCount(Array.isArray(list) ? list : []));
    } catch (e) {
      console.error("load alerts failed:", e);
      setItems([]);
      broadcast(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [qs]);

  const refreshDemo = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/v1/alerts/refresh?_=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!r.ok) console.warn("POST /v1/alerts/refresh ->", r.status);
      await load();               // pull new list
    } catch (e) {
      console.error("refreshDemo failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const markVisibleAsRead = async () => {
    const ids = items.filter(a => !a.read).map(a => a.id);
    if (ids.length === 0) return;
    try {
      const r = await fetch(`${API}/v1/alerts/read?_=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
        cache: "no-store",
      });
      if (!r.ok) console.warn("POST /v1/alerts/read ->", r.status);
      await load();               // pull updated list
    } catch (e) {
      console.error("markVisibleAsRead failed:", e);
    }
  };

  const markRowRead = async (id: string) => {
    try {
      const r = await fetch(`${API}/v1/alerts/read?_=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        cache: "no-store",
      });
      if (!r.ok) console.warn("POST /v1/alerts/read (row) ->", r.status);
      await load();
    } catch (e) {
      console.error("markRowRead failed:", e);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>Alerts</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={onlyUnread}
            onChange={(e) => setOnlyUnread(e.target.checked)}
          />
          <span>Show only unread</span>
        </label>

        <button type="button" onClick={refreshDemo} style={pillBtn} aria-busy={loading}>
          {loading ? "Refreshing…" : "Refresh demo alerts"}
        </button>

        <button type="button" onClick={markVisibleAsRead} style={pillBtn} disabled={loading}>
          Mark visible as read
        </button>
      </div>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <th style={th}>Type</th>
              <th style={th}>Title</th>
              <th style={th}>Detail</th>
              <th style={th}>When</th>
              <th style={th}>Severity</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 16, color: "#6b7280" }}>
                  {loading ? "Loading…" : "No alerts."}
                </td>
              </tr>
            ) : (
              items.map(a => (
                <tr key={a.id} style={{ background: a.read ? "#fff" : "#fff7ed", borderTop: "1px solid #f3f4f6" }}>
                  <td style={td}>{a.type}</td>
                  <td style={td}><strong>{a.title}</strong></td>
                  <td style={td}>{a.detail}</td>
                  <td style={td}>{a.when}</td>
                  <td style={td}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 999,
                        border: `1px solid ${a.severity === "info" ? "#bfdbfe" : "#fcd34d"}`,
                        background: a.severity === "info" ? "#eff6ff" : "#fffbeb",
                        color: a.severity === "info" ? "#1d4ed8" : "#92400e",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {a.severity}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    {!a.read && (
                      <button type="button" style={pillBtn} onClick={() => markRowRead(a.id)}>
                        Mark read
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}