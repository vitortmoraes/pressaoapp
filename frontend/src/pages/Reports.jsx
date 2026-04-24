import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/client";
import PremiumGate from "../components/PremiumGate";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toUtc(iso) {
  return iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
}

function formatDate(iso) {
  return new Date(toUtc(iso)).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function avg(arr, key) {
  if (!arr.length) return null;
  return Math.round(arr.reduce((s, m) => s + m[key], 0) / arr.length);
}

// ── Constantes ────────────────────────────────────────────────────────────────

const BP_COLORS = {
  green:   { hex: "#22c55e", label: "Normal" },
  yellow:  { hex: "#facc15", label: "Elevada" },
  orange:  { hex: "#f97316", label: "Grau 1" },
  red:     { hex: "#ef4444", label: "Grau 2" },
  darkred: { hex: "#7f1d1d", label: "Crise" },
};

const PERIODS = [
  { key: "dawn",      label: "Madrugada", range: "0h–6h",   hours: [0,1,2,3,4,5] },
  { key: "morning",   label: "Manhã",     range: "6h–12h",  hours: [6,7,8,9,10,11] },
  { key: "afternoon", label: "Tarde",     range: "12h–18h", hours: [12,13,14,15,16,17] },
  { key: "evening",   label: "Noite",     range: "18h–24h", hours: [18,19,20,21,22,23] },
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ── Aba Análise ───────────────────────────────────────────────────────────────

function AnalyticsTab({ measurements }) {
  const enough = measurements.length >= 3;

  const trend = useMemo(() => {
    if (measurements.length < 6) return null;
    const mid     = Math.floor(measurements.length / 2);
    const recent  = measurements.slice(0, mid);
    const older   = measurements.slice(mid);
    const sysNow  = avg(recent, "systolic");
    const sysPrev = avg(older,  "systolic");
    const diff    = sysNow - sysPrev;
    if (diff >  3) return { icon: "↑", color: "text-red-400",    label: "Subindo",  diff: `+${diff}`, sysNow, sysPrev };
    if (diff < -3) return { icon: "↓", color: "text-green-400",  label: "Caindo",   diff: `${diff}`,  sysNow, sysPrev };
    return           { icon: "→", color: "text-yellow-400", label: "Estável",  diff: diff > 0 ? `+${diff}` : `${diff}`, sysNow, sysPrev };
  }, [measurements]);

  const distribution = useMemo(() => {
    const counts = {};
    measurements.forEach(m => { counts[m.color] = (counts[m.color] || 0) + 1; });
    return Object.entries(counts)
      .map(([color, count]) => ({
        color, count,
        label: BP_COLORS[color]?.label ?? color,
        hex:   BP_COLORS[color]?.hex   ?? "#888",
        pct:   Math.round(count / measurements.length * 100),
      }))
      .sort((a, b) => {
        const order = ["green","yellow","orange","red","darkred"];
        return order.indexOf(a.color) - order.indexOf(b.color);
      });
  }, [measurements]);

  const byPeriod = useMemo(() => PERIODS.map(p => {
    const items = measurements.filter(m =>
      p.hours.includes(new Date(toUtc(m.measured_at)).getHours())
    );
    return {
      ...p,
      sys:   avg(items, "systolic"),
      dia:   avg(items, "diastolic"),
      count: items.length,
    };
  }), [measurements]);

  const byDay = useMemo(() => WEEKDAYS.map((day, i) => {
    const items = measurements.filter(m =>
      new Date(toUtc(m.measured_at)).getDay() === i
    );
    return { day, sys: avg(items, "systolic") ?? 0, count: items.length };
  }), [measurements]);

  if (!enough) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-white font-bold mb-1">Dados insuficientes</p>
        <p className="text-white/60 text-sm">Registre pelo menos 3 medições neste período para ver a análise.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Tendência */}
      {trend && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">Tendência sistólica</p>
          <div className="flex items-center gap-4">
            <span className={`text-5xl font-extrabold leading-none ${trend.color}`}>{trend.icon}</span>
            <div>
              <p className={`text-xl font-extrabold ${trend.color}`}>{trend.label}</p>
              <p className="text-white/65 text-sm mt-0.5">
                Recente <strong className="text-white">{trend.sysNow} mmHg</strong>
                {" vs anterior "}
                <strong className="text-white">{trend.sysPrev} mmHg</strong>
                {" ("}
                <span className={trend.color}>{trend.diff} mmHg</span>
                {")"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Distribuição */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-4">Distribuição das medições</p>
        <div className="flex items-center gap-2">
          <ResponsiveContainer width={130} height={130}>
            <PieChart>
              <Pie data={distribution} cx="50%" cy="50%"
                innerRadius={38} outerRadius={58}
                dataKey="count" strokeWidth={0}>
                {distribution.map(d => <Cell key={d.color} fill={d.hex} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {distribution.map(d => (
              <div key={d.color} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.hex }} />
                  <span className="text-white/70 text-xs truncate">{d.label}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-white text-xs font-bold">{d.pct}%</span>
                  <span className="text-white/50 text-xs">({d.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Por período do dia */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-4">Média por período do dia</p>
        <div className="grid grid-cols-2 gap-2">
          {byPeriod.map(p => (
            <div key={p.key} className={`rounded-xl p-3 ${p.count > 0 ? "bg-white/10" : "bg-white/5 opacity-60"}`}>
              <p className="text-white/70 text-xs font-medium mb-1">
                {p.label} <span className="text-white/40 font-normal">{p.range}</span>
              </p>
              {p.count > 0 ? (
                <>
                  <p className="text-white font-extrabold text-lg leading-none">{p.sys}/{p.dia}</p>
                  <p className="text-white/50 text-xs mt-0.5">{p.count} medição{p.count !== 1 ? "ões" : ""}</p>
                </>
              ) : (
                <p className="text-white/50 text-sm">Sem dados</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Por dia da semana */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-4">Sistólica média por dia da semana</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={byDay} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#ffffff60" }} />
            <YAxis domain={[60, 180]} tick={{ fontSize: 10, fill: "#ffffff60" }} />
            <Tooltip
              contentStyle={{ background: "#2a2a2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#fff", fontWeight: 700 }}
              formatter={(v, _, p) => [
                p.payload.count > 0 ? `${v} mmHg (${p.payload.count} medição${p.payload.count !== 1 ? "ões" : ""})` : "Sem dados",
                "Sistólica",
              ]}
            />
            <Bar dataKey="sys" radius={[4, 4, 0, 0]}>
              {byDay.map((entry, i) => (
                <Cell key={i} fill={entry.count > 0 ? "#FF9F1C" : "#ffffff15"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

// ── Aba Exportar ──────────────────────────────────────────────────────────────

function ExportTab({ measurements, loading }) {
  const [generating, setGenerating] = useState(false);

  function exportCSV() {
    const header = "Data,Hora,Sistólica,Diastólica,Pulso,Braço,Sentimento,Tomou remédio,Classificação\n";
    const rows = measurements.map(m => {
      const d = new Date(toUtc(m.measured_at));
      return [
        d.toLocaleDateString("pt-BR"),
        d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        m.systolic, m.diastolic,
        m.heart_rate || "",
        m.arm_used || "",
        m.feeling || "",
        m.took_medication || "",
        m.classification,
      ].join(",");
    });
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sobrepressao.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const sysAvg = avg(measurements, "systolic");
      const diaAvg = avg(measurements, "diastolic");
      doc.setFontSize(18); doc.text("SobrePressão — Relatório de Pressão Arterial", 14, 22);
      doc.setFontSize(11); doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 32);
      doc.text(`Total de medições: ${measurements.length}`, 14, 42);
      doc.text(`Média: ${sysAvg}/${diaAvg} mmHg`, 14, 52);
      let y = 68;
      doc.setFontSize(10);
      ["Data/Hora", "Pressão", "Pulso", "Classificação"].forEach((h, i) => {
        doc.text(h, [14, 65, 100, 125][i], y);
      });
      y += 5; doc.line(14, y, 196, y); y += 7;
      measurements.forEach(m => {
        if (y > 270) { doc.addPage(); y = 20; }
        const dt = new Date(toUtc(m.measured_at)).toLocaleString("pt-BR", {
          day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
        });
        doc.text(dt, 14, y);
        doc.text(`${m.systolic}/${m.diastolic}`, 65, y);
        doc.text(m.heart_rate ? `${m.heart_rate} bpm` : "—", 100, y);
        doc.text(m.classification, 125, y);
        y += 8;
      });
      doc.save("sobrepressao.pdf");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={exportCSV} disabled={loading || measurements.length === 0}
          className="bg-white/5 border-2 border-brand-teal/50 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors disabled:opacity-50">
          <p className="text-3xl mb-2">📄</p>
          <p className="font-extrabold text-lg text-white">Exportar CSV</p>
          <p className="text-sm text-white/50 mt-1">Planilha para Excel, Google Sheets e similares.</p>
        </button>
        <button onClick={exportPDF} disabled={loading || generating || measurements.length === 0}
          className="bg-white/5 border-2 border-brand-orange/50 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors disabled:opacity-50">
          <p className="text-3xl mb-2">📋</p>
          <p className="font-extrabold text-lg text-white">{generating ? "Gerando PDF..." : "Exportar PDF"}</p>
          <p className="text-sm text-white/50 mt-1">Relatório formatado para levar ao médico.</p>
        </button>
      </div>

      {!loading && measurements.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white font-bold text-sm mb-3">Preview — {measurements.length} medições</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/10">
                  {["Data/Hora","Sist.","Diast.","Pulso","Classificação"].map(h => (
                    <th key={h} className="px-3 py-2 text-xs text-white/60 text-left first:rounded-tl-lg last:rounded-tr-lg">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {measurements.slice(0, 10).map(m => {
                  const bg = { green:"bg-green-500/10", yellow:"bg-yellow-500/10", orange:"bg-orange-500/10", red:"bg-red-500/10", darkred:"bg-red-800/20" };
                  return (
                    <tr key={m.id} className={bg[m.color] || ""}>
                      <td className="px-3 py-2 text-xs text-white/50">{formatDate(m.measured_at)}</td>
                      <td className="px-3 py-2 text-center font-bold text-white">{m.systolic}</td>
                      <td className="px-3 py-2 text-center font-bold text-white">{m.diastolic}</td>
                      <td className="px-3 py-2 text-center text-white/50">{m.heart_rate || "—"}</td>
                      <td className="px-3 py-2 text-xs font-semibold text-white/70">{m.classification}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {measurements.length > 10 && (
              <p className="text-xs text-white/50 text-center mt-2">
                Mostrando 10 de {measurements.length} — o arquivo exportado terá todas.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Reports() {
  const { user, logout } = useAuth();
  const [tab, setTab]               = useState("analytics");
  const [days, setDays]             = useState(30);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/measurements?days=${days}`)
      .then(({ data }) => setMeasurements(data))
      .finally(() => setLoading(false));
  }, [days]);

  if (!user?.is_premium) {
    return (
      <div className="min-h-screen bg-[#1E1E1E]">
        <header className="px-5 py-4 flex items-center gap-3 max-w-2xl mx-auto">
          <Link to="/dashboard" className="text-white/60 hover:text-white text-xl">←</Link>
          <h1 className="text-white font-extrabold text-lg flex-1">Relatórios</h1>
          <button onClick={logout} className="text-white/60 text-sm hover:text-white">Sair</button>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          <PremiumGate feature="Os relatórios, análise e exportação de dados" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <header className="px-5 py-4 flex items-center gap-3 max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-white/60 hover:text-white text-xl">←</Link>
        <h1 className="text-white font-extrabold text-lg flex-1">Relatórios</h1>
        <button onClick={logout} className="text-white/60 text-sm hover:text-white">Sair</button>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-10 space-y-4">

        {/* Seletor de período */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
          {[7, 14, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                days === d
                  ? "bg-brand-orange text-white shadow"
                  : "text-white/60 hover:text-white"
              }`}>
              {d}d
            </button>
          ))}
        </div>

        {/* Abas */}
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
          {[
            { key: "analytics", label: "📊  Análise" },
            { key: "export",    label: "📁  Exportar" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                tab === t.key
                  ? "bg-brand-orange text-white shadow"
                  : "text-white/60 hover:text-white"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-white/60 py-12">Carregando...</div>
        ) : tab === "analytics" ? (
          <AnalyticsTab measurements={measurements} />
        ) : (
          <ExportTab measurements={measurements} loading={loading} />
        )}

      </main>
    </div>
  );
}
