"use client";

import React, { useEffect, useState } from "react";

type Contract = {
  id: string | number;
  title: string;
  status?: string;
  amount?: number;
  nextDue?: string | null;
};

const API = process.env.NEXT_PUBLIC_API || "http://localhost:3001/v1";

export default function ContractsPage() {
  const [list, setList] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const r = await fetch(`${API}/contracts/list`, { cache: "no-store" });
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        const j = await r.json();

        // Coerce ANY backend shape to a plain array
        const arr: Contract[] = Array.isArray(j)
          ? j
          : Array.isArray(j?.contracts)
          ? j.contracts
          : Array.isArray(j?.items)
          ? j.items
          : [];

        if (alive) setList(arr);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // EXTRA GUARD: never map the raw `list` directly
  const rows: Contract[] = Array.isArray(list) ? list : [];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Contracts</h1>

      {loading ? <p>Loading…</p> : null}
      {err ? (
        <p style={{ color: "#b91c1c" }}>
          Couldn’t load contracts: <code>{err}</code>
        </p>
      ) : null}

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fff",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={{ textAlign: "left", padding: 12 }}>Title</th>
              <th style={{ textAlign: "left", padding: 12 }}>Status</th>
              <th style={{ textAlign: "right", padding: 12 }}>Amount</th>
              <th style={{ textAlign: "left", padding: 12 }}>Next Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 16, color: "#64748b" }}>
                  No contracts to show.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={String(c.id)}>
                  <td style={{ padding: 12, borderTop: "1px solid #eee" }}>
                    {c.title}
                  </td>
                  <td style={{ padding: 12, borderTop: "1px solid #eee" }}>
                    {c.status ?? "—"}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderTop: "1px solid #eee",
                      textAlign: "right",
                      fontFeatureSettings: "'tnum' 1, 'lnum' 1",
                    }}
                  >
                    {typeof c.amount === "number"
                      ? `$${c.amount.toLocaleString()}`
                      : "—"}
                  </td>
                  <td style={{ padding: 12, borderTop: "1px solid #eee" }}>
                    {c.nextDue ? new Date(c.nextDue).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p style={{ color: "#64748b", marginTop: 12 }}>
        Values fall back to safe defaults if the endpoint is empty or shaped
        differently.
      </p>
    </div>
  );
}