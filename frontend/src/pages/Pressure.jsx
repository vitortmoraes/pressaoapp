import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/client";
import MeasurementForm from "../components/MeasurementForm";
import MeasurementList from "../components/MeasurementList";
import MeasurementChart from "../components/MeasurementChart";
import StatsCard from "../components/StatsCard";

export default function Pressure() {
  const { logout } = useAuth();
  const [measurements, setMeasurements] = useState([]);
  const [days, setDays]       = useState(30);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#1E1E1E] font-sans">
      <header className="px-5 py-4 flex items-center gap-3 max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-white/60 hover:text-white text-xl">←</Link>
        <h1 className="text-white font-extrabold text-lg flex-1">Pressão Arterial</h1>
        <button onClick={logout} className="text-white/60 text-sm hover:text-white">Sair</button>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-10 space-y-5">
        {showForm ? (
          <div>
            <MeasurementForm onSaved={() => { fetchMeasurements(); setShowForm(false); }} dark />
            <button onClick={() => setShowForm(false)}
              className="mt-2 text-sm text-white/40 hover:text-white/70 w-full text-center">
              Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)}
            className="w-full bg-brand-orange hover:opacity-90 text-white font-bold rounded-2xl py-3.5 transition-opacity">
            + Registrar nova medição
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60 font-medium">Período:</span>
          {[7, 14, 30].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                days === d
                  ? "bg-brand-orange text-white"
                  : "border border-white/20 text-white/60 hover:border-brand-orange hover:text-white"
              }`}>
              {d} dias
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-white/60 py-10">Carregando...</div>
        ) : (
          <>
            <StatsCard measurements={measurements} dark />
            <MeasurementChart measurements={measurements} dark />
            <MeasurementList measurements={measurements} onDelete={fetchMeasurements} onEdit={fetchMeasurements} dark />
          </>
        )}
      </main>
    </div>
  );
}
