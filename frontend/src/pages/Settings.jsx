import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/client";

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-brand-orange" : "bg-white/20"}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-[26px]" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();

  // Plano
  const [refreshing, setRefreshing] = useState(false);
  const [planMsg, setPlanMsg]       = useState("");

  // Lembrete de pressão
  const [pressureEnabled, setPressureEnabled] = useState(!!user?.reminder_time);
  const [pressureTime, setPressureTime]       = useState(user?.reminder_time || "22:00");

  // Lembrete de medicamentos
  const [medEnabled, setMedEnabled] = useState(user?.med_reminder_enabled ?? true);

  // Salvar lembretes
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  async function handleRefreshPlan() {
    setRefreshing(true);
    setPlanMsg("");
    const updated = await refreshUser();
    setRefreshing(false);
    setPlanMsg(updated?.is_premium ? "✅ Plano Premium ativo!" : "Plano gratuito — nenhuma alteração.");
    setTimeout(() => setPlanMsg(""), 4000);
  }

  async function handleSaveReminders() {
    setSaving(true);
    setSaveMsg("");
    try {
      await api.put("/users/me/preferences", {
        reminder_time: pressureEnabled ? pressureTime : null,
        med_reminder_enabled: medEnabled,
      });
      await refreshUser();
      setSaveMsg("✅ Preferências salvas!");
    } catch {
      setSaveMsg("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 4000);
    }
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] font-sans">
      <header className="px-5 pt-safe pb-3 flex items-center gap-3 max-w-md mx-auto">
        <Link to="/dashboard" className="text-white/60 hover:text-white text-xl">←</Link>
        <h1 className="text-white font-extrabold text-lg flex-1">Configurações</h1>
      </header>

      <main className="max-w-md mx-auto px-4 pb-safe space-y-4">

        {/* Conta */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
          <p className="text-white/60 text-xs uppercase tracking-wider font-semibold">Conta</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.email}</p>
              <p className="text-[#A1A1AA] text-xs">{user?.is_premium ? "✨ Plano Premium" : "Plano Gratuito"}</p>
            </div>
          </div>
          <button onClick={handleRefreshPlan} disabled={refreshing}
            className="text-xs text-white/50 hover:text-white/80 disabled:opacity-50 transition-colors">
            {refreshing ? "Verificando..." : "Verificar status do plano"}
          </button>
          {planMsg && <p className="text-xs text-brand-orange">{planMsg}</p>}
        </div>

        {/* Upgrade (só para gratuitos) */}
        {!user?.is_premium && (
          <div className="bg-gradient-to-br from-[#FF9F1C] to-[#FF4D6D] rounded-3xl p-5">
            <p className="text-white font-extrabold text-lg mb-1">Upgrade para Premium</p>
            <p className="text-white/80 text-sm mb-3">
              Desbloqueie histórico completo, medicamentos, lembretes e exportação.
            </p>
            <ul className="space-y-1 mb-4">
              {["Histórico completo", "Gerenciamento de medicamentos", "Lembretes por e-mail", "Exportação em PDF e CSV"].map((f) => (
                <li key={f} className="text-white/90 text-sm flex items-center gap-2">
                  <span className="font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between">
              <p className="text-white font-extrabold text-2xl">
                R$ 9,90<span className="text-sm font-normal opacity-80">/mês</span>
              </p>
              <button className="bg-white text-brand-orange font-bold px-5 py-2 rounded-xl text-sm hover:opacity-90">
                Assinar
              </button>
            </div>
          </div>
        )}

        {/* Lembretes por e-mail (só para premium) */}
        {user?.is_premium && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-5">
            <p className="text-white/60 text-xs uppercase tracking-wider font-semibold">Lembretes por e-mail</p>

            {/* Seção: Aferição de pressão */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">Lembrete de aferição</p>
                  <p className="text-white/60 text-xs mt-0.5 leading-relaxed">
                    Se você não aferir a pressão até o horário escolhido, recebe um e-mail de aviso.
                  </p>
                </div>
                <Toggle enabled={pressureEnabled} onChange={setPressureEnabled} />
              </div>

              {pressureEnabled && (
                <div className="flex items-center gap-3 pl-1">
                  <p className="text-white/65 text-sm">Horário limite:</p>
                  <select
                    value={pressureTime}
                    onChange={(e) => setPressureTime(e.target.value)}
                    className="bg-white/10 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange [&>option]:bg-[#2a2a2a]"
                  >
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              )}

              {pressureEnabled && (
                <p className="text-white/55 text-xs pl-1">
                  Se não houver medição registrada até as {pressureTime}, você receberá um e-mail de lembrete.
                </p>
              )}
            </div>

            {/* Divisor */}
            <div className="border-t border-white/10" />

            {/* Seção: Medicamentos */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">Lembretes de medicamentos</p>
                  <p className="text-white/60 text-xs mt-0.5 leading-relaxed">
                    Receba um e-mail em cada horário de dose cadastrado nos seus medicamentos.
                  </p>
                </div>
                <Toggle enabled={medEnabled} onChange={setMedEnabled} />
              </div>

              {medEnabled && (
                <Link to="/medications"
                  className="inline-flex items-center gap-1 text-brand-orange text-xs font-semibold hover:underline pl-1">
                  Gerenciar medicamentos e horários →
                </Link>
              )}
            </div>

            {/* Botão salvar */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleSaveReminders}
                disabled={saving}
                className="w-full bg-brand-orange text-white font-bold rounded-xl py-3 text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {saving ? "Salvando..." : "Salvar preferências"}
              </button>
              {saveMsg && (
                <p className={`text-xs text-center ${saveMsg.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
                  {saveMsg}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sobre */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
          <p className="text-white/60 text-xs uppercase tracking-wider font-semibold">Sobre</p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white text-sm">Versão</span>
              <span className="text-[#A1A1AA] text-sm">1.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white text-sm">Desenvolvido por</span>
              <span className="text-[#A1A1AA] text-sm">vitortmoraes</span>
            </div>
          </div>
        </div>

        {/* Aviso legal */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
          <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-2">Aviso Legal</p>
          <p className="text-[#A1A1AA] text-xs leading-relaxed">
            Este app é uma ferramenta de apoio ao monitoramento pessoal da pressão arterial e não substitui a avaliação, o diagnóstico ou o tratamento médico. Em caso de valores muito alterados ou sintomas graves, procure atendimento médico imediatamente.
          </p>
        </div>

        {/* Sair */}
        <button onClick={logout}
          className="w-full border border-red-500/30 text-red-400 rounded-3xl py-4 font-semibold hover:bg-red-500/10 transition-colors">
          Sair da conta
        </button>

      </main>
    </div>
  );
}
