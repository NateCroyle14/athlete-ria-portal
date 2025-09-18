"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

type Slice = { name: string; value: number };

const API = process.env.NEXT_PUBLIC_API || "http://localhost:3001/v1";

const colors = [
  "#0f172a", // slate-950
  "#1e293b", // slate-800
  "#334155", // slate-700
  "#475569", // slate-600
  "#64748b", // slate-500
  "#94a3b8", // slate-400
  "#cbd5e1", // slate-300
  "#e2e8f0", // slate-200
];

export default function SpendingPage() {
  const [summary, setSummary] = useState<Slice[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const normalize = (input: any): Slice[] => {
      // Accept several shapes and coerce to [{name, value}]
      if (Array.isArray(input)) {
        return input.map((x: any, i: number) => ({
          name: String(x?.name ?? x?.category ?? x?.label ?? `Item ${i + 1}`),
          value: Number(x?.value ?? x?.amount ?? x?.total ?? 0),
        }));
      }
      if (Array.isArray(input?.summary)) return normalize(input.summary);
      if (Array.isArray(input?.categories)) return normalize(input.categories);

      // Object form: { "Groceries": 1234, "Travel": 456 }
      if (input && typeof input === "object") {
        return Object.entries(input).map(([k, v]) => ({
          name: String(k),
          value: Number(v ?? 0),
        }));
      }
      return [];
    };

    (async () => {
      try {
        const r = await fetch(`${API}/spending/summary`, { cache: "no-store" });
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        const j = await r.json();
        const arr = normalize(j);
        if (alive) setSummary(arr);
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

  const data: Slice[] = Array.isArray(summary) ? summary : [];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Spending</h1>

      {loading ? <p>Loading…</p> : null}
      {err ? (
        <p style={{ color: "#b91c1c" }}>
          Couldn’t load spending summary: <code>{err}</code>
        </p>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#fff",
            padding: 16,
            minHeight: 360,
          }}
        >
          <h2 style={{ margin: 0, marginBottom: 12, fontSize: 18 }}>
            Category Breakdown
          </h2>

          {data.length === 0 ? (
            <p style={{ color: "#64748b" }}>No spending data.</p>
          ) : (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    stroke="#fff"
                    strokeWidth={1}
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#fff",
            padding: 16,
          }}
        >
          <h2 style={{ margin: 0, marginBottom: 12, fontSize: 18 }}>
            Categories
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                <th style={{ textAlign: "left", padding: 10 }}>Category</th>
                <th
                  style={{
                    textAlign: "right",
                    padding: 10,
                    fontFeatureSettings: "'tnum' 1, 'lnum' 1",
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ padding: 12, color: "#64748b" }}>
                    No rows to display.
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr key={`${row.name}-${i}`}>
                    <td
                      style={{
                        padding: 10,
                        borderTop: "1px solid #eef2f7",
                        color: "#0f172a",
                      }}
                    >
                      {row.name}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        borderTop: "1px solid #eef2f7",
                        textAlign: "right",
                        fontFeatureSettings: "'tnum' 1, 'lnum' 1",
                        color: "#0f172a",
                      }}
                    >
                      ${row.value.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ color: "#64748b", marginTop: 12 }}>
        Data normalizes to safe defaults if the endpoint is empty or shaped
        differently.
      </p>
    </div>
  );
}