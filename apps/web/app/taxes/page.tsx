"use client";

import React, { useEffect, useState } from "react";

type Breakdown = { state: string; amount: number };

type Estimate = {
  ytdState: number;
  stateBreakdown: Breakdown[];
  lastUpdated?: string | null;
};

const API = process.env.NEXT_PUBLIC_API || "http://localhost:3001/v1";

export default function TaxesPage() {
  const [est, setEst] = useState<Estimate>({
    ytdState: 0,
    stateBreakdown: [],
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const r = await fetch(`${API}/taxes/estimate`, { cache: "no-store" });
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        const j = await r.json();

        // HARDEN: always coerce to a safe shape
        const safe: Estimate = {
          ytdState: Number(j?.ytdState ?? 0),
          stateBreakdown: Array.isArray(j?.stateBreakdown) ? j.stateBreakdown : [],
          lastUpdated: j?.lastUpdated ?? null,
        };

        if (alive) setEst(safe);
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

  const breakdown = est.stateBreakdown ?? []; // extra guard

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Taxes</h1>

      {loading ? <p>Loading…</p> : null}
      {err ? (
        <p style={{ color: "#b91c1c" }}>
          Couldn’t load taxes: <code>{err}</code>
        </p>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginTop: 8,
        }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 20,
            background: "#fff",
          }}
        >
          <div style={{ color: "#334155", fontWeight: 700, marginBottom: 8 }}>
            Est. State Tax (YTD)
          </div>
          <div style={{ fontSize: 42, fontWeight: 800 }}>
            ${Number(est.ytdState || 0).toLocaleString()}
          </div>
          {est.lastUpdated ? (
            <div style={{ color: "#64748b", marginTop: 8 }}>
              Updated: {new Date(est.lastUpdated).toLocaleString()}
            </div>
          ) : null}
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 20,
            background: "#fff",
          }}
        >
          <div style={{ color: "#334155", fontWeight: 700, marginBottom: 8 }}>
            Breakdown by State
          </div>

          {breakdown.length === 0 ? (
            <div style={{ color: "#64748b" }}>No state entries yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 0" }}>State</th>
                  <th style={{ textAlign: "right", padding: "8px 0" }}>YTD</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row, i) => (
                  <tr key={`${row.state}-${i}`}>
                    <td style={{ padding: "6px 0", borderTop: "1px solid #eee" }}>
                      {row.state}
                    </td>
                    <td
                      style={{
                        padding: "6px 0",
                        borderTop: "1px solid #eee",
                        textAlign: "right",
                        fontFeatureSettings: "'tnum' 1, 'lnum' 1",
                      }}
                    >
                      ${Number(row.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p style={{ color: "#64748b", marginTop: 16 }}>
        Values fall back to safe defaults if the endpoint is missing or empty.
      </p>
    </div>
  );
}