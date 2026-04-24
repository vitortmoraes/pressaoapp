const COLOR_MAP = {
  green:   { bg: "bg-green-500",  text: "text-white",     label: "Normal" },
  yellow:  { bg: "bg-yellow-400", text: "text-yellow-900",label: "Elevada" },
  orange:  { bg: "bg-orange-500", text: "text-white",      label: "Hipertensão Grau 1" },
  red:     { bg: "bg-red-500",    text: "text-white",      label: "Hipertensão Grau 2" },
  darkred: { bg: "bg-red-800",    text: "text-white",      label: "Crise Hipertensiva" },
};

function classify(sys, dia) {
  if (sys > 180 || dia > 120) return "darkred";
  if (sys >= 140 || dia >= 90) return "red";
  if (sys >= 130 || dia >= 80) return "orange";
  if (sys >= 120 && dia < 80)  return "yellow";
  return "green";
}

export default function StatsCard({ measurements, dark = false }) {
  if (measurements.length === 0) return null;

  const avgSys = Math.round(measurements.reduce((s, m) => s + m.systolic,  0) / measurements.length);
  const avgDia = Math.round(measurements.reduce((s, m) => s + m.diastolic, 0) / measurements.length);
  const withHR = measurements.filter((m) => m.heart_rate);
  const avgHR  = withHR.length ? Math.round(withHR.reduce((s, m) => s + m.heart_rate, 0) / withHR.length) : null;

  const c = COLOR_MAP[classify(avgSys, avgDia)];

  return (
    <div className={`${c.bg} rounded-2xl p-5`}>
      <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2">
        Média do período · {measurements.length} medição{measurements.length !== 1 ? "ões" : ""}
      </p>
      <div className="flex items-center gap-6">
        <div>
          <p className={`text-4xl font-extrabold ${c.text}`}>{avgSys}/{avgDia}</p>
          <p className="text-white/60 text-xs mt-0.5">mmHg</p>
        </div>
        <div>
          <p className={`font-bold text-sm ${c.text}`}>{c.label}</p>
          {avgHR && <p className="text-white/70 text-sm">Pulso médio: {avgHR} bpm</p>}
        </div>
      </div>
    </div>
  );
}
