import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from "recharts";

function formatDate(iso) {
  const utc = iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
  return new Date(utc).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function MeasurementChart({ measurements, dark = false }) {
  if (measurements.length < 2) {
    return (
      <div className={`rounded-2xl p-6 text-center text-sm ${dark ? "bg-white/5 text-white/60" : "bg-white shadow-md text-gray-500"}`}>
        Registre pelo menos 2 medições para ver o gráfico.
      </div>
    );
  }

  // Inverte para mostrar do mais antigo ao mais recente
  const data = [...measurements].reverse().map((m) => ({
    data: formatDate(m.measured_at),
    Sistólica: m.systolic,
    Diastólica: m.diastolic,
    ...(m.heart_rate ? { Pulso: m.heart_rate } : {}),
  }));

  return (
    <div className={`rounded-2xl p-5 ${dark ? "bg-white/5" : "bg-white shadow-md"}`}>
      <h2 className={`text-base font-bold mb-4 ${dark ? "text-white" : "text-gray-800"}`}>Evolução da pressão</h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#ffffff10" : "#f0f0f0"} />
          <XAxis dataKey="data" tick={{ fontSize: 11, fill: dark ? "#ffffff60" : "#6b7280" }} />
          <YAxis domain={[40, 200]} tick={{ fontSize: 11, fill: dark ? "#ffffff60" : "#6b7280" }} unit=" mmHg" width={70} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 13 }} />

          {/* Linhas de referência das faixas */}
          <ReferenceLine y={120} stroke="#facc15" strokeDasharray="4 4" label={{ value: "Elevada", position: "right", fontSize: 10, fill: "#ca8a04" }} />
          <ReferenceLine y={130} stroke="#f97316" strokeDasharray="4 4" label={{ value: "Grau 1", position: "right", fontSize: 10, fill: "#ea580c" }} />
          <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Grau 2", position: "right", fontSize: 10, fill: "#dc2626" }} />

          <Line type="monotone" dataKey="Sistólica" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Diastólica" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Pulso" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} strokeDasharray="5 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
