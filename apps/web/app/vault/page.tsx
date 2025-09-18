"use client";
// @ts-nocheck
import { useEffect, useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function VaultPage() {
  const [docs, setDocs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function load() {
    try {
      const r = await fetch(`${API}/v1/vault/list`, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      setDocs(await r.json());
    } catch (e) {
      setErr("Failed to load");
      setDocs([]);
    }
  }

  useEffect(() => { load(); }, []);

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${API}/v1/vault/upload`, { method: "POST", body: fd });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Upload failed");
      // Let dashboard know the vault changed
      try {
        if ("BroadcastChannel" in window) { const bc = new BroadcastChannel("vault"); bc.postMessage("changed"); bc.close(); }
        localStorage.setItem("vault:changed", String(Date.now()));
      } catch {}
      await load();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
      e.target.value = ""; // reset input
    }
  }

  const fmtSize = (n) => {
    if (n > 1_000_000) return (n/1_000_000).toFixed(1) + " MB";
    if (n > 1_000) return (n/1_000).toFixed(1) + " KB";
    return n + " B";
  };

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:12 }}>Digital Vault</h1>

      <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:16, padding:12, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <input type="file" onChange={onUpload} disabled={busy}/>
          <button onClick={load} disabled={busy}
            style={{ padding:"8px 12px", border:"1px solid #ddd", borderRadius:12 }}>
            Refresh
          </button>
          {busy && <span style={{ fontSize:12, color:"#666" }}>Uploading…</span>}
          {err && <span style={{ fontSize:12, color:"#b91c1c" }}>{err}</span>}
        </div>
        <div style={{ fontSize:12, color:"#666", marginTop:6 }}>Dev-only: files saved locally to API’s <code>.data/vault</code> directory.</div>
      </div>

      <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:16, padding:12 }}>
        <div style={{ fontWeight:600, marginBottom:8 }}>Files</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 160px 140px 140px", gap:8, fontSize:12, color:"#111", fontWeight:600 }}>
          <div>Name</div><div>Tag</div><div>Size</div><div>Added</div>
        </div>
        <div style={{ height:8 }}/>
        {docs.map((d, i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 160px 140px 140px", gap:8, padding:"8px 0", borderTop:"1px dotted #e5e7eb", fontSize:13 }}>
            <div style={{ fontWeight:600 }}>{d.name}</div>
            <div>{d.tag}</div>
            <div>{fmtSize(d.size)}</div>
            <div>{new Date(d.added).toLocaleDateString()}</div>
          </div>
        ))}
        {docs.length === 0 && <div style={{ fontSize:13, color:"#666" }}>No files yet.</div>}
      </div>
    </main>
  );
}