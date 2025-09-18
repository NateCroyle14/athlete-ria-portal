// Server component – no "use client" here
type KpiSummary = {
  ytdNetEarnings: number;
  dutyDaysLogged: number;
  nextPayDate: string | null;
  estStateTaxYtd: number;
  alertsCount: number;
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

async function getKpis(): Promise<KpiSummary> {
  try {
    const r = await fetch(`${API}/v1/kpis/summary`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as KpiSummary;
  } catch {
    return {
      ytdNetEarnings: 0,
      dutyDaysLogged: 0,
      nextPayDate: null,
      estStateTaxYtd: 0,
      alertsCount: 0,
    };
  }
}

function card(title: string, body: React.ReactNode) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 20,
        background: '#fff',
        minHeight: 110,
      }}
    >
      <div style={{ color: '#4b5563', fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 40, fontWeight: 800 }}>{body}</div>
    </div>
  );
}

export default async function Page() {
  const k = await getKpis();

  const money = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const nextPay = k.nextPayDate
    ? new Date(k.nextPayDate).toLocaleDateString()
    : '—';

  return (
    <main style={{ padding: 16, background: '#f7f7f8', minHeight: '100vh' }}>
      {/* Simple nav (assumes you already have a global layout/nav, keep only one) */}
      <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 8, marginBottom: 24 }}>
        🏆 Athlete Client Portal
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 16,
        }}
      >
        {card('YTD Net Earnings', money(k.ytdNetEarnings))}
        {card('Duty-Days Logged', k.dutyDaysLogged)}
        {card('Next Pay Date', nextPay)}
        {card('Est. State Tax (YTD)', money(k.estStateTaxYtd))}
      </div>

      <p style={{ marginTop: 24, color: '#6b7280', fontSize: 18 }}>
        Data loads defensively. If an endpoint is missing, these values fall back to defaults instead of crashing the page.
      </p>
    </main>
  );
}