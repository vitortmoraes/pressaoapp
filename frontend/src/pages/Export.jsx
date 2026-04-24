import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/client";
import Logo from "../components/Logo";
import PremiumGate from "../components/PremiumGate";

const CLASSIFICATIONS = {
  green:   "Normal",
  yellow:  "Elevada",
  orange:  "Hipertensão Grau 1",
  red:     "Hipertensão Grau 2",
  darkred: "Crise Hipertensiva",
};

function formatDate(iso) {
  const utc = iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
  return new Date(utc).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function Export() {
  const { user, logout } = useAuth();

  if (!user?.is_premium) {
    return (
      <div className="min-h-screen bg-[#1E1E1E]">
        <header className="bg-[#1E1E1E] px-5 py-4 flex items-center gap-3 max-w-2xl mx-auto">
          <Link to="/dashboard" className="text-white/60 hover:text-white text-xl">←</Link>
          <h1 className="text-white font-extrabold text-lg flex-1">Exportar Relatório</h1>
          <button onClick={logout} className="text-white/60 text-sm hover:text-white">Sair</button>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          <PremiumGate feature="A exportação de relatórios em PDF e CSV" />
        </main>
      </div>
    );
  }
  const [measurements, setMeasurements] = useState([]);
  const [days, setDays]     = useState(30);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function fetchMeasurements() {
    setLoading(true);
    try {
      const { data } = await api.get(`/measurements?days=${days}`);
      setMeasurements(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMeasurements(); }, [days]);

  // ── CSV ──────────────────────────────────────────────────────────────────────
  function exportCSV() {
    const header = "Data/Hora,Sistólica,Diastólica,Pulso,Classificação,Braço,Sentimento,Tomou remédios\n";
    const rows = measurements.map((m) =>
      [
        formatDate(m.measured_at),
        m.systolic,
        m.diastolic,
        m.heart_rate || "",
        m.classification,
        m.arm_used || "",
        m.feeling || "",
        m.took_medication || "",
      ].join(",")
    ).join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `sobrepressao_${days}dias.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── PDF ──────────────────────────────────────────────────────────────────────
  function exportPDF() {
    setGenerating(true);
    try {
      const doc   = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();
      let y = 20;

      // Cabeçalho
      doc.setFillColor(255, 159, 28);
      doc.rect(0, 0, pageW, 14, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("SobrePressao — Relatório de Medições", pageW / 2, 9, { align: "center" });

      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Paciente: ${user.email}`, 14, y);
      doc.text(`Período: últimos ${days} dias  |  Total: ${measurements.length} medição(ões)`, 14, y + 6);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, y + 12);
      y += 22;

      // Médias
      if (measurements.length > 0) {
        const avgSys = Math.round(measurements.reduce((s, m) => s + m.systolic,  0) / measurements.length);
        const avgDia = Math.round(measurements.reduce((s, m) => s + m.diastolic, 0) / measurements.length);
        const withHR = measurements.filter((m) => m.heart_rate);
        const avgHR  = withHR.length ? Math.round(withHR.reduce((s, m) => s + m.heart_rate, 0) / withHR.length) : null;

        doc.setFillColor(245, 245, 247);
        doc.roundedRect(14, y, pageW - 28, 14, 3, 3, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`Média: ${avgSys}/${avgDia} mmHg${avgHR ? `  |  Pulso médio: ${avgHR} bpm` : ""}`, 20, y + 9);
        y += 22;
      }

      // Cabeçalho da tabela
      const cols = [14, 52, 72, 92, 110, 148, 172];
      const headers = ["Data/Hora", "Sist.", "Diast.", "Pulso", "Classificação", "Braço", "Remédio"];
      doc.setFillColor(30, 30, 30);
      doc.rect(14, y, pageW - 28, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      headers.forEach((h, i) => doc.text(h, cols[i], y + 5.5));
      y += 10;

      // Linhas da tabela
      const colorMap = { green: [220, 252, 231], yellow: [254, 249, 195], orange: [255, 237, 213], red: [254, 226, 226], darkred: [252, 165, 165] };
      measurements.forEach((m, idx) => {
        if (y > 270) { doc.addPage(); y = 20; }

        const bg = colorMap[m.color] || [255, 255, 255];
        doc.setFillColor(...bg);
        doc.rect(14, y, pageW - 28, 7, "F");

        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", idx % 2 === 0 ? "normal" : "normal");
        doc.setFontSize(7.5);

        doc.text(formatDate(m.measured_at), cols[0], y + 5);
        doc.text(String(m.systolic),        cols[1], y + 5);
        doc.text(String(m.diastolic),       cols[2], y + 5);
        doc.text(m.heart_rate ? String(m.heart_rate) : "—", cols[3], y + 5);
        doc.text(m.classification,          cols[4], y + 5);
        doc.text(m.arm_used || "—",         cols[5], y + 5);
        doc.text(m.took_medication || "—",  cols[6], y + 5);
        y += 7;
      });

      // Rodapé
      y += 10;
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "italic");
      doc.text("Este relatório é uma ferramenta de apoio e não substitui avaliação médica profissional.", 14, y);

      doc.save(`sobrepressao_${days}dias.pdf`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <header className="bg-[#1E1E1E] px-5 py-4 flex items-center gap-3 max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-white/60 hover:text-white text-xl">←</Link>
        <h1 className="text-white font-extrabold text-lg flex-1">Exportar Relatório</h1>
        <button onClick={logout} className="text-white/60 text-sm hover:text-white">Sair</button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Seletor de período */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-white">Selecione o período</h2>
          <div className="flex flex-wrap gap-2">
            {[7, 14, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  days === d ? "bg-brand-orange text-white" : "border border-white/10 text-white/60 hover:border-brand-orange"
                }`}>
                {d} dias
              </button>
            ))}
          </div>
          {!loading && (
            <p className="text-sm text-white/60">
              {measurements.length} medição(ões) encontrada(s) nos últimos {days} dias.
            </p>
          )}
        </div>

        {/* Botões de exportação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={exportCSV} disabled={loading || measurements.length === 0}
            className="bg-white/5 border-2 border-brand-teal/50 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors disabled:opacity-50">
            <p className="text-3xl mb-2">📄</p>
            <p className="font-extrabold text-lg text-white">Exportar CSV</p>
            <p className="text-sm text-white/50 mt-1">Planilha para Excel, Google Sheets ou qualquer programa de dados.</p>
          </button>

          <button onClick={exportPDF} disabled={loading || generating || measurements.length === 0}
            className="bg-white/5 border-2 border-brand-orange/50 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors disabled:opacity-50">
            <p className="text-3xl mb-2">📋</p>
            <p className="font-extrabold text-lg text-white">
              {generating ? "Gerando PDF..." : "Exportar PDF"}
            </p>
            <p className="text-sm text-white/50 mt-1">Relatório formatado para levar ao médico, com médias e classificações.</p>
          </button>
        </div>

        {/* Preview da tabela */}
        {!loading && measurements.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Preview dos dados</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/10">
                    <th className="px-3 py-2 text-left rounded-tl-xl text-xs text-white/70">Data/Hora</th>
                    <th className="px-3 py-2 text-center text-xs text-white/70">Sist.</th>
                    <th className="px-3 py-2 text-center text-xs text-white/70">Diast.</th>
                    <th className="px-3 py-2 text-center text-xs text-white/70">Pulso</th>
                    <th className="px-3 py-2 text-left rounded-tr-xl text-xs text-white/70">Classificação</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.slice(0, 10).map((m) => {
                    const bgMap = { green: "bg-green-500/10", yellow: "bg-yellow-500/10", orange: "bg-orange-500/10", red: "bg-red-500/10", darkred: "bg-red-800/20" };
                    return (
                      <tr key={m.id} className={bgMap[m.color] || ""}>
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
                <p className="text-xs text-white/55 text-center mt-2">
                  Mostrando 10 de {measurements.length} — o arquivo exportado terá todas.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
