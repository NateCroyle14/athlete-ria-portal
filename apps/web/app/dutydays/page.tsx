"use client";
// @ts-nocheck
import { useEffect, useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const fmtYMD = (ymd) => { if (!ymd) return ""; const [y,m,d]=ymd.split("-").map(Number); return `${m}/${d}/${y}`; };

export default function DutyDaysPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), state:"FL", location:"", type:"game", notes:"" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  async function load() {
    setLoadError(null);
    try {
      const r = await fetch(`${API}/v1/dutydays/list`, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      setList(await r.json());
    } catch {
      setLoadError("Load failed"); setList([]);
    }
  }
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      const r = await fetch(`${API}/v1/dutydays/add`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Failed");
      try {
        if ("BroadcastChannel" in window) { const bc=new BroadcastChannel("dutydays"); bc.postMessage("changed"); bc.close(); }
        localStorage.setItem("dutydays:changed", String(Date.now()));
      } catch {}
      await load(); setForm(f => ({ ...f, notes: "" }));
    } catch (err) { setError(String(err?.message || err)); }
    finally { setSaving(false); }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:12 }}>Duty-Day Journal</h1>
      <form onSubmit={add} style={{ background:"#fff", border:"1px solid #eee", borderRadius:16, padding:12, marginBottom:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5, minmax(0, 1fr))", gap:8 }}>
          <label style={{ display:"flex", flexDirection:"column", fontSize:12 }}>Date
            <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}
              style={{ padding:8, border:"1px solid #ddd", borderRadius:8 }}/>
          </label>
          <label style={{ display:"flex", flexDirection:"column", fontSize:12 }}>State
            <input value={form.state} onChange={e=>setForm({...form, state:e.target.value})} placeholder="NY"
              style={{ padding:8, border:"1px solid #ddd", borderRadius:8 }}/>
          </label>
          <label style={{ display:"flex", flexDirection:"column", fontSize:12 }}>Type
            <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})}
              style={{ padding:8, border:"1px solid #ddd", borderRadius:8 }}>
              <option value="game">game</option><option value="travel">travel</option>
              <option value="practice">practice</option><option value="other">other</option>
            </select>
          </label>
          <label style={{ display:"flex", flexDirection:"column", fontSize:12 }}>Location
            <input value={form.location} onChange={e=>setForm({...form, location:e.target.value})} placeholder="Tampa"
              style={{ padding:8, border:"1px solid #ddd", borderRadius:8 }}/>
          </label>
          <label style={{ display:"flex", flexDirection:"column", fontSize:12 }}>Notes
            <input value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Game 1"
              style={{ padding:8, border:"1px solid #ddd", borderRadius:8 }}/>
          </label>
        </div>
        <div style={{ marginTop:8, display:"flex", gap:8, alignItems:"center" }}>
          <button disabled={saving} style={{ padding:"8px 12px", border:"1px solid #ddd", borderRadius:12, background:"#111", color:"#fff" }}>
            {saving ? "Saving..." : "Add Duty-Day"}
          </button>
          {error && <span style={{ color:"#b91c1c", fontSize:12 }}>{error}</span>}
          {loadError && <span style={{ color:"#b91c1c", fontSize:12 }}>{loadError}</span>}
        </div>
      </form>

      <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:16, padding:12 }}>
        <div style={{ fontWeight:600, marginBottom:8 }}>Recent Entries</div>
        <div style={{ display:"grid", gridTemplateColumns:"140px 80px 1fr 120px 1fr", gap:8, fontSize:13, color:"#111", fontWeight:600 }}>
          <div>Date</div><div>State</div><div>Location</div><div>Type</div><div>Notes</div>
        </div>
        <div style={{ height:8 }} />
        {list.map((d, i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"140px 80px 1fr 120px 1fr", gap:8, padding:"8px 0", borderTop:"1px dotted #e5e7eb", fontSize:13 }}>
            <div>{fmtYMD(d.date)}</div><div>{d.state}</div><div>{d.location}</div><div>{d.type}</div><div>{d.notes}</div>
          </div>
        ))}
      </div>
    </main>
  );
}