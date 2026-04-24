import { Link } from "react-router-dom";

export default function PremiumGate({ feature = "este recurso" }) {
  return (
    <div className="bg-gradient-to-br from-brand-orange/20 to-brand-red/20 border border-brand-orange/30 rounded-2xl p-8 text-center">
      <div className="text-5xl mb-4">✨</div>
      <h3 className="text-white font-extrabold text-xl mb-2">Recurso Premium</h3>
      <p className="text-white/60 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
        {feature} está disponível apenas no plano Premium. Faça upgrade para desbloquear.
      </p>
      <ul className="text-white/70 text-sm space-y-1 mb-6 text-left max-w-[220px] mx-auto">
        <li className="flex gap-2"><span className="text-brand-orange">✓</span> Histórico completo</li>
        <li className="flex gap-2"><span className="text-brand-orange">✓</span> Medicamentos</li>
        <li className="flex gap-2"><span className="text-brand-orange">✓</span> Lembretes por e-mail</li>
        <li className="flex gap-2"><span className="text-brand-orange">✓</span> Exportação PDF / CSV</li>
      </ul>
      <Link to="/settings"
        className="inline-block bg-brand-orange text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 text-sm">
        Ver planos — R$ 9,90/mês
      </Link>
    </div>
  );
}
