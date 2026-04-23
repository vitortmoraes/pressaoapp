import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/client";
import MeasurementForm from "../components/MeasurementForm";
import MeasurementList from "../components/MeasurementList";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [measurements, setMeasurements] = useState([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  async function fetchMeasurements() {
    setLoading(true);
    try {
      const { data } = await api.get(`/measurements?days=${days}`);
      setMeasurements(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMeasurements();
  }, [days]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">PressaoApp</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Aviso legal */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-xs">
          Este app é uma ferramenta de apoio e não substitui avaliação ou diagnóstico médico.
          Em caso de valores muito alterados, procure atendimento médico imediatamente.
        </div>

        {/* Formulário */}
        <MeasurementForm onSaved={fetchMeasurements} />

        {/* Filtro de período */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Período:</span>
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                days === d
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:border-blue-400"
              }`}
            >
              {d} dias
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center text-gray-400 py-10">Carregando...</div>
        ) : (
          <MeasurementList measurements={measurements} onDelete={fetchMeasurements} />
        )}
      </main>
    </div>
  );
}
