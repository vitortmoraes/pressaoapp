import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import Logo from "../components/Logo";

export default function ResetPassword() {
  const [searchParams]          = useSearchParams();
  const navigate                = useNavigate();
  const token                   = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 6)  { setError("A senha precisa ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Link inválido ou expirado. Solicite um novo.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 rounded-3xl w-full max-w-md p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-3">Link inválido</h2>
          <p className="text-white/50 text-sm mb-6">Este link de redefinição é inválido ou expirou.</p>
          <Link to="/forgot-password"
            className="block bg-brand-orange text-white font-bold rounded-xl py-3 text-sm hover:opacity-90">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 rounded-3xl w-full max-w-md p-8">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-white mb-3">Senha redefinida!</h2>
            <p className="text-white/65 text-sm mb-6">Você será redirecionado para o login em instantes...</p>
            <Link to="/login"
              className="block bg-brand-orange text-white font-bold rounded-xl py-3 text-sm hover:opacity-90">
              Ir para o login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white mb-2">Criar nova senha</h2>
            <p className="text-white/65 text-sm mb-6">Escolha uma senha segura com pelo menos 6 caracteres.</p>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nova senha</label>
                <input type="password" required maxLength={72} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
                  placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Confirmar nova senha</label>
                <input type="password" required maxLength={72} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
                  placeholder="Repita a nova senha" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-brand-orange hover:opacity-90 disabled:opacity-60 text-white font-bold rounded-xl py-3 transition-opacity text-sm">
                {loading ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
