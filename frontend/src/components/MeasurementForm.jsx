import { useState } from "react";
import api from "../api/client";

const FEELING_OPTIONS = ["Normal", "Cansado(a)", "Estressado(a)", "Com dor de cabeça", "Ansioso(a)", "Outro"];

export default function MeasurementForm({ onSaved, dark = false }) {
  const now = new Date();
  const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [form, setForm] = useState({
    systolic: "", diastolic: "", heart_rate: "",
    measured_at: localIso, arm_used: "esquerdo",
    feeling: "Normal", took_medication: "sim",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess(false); setLoading(true);
    try {
      await api.post("/measurements", {
        ...form,
        systolic:    Number(form.systolic),
        diastolic:   Number(form.diastolic),
        heart_rate:  form.heart_rate ? Number(form.heart_rate) : null,
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

  const card    = dark ? "bg-white/5 border border-white/10 rounded-2xl p-5"                : "bg-white rounded-2xl shadow-md p-6";
  const label   = dark ? "block text-sm font-medium text-white/70 mb-1"                     : "block text-sm font-medium text-gray-700 mb-1";
  const input   = dark ? "w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm" : "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const select  = dark ? `${input} [&>option]:bg-[#2a2a2a]` : "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm";
  const title   = dark ? "text-lg font-semibold text-white mb-5"                            : "text-lg font-semibold text-gray-800 mb-5";

  return (
    <div className={card}>
      <h2 className={title}>Registrar nova medição</h2>

      {success && <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-xl px-4 py-2 mb-4 text-sm">Medição salva!</div>}
      {error   && <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-2 mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Sistólica (mmHg) *</label>
            <input type="number" name="systolic" required min={50} max={300} value={form.systolic} onChange={handleChange} placeholder="ex: 120" className={input} />
          </div>
          <div>
            <label className={label}>Diastólica (mmHg) *</label>
            <input type="number" name="diastolic" required min={30} max={200} value={form.diastolic} onChange={handleChange} placeholder="ex: 80" className={input} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Pulso (bpm)</label>
            <input type="number" name="heart_rate" min={30} max={250} value={form.heart_rate} onChange={handleChange} placeholder="ex: 72" className={input} />
          </div>
          <div>
            <label className={label}>Data e hora</label>
            <input type="datetime-local" name="measured_at" value={form.measured_at} onChange={handleChange} className={input} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Braço utilizado</label>
            <select name="arm_used" value={form.arm_used} onChange={handleChange} className={select}>
              <option value="esquerdo">Esquerdo</option>
              <option value="direito">Direito</option>
            </select>
          </div>
          <div>
            <label className={label}>Tomou os remédios?</label>
            <select name="took_medication" value={form.took_medication} onChange={handleChange} className={select}>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
              <option value="parcialmente">Parcialmente</option>
            </select>
          </div>
        </div>
        <div>
          <label className={label}>Como estava se sentindo?</label>
          <select name="feeling" value={form.feeling} onChange={handleChange} className={select}>
            {FEELING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-brand-orange hover:opacity-90 disabled:opacity-60 text-white font-bold rounded-xl py-3 transition-opacity">
          {loading ? "Salvando..." : "Salvar medição"}
        </button>
      </form>
    </div>
  );
}
