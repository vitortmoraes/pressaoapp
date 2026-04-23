import { useState } from "react";
import api from "../api/client";

const FEELING_OPTIONS = ["Normal", "Cansado(a)", "Estressado(a)", "Com dor de cabeça", "Ansioso(a)", "Outro"];

export default function MeasurementForm({ onSaved }) {
  const now = new Date();
  const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [form, setForm] = useState({
    systolic: "",
    diastolic: "",
    heart_rate: "",
    measured_at: localIso,
    arm_used: "esquerdo",
    feeling: "Normal",
    took_medication: "sim",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await api.post("/measurements", {
        ...form,
        systolic: Number(form.systolic),
        diastolic: Number(form.diastolic),
        heart_rate: form.heart_rate ? Number(form.heart_rate) : null,
        measured_at: new Date(form.measured_at).toISOString(),
      });
      setSuccess(true);
      setForm({ ...form, systolic: "", diastolic: "", heart_rate: "" });
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao salvar medição.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-5">Registrar nova medição</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 mb-4 text-sm">
          Medição salva com sucesso!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sistólica (mmHg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="systolic"
              required
              min={50}
              max={300}
              value={form.systolic}
              onChange={handleChange}
              placeholder="ex: 120"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diastólica (mmHg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="diastolic"
              required
              min={30}
              max={200}
              value={form.diastolic}
              onChange={handleChange}
              placeholder="ex: 80"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pulso (bpm)</label>
            <input
              type="number"
              name="heart_rate"
              min={30}
              max={250}
              value={form.heart_rate}
              onChange={handleChange}
              placeholder="ex: 72"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data e hora</label>
            <input
              type="datetime-local"
              name="measured_at"
              value={form.measured_at}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Braço utilizado</label>
            <select
              name="arm_used"
              value={form.arm_used}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="esquerdo">Esquerdo</option>
              <option value="direito">Direito</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tomou os remédios?</label>
            <select
              name="took_medication"
              value={form.took_medication}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
              <option value="parcialmente">Parcialmente</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Como estava se sentindo?</label>
          <select
            name="feeling"
            value={form.feeling}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {FEELING_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 transition-colors"
        >
          {loading ? "Salvando..." : "Salvar medição"}
        </button>
      </form>
    </div>
  );
}
