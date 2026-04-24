import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/client";
import Logo from "../components/Logo";

const COLOR_MAP = {
  green:   { bg: "bg-green-500",  label: "Normal",             text: "text-green-100" },
  yellow:  { bg: "bg-yellow-400", label: "Elevada",            text: "text-yellow-900" },
  orange:  { bg: "bg-orange-500", label: "Hipertensão Grau 1", text: "text-orange-100" },
  red:     { bg: "bg-red-500",    label: "Hipertensão Grau 2", text: "text-red-100" },
  darkred: { bg: "bg-red-800",    label: "Crise Hipertensiva", text: "text-red-100" },
};

function formatDate(iso) {
  const utc = iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
  return new Date(utc).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [latest, setLatest]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/measurements?days=7").then(({ data }) => {
      setLatest(data[0] || null);
    }).finally(() => setLoading(false));
  }, []);

  const cls = latest ? (COLOR_MAP[latest.color] ?? COLOR_MAP.green) : null;

  const cards = [
    { label: "Pressão",       icon: "❤️",  gradient: "from-[#FF4D6D] to-[#FF9F1C]", route: "/pressure",    desc: "Registrar e histórico" },
    { label: "Medicamentos",  icon: "💊",  gradient: "from-[#7B2FF7] to-[#00E5C3]", route: "/medications", desc: "Gerenciar remédios" },
    { label: "Relatórios",    icon: "📊",  gradient: "from-[#FF9F1C] to-[#FF4D6D]", route: "/reports",     desc: "Análise e exportação" },
    { label: "Configurações", icon: "⚙️", gradient: "from-[#A1A1AA] to-[#3a3a3a]",  route: "/settings",    desc: "Conta e preferências" },
  ];

  return (
    <div className="min-h-screen bg-[#1E1E1E] font-sans">
      {/* Header com safe-area para notch */}
      <header className="px-5 pt-safe pb-4 max-w-md mx-auto flex items-end justify-between">
        <Logo size="lg" white stacked />
        <button onClick={logout} className="text-[#A1A1AA] text-sm hover:text-white transition-colors pb-1">
          Sair
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 pb-safe space-y-4">

        {/* Saudação */}
        <div className="px-1">
          <p className="text-[#A1A1AA] text-sm">Olá,</p>
          <p className="text-white font-extrabold text-xl truncate">{user?.email?.split("@")[0]}</p>
        </div>

        {/* Última medição */}
        {!loading && (
          latest ? (
            <div
              onClick={() => navigate("/pressure")}
              className={`rounded-3xl p-5 cursor-pointer active:scale-[0.98] transition-transform ${cls.bg}`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${cls.text} opacity-80`}>
                Última medição · {formatDate(latest.measured_at)}
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white text-5xl font-extrabold leading-none">
                    {latest.systolic}/{latest.diastolic}
                  </p>
                  <p className="text-white/60 text-sm mt-1">mmHg</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${cls.text}`}>{latest.classification}</p>
                  {latest.heart_rate && (
                    <p className="text-white/70 text-sm">{latest.heart_rate} bpm</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => navigate("/pressure")}
              className="rounded-3xl p-5 cursor-pointer bg-white/5 border border-white/10 active:scale-[0.98] transition-transform"
            >
              <p className="text-[#A1A1AA] text-sm">Nenhuma medição ainda</p>
              <p className="text-white font-bold mt-1">Toque para registrar a primeira →</p>
            </div>
          )
        )}

        {/* Grid de cards */}
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card) => (
            <Link
              key={card.label}
              to={card.route}
              className={`bg-gradient-to-br ${card.gradient} rounded-3xl p-4 flex flex-col justify-between min-h-[130px] active:scale-[0.97] transition-transform shadow-lg`}
            >
              <span className="text-3xl">{card.icon}</span>
              <div>
                <p className="text-white font-extrabold text-base leading-tight">{card.label}</p>
                <p className="text-white/70 text-xs mt-0.5">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Aviso legal */}
        <p className="text-[#A1A1AA] text-xs text-center leading-relaxed pb-2">
          Este app é uma ferramenta de apoio e não substitui avaliação médica.
          Em caso de valores muito alterados, procure atendimento imediatamente.
        </p>
      </main>
    </div>
  );
}
