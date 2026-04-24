import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const features = [
  { icon: "❤️", color: "bg-red-500/20 text-red-400",      title: "Meça",    desc: "Registre sua pressão em segundos, com todos os detalhes que importam." },
  { icon: "📊", color: "bg-orange-500/20 text-brand-orange", title: "Analise", desc: "Gráficos claros mostram sua evolução ao longo do tempo." },
  { icon: "💊", color: "bg-purple-500/20 text-purple-300",  title: "Lembre",  desc: "Gerencie seus medicamentos e receba lembretes no horário certo." },
  { icon: "🛡️", color: "bg-teal-500/20 text-brand-teal",   title: "Proteja", desc: "Exporte relatórios em PDF para levar ao seu médico." },
];

const freeFeatures = ["Registro de medições", "Histórico dos últimos 30 dias", "Classificação visual por faixa", "Gráfico de evolução"];
const paidFeatures = ["Tudo do plano gratuito", "Histórico completo", "Gerenciamento de medicamentos", "Lembretes por e-mail", "Exportação em PDF e CSV"];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] font-sans">

      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        <Logo size="md" />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login"
            className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
            Entrar
          </Link>
          <Link to="/register"
            className="bg-brand-orange text-white text-sm font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl hover:opacity-90 transition-opacity">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 pt-10 pb-16 md:pt-16 md:pb-24 flex flex-col md:flex-row items-center gap-10 md:gap-12">
        <div className="flex-1 text-center md:text-left">
          <span className="inline-block bg-brand-orange/15 text-brand-orange text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Monitoramento de pressão arterial
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            Cuidar da pressão<br />é coisa séria.
            <span className="block text-brand-orange">Mas a gente leva<br />na esportiva!</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg mb-8 max-w-md mx-auto md:mx-0">
            Registre suas medições, acompanhe sua evolução, gerencie medicamentos e leve relatórios prontos para o médico.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Link to="/register"
              className="bg-brand-orange text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity text-center text-sm sm:text-base">
              Criar conta grátis
            </Link>
            <Link to="/login"
              className="border-2 border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-center text-sm sm:text-base">
              Já tenho conta
            </Link>
          </div>
        </div>

        {/* Logo grande */}
        <div className="flex-1 flex justify-center">
          <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-3xl bg-gradient-to-br from-brand-orange to-brand-red flex items-center justify-center shadow-2xl shadow-brand-orange/20">
            <img src="/logo_nova.png" alt="SobrePressão"
              className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 object-contain"
              onError={(e) => {
                e.target.parentNode.innerHTML = `<div class="text-center text-white"><div class="text-8xl">❤️</div><div class="text-2xl font-extrabold mt-2">120/80</div></div>`;
              }} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white/3 border-y border-white/5 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3">
            Tudo que você precisa<br />em um só lugar
          </h2>
          <p className="text-white/60 text-center mb-12">Simples de usar, poderoso para acompanhar.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center text-2xl mx-auto mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-extrabold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-white/65 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classificação */}
      <section className="max-w-5xl mx-auto px-5 py-16 md:py-24">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3">
          Entenda sua pressão
        </h2>
        <p className="text-white/60 text-center mb-10">O app classifica cada medição automaticamente com cores.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-3xl mx-auto">
          {[
            { label: "Normal",             range: "< 120/80",      bg: "bg-green-500/20",  text: "text-green-400",  border: "border-green-500/30" },
            { label: "Elevada",            range: "120–129/<80",    bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
            { label: "Grau 1",             range: "130–139/80–89",  bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
            { label: "Grau 2",             range: "≥ 140/≥ 90",    bg: "bg-red-500/20",    text: "text-red-400",    border: "border-red-500/30" },
            { label: "Crise",              range: "> 180/>120",     bg: "bg-red-800/30",    text: "text-red-300",    border: "border-red-700/40" },
          ].map((c) => (
            <div key={c.label} className={`${c.bg} border ${c.border} rounded-2xl p-4 text-center col-span-1`}>
              <p className={`font-bold text-sm ${c.text}`}>{c.label}</p>
              <p className="text-white/55 text-xs mt-1">{c.range} mmHg</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planos */}
      <section className="bg-white/3 border-y border-white/5 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3">Planos</h2>
          <p className="text-white/60 text-center mb-12">Comece grátis. Evolua quando quiser.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">

            {/* Gratuito */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <p className="text-white/50 text-sm font-semibold uppercase tracking-wide mb-2">Gratuito</p>
              <p className="text-4xl font-extrabold text-white mb-6">R$ 0</p>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-brand-teal font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register"
                className="block text-center border-2 border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors">
                Começar grátis
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-brand-orange to-brand-red rounded-3xl p-8 relative shadow-2xl shadow-brand-orange/20">
              <span className="absolute top-4 right-4 bg-white text-brand-orange text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </span>
              <p className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-2">Premium</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">R$ 9,90</span>
                <span className="text-white/70 text-sm">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                {paidFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white">
                    <span className="font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register"
                className="block text-center bg-white text-brand-orange font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">
                Assinar Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-5xl mx-auto px-5 py-16 md:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Sua saúde merece<br />atenção todos os dias.
        </h2>
        <p className="text-white/65 mb-8 max-w-sm mx-auto">Crie sua conta agora e comece a monitorar sua pressão de graça.</p>
        <Link to="/register"
          className="inline-block bg-brand-orange text-white font-bold px-10 py-4 rounded-xl hover:opacity-90 transition-opacity text-base">
          Criar conta grátis
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-white/45 text-xs text-center">
            Este app é uma ferramenta de apoio e não substitui avaliação médica profissional.
          </p>
          <p className="text-white/45 text-xs">© 2026 SobrePressão</p>
        </div>
      </footer>
    </div>
  );
}
