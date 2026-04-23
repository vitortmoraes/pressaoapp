import api from "../api/client";

const COLOR_MAP = {
  green:   { bg: "bg-green-100",    text: "text-green-800",    border: "border-green-300" },
  yellow:  { bg: "bg-yellow-100",   text: "text-yellow-800",   border: "border-yellow-300" },
  orange:  { bg: "bg-orange-100",   text: "text-orange-800",   border: "border-orange-300" },
  red:     { bg: "bg-red-100",      text: "text-red-800",      border: "border-red-300" },
  darkred: { bg: "bg-red-200",      text: "text-red-900",      border: "border-red-500" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function MeasurementList({ measurements, onDelete }) {
  if (measurements.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-400">
        Nenhuma medição registrada ainda.
      </div>
    );
  }

  async function handleDelete(id) {
    if (!confirm("Deseja excluir esta medição?")) return;
    await api.delete(`/measurements/${id}`);
    onDelete?.();
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Histórico de medições</h2>
      <div className="space-y-3">
        {measurements.map((m) => {
          const c = COLOR_MAP[m.color] ?? COLOR_MAP.green;
          return (
            <div
              key={m.id}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${c.bg} ${c.border}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[72px]">
                  <p className={`text-2xl font-bold ${c.text}`}>
                    {m.systolic}/{m.diastolic}
                  </p>
                  <p className="text-xs text-gray-500">mmHg</p>
                </div>

                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${c.text}`}>
                    {m.classification}
                  </p>
                  <p className="text-sm text-gray-600">{formatDate(m.measured_at)}</p>
                  <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                    {m.heart_rate && <span>Pulso: {m.heart_rate} bpm</span>}
                    {m.arm_used && <span>Braço: {m.arm_used}</span>}
                    {m.feeling && <span>{m.feeling}</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(m.id)}
                className="text-gray-400 hover:text-red-500 transition-colors text-xl leading-none"
                title="Excluir"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
