import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import Logo from "../components/Logo";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 rounded-3xl w-full max-w-md p-8">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="text-xl font-bold text-white mb-3">Verifique seu e-mail</h2>
            <p className="text-white/70 text-sm mb-6 leading-relaxed">
              Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha em breve.
            </p>
            <Link to="/login"
              className="block text-center bg-brand-orange text-white font-bold rounded-xl py-3 text-sm hover:opacity-90">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white mb-2">Esqueceu sua senha?</h2>
            <p className="text-white/65 text-sm mb-6">
              Digite seu e-mail e enviaremos um link para criar uma nova senha.
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">E-mail</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
                  placeholder="seu@email.com" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-brand-orange hover:opacity-90 disabled:opacity-60 text-white font-bold rounded-xl py-3 transition-opacity text-sm">
                {loading ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </form>

            <p className="text-center text-sm text-white/50 mt-6">
              <Link to="/login" className="hover:text-white">← Voltar ao login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
