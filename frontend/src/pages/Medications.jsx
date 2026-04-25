import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/client";
import Logo from "../components/Logo";
import PremiumGate from "../components/PremiumGate";
import ConfirmModal from "../components/ConfirmModal";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`
);

function MedicationForm({ initial, onSave, onCancel }) {
  const [name,   setName]   = useState(initial?.name   || "");
  const [dosage, setDosage] = useState(initial?.dosage || "");
  const [times,  setTimes]  = useState(initial?.times  || ["08:00"]);
  const [active, setActive] = useState(initial?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  function addTime()        { setTimes([...times, "08:00"]); }
  function removeTime(i)    { setTimes(times.filter((_, idx) => idx !== i)); }
  function changeTime(i, v) { setTimes(times.map((t, idx) => idx === i ? v : t)); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Informe o nome do medicamento."); return; }
    if (times.length === 0) { setError("Adicione pelo menos um horário."); return; }
    setError(""); setLoading(true);
    try {
      await onSave({ name: name.trim(), dosage: dosage.trim() || null, times, active });
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-2 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Nome do medicamento *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required
          placeholder="ex: Losartana 50mg"
          className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Dosagem / observação</label>
        <input value={dosage} onChange={(e) => setDosage(e.target.value)}
          placeholder="ex: 1 comprimido com água"
          className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Horários de uso</label>
        <div className="space-y-2">
          {times.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <select value={t} onChange={(e) => changeTime(i, e.target.value)}
                className="bg-white/10 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange [&>option]:bg-[#2a2a2a]">
                {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              {times.length > 1 && (
                <button type="button" onClick={() => removeTime(i)}
                  className="text-white/30 hover:text-red-400 text-lg leading-none">×</button>
              )}
            </div>
          ))}
        </div>
        {times.length < 6 && (
          <button type="button" onClick={addTime}
            className="mt-2 text-sm text-brand-orange hover:underline font-medium">
            + Adicionar horário
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)}
          className="w-4 h-4 accent-brand-orange" />
        <label htmlFor="active" className="text-sm text-white/70">Medicamento ativo</label>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-white/10 text-white/60 rounded-xl py-2.5 text-sm hover:bg-white/5">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-brand-orange text-white font-bold rounded-xl py-2.5 text-sm hover:opacity-90 disabled:opacity-60">
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export default function Medications() {
  const { user, logout } = useAuth();

  if (!user?.is_premium) {
    return (
      <div className="min-h-screen bg-[#1E1E1E]">
        <header className="bg-[#1E1E1E] px-5 py-4 flex items-center gap-3 max-w-2xl mx-auto">
          <Link to="/dashboard" className="text-white/60 hover:text-white text-xl">←</Link>
          <h1 className="text-white font-extrabold text-lg flex-1">Medicamentos</h1>
          <button onClick={logout} className="text-white/60 text-sm hover:text-white">Sair</button>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          <PremiumGate feature="O gerenciamento de medicamentos e lembretes por e-mail" />
        </main>
      </div>
    );
  }
  const [medications, setMedications] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editing, setEditing]         = useState(null);
  const [confirmId, setConfirmId]     = useState(null);

  async function fetchMedications() {
    setLoading(true);
    try {
      const { data } = await api.get("/medications");
      setMedications(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMedications(); }, []);

  async function handleCreate(payload) {
    await api.post("/medications", payload);
    setShowForm(false);
    fetchMedications();
  }

  async function handleUpdate(payload) {
    await api.put(`/medications/${editing.id}`, payload);
    setEditing(null);
    fetchMedications();
  }

  async function handleDelete(id) {
    await api.delete(`/medications/${id}`);
    setConfirmId(null);
    fetchMedications();
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      {confirmId && (
        <ConfirmModal
          message="Deseja excluir este medicamento?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
      <header className="bg-[#1E1E1E] px-5 py-4 flex items-center gap-3 max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-white/60 hover:text-white text-xl">←</Link>
        <h1 className="text-white font-extrabold text-lg flex-1">Medicamentos</h1>
        <button onClick={logout} className="text-white/60 text-sm hover:text-white">Sair</button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          {!showForm && !editing && (
            <button onClick={() => setShowForm(true)}
              className="ml-auto bg-brand-orange text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90">
              + Novo medicamento
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Novo medicamento</h2>
            <MedicationForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {loading ? (
          <div className="text-center text-white/60 py-10">Carregando...</div>
        ) : medications.length === 0 && !showForm ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">💊</p>
            <p className="text-white/65 text-sm">Nenhum medicamento cadastrado ainda.</p>
            <button onClick={() => setShowForm(true)}
              className="mt-4 bg-brand-orange text-white text-sm font-bold px-5 py-2 rounded-xl hover:opacity-90">
              Cadastrar primeiro medicamento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => (
              <div key={med.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                {editing?.id === med.id ? (
                  <>
                    <h3 className="font-bold text-white mb-4">Editar medicamento</h3>
                    <MedicationForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />
                  </>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 items-start">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${med.active ? "bg-brand-purple/20" : "bg-white/10"}`}>
                        💊
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">{med.name}</p>
                          {!med.active && <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">Inativo</span>}
                        </div>
                        {med.dosage && <p className="text-sm text-white/65">{med.dosage}</p>}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {med.times.map((t) => (
                            <span key={t} className="bg-brand-purple/25 text-purple-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setEditing(med)} className="text-white/50 hover:text-brand-orange text-sm">✏️</button>
                      <button onClick={() => setConfirmId(med.id)} className="text-white/50 hover:text-red-400 text-xl leading-none">×</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
