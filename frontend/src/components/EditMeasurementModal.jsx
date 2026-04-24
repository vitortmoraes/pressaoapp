import { useState, useEffect } from "react";
import api from "../api/client";

const FEELING_OPTIONS = ["Normal", "Cansado(a)", "Estressado(a)", "Com dor de cabeça", "Ansioso(a)", "Outro"];

function toLocalDatetime(iso) {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function EditMeasurementModal({ measurement, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      systolic:        String(measurement.systolic),
      diastolic:       String(measurement.diastolic),
      heart_rate:      measurement.heart_rate ? String(measurement.heart_rate) : "",
      measured_at:     toLocalDatetime(measurement.measured_at),
      arm_used:        measurement.arm_used || "esquerdo",
      feeling:         measurement.feeling || "Normal",
      took_medication: measurement.took_medication || "sim",
    });
  }, [measurement]);

  if (!form) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.put(`/measurements/${measurement.id}`, {
        ...form,
        systolic:   Number(form.systolic),
        diastolic:  Number(form.diastolic),
        heart_rate: form.heart_rate ? Number(form.heart_rate) : null,
        measured_at: new Date(form.measured_at).toISOString(),
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Editar medição</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sistólica (mmHg) *</label>
              <input type="number" name="systolic" required min={50} max={300} value={form.systolic} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diastólica (mmHg) *</label>
              <input type="number" name="diastolic" required min={30} max={200} value={form.diastolic} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pulso (bpm)</label>
              <input type="number" name="heart_rate" min={30} max={250} value={form.heart_rate} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data e hora</label>
              <input type="datetime-local" name="measured_at" value={form.measured_at} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Braço utilizado</label>
              <select name="arm_used" value={form.arm_used} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="esquerdo">Esquerdo</option>
                <option value="direito">Direito</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tomou os remédios?</label>
              <select name="took_medication" value={form.took_medication} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
                <option value="parcialmente">Parcialmente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Como estava se sentindo?</label>
            <select name="feeling" value={form.feeling} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {FEELING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 transition-colors">
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
