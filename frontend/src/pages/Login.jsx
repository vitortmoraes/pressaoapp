import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "E-mail ou senha incorretos.");
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

        <h2 className="text-xl font-bold text-white mb-6">Entrar na sua conta</h2>

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
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Senha</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-brand-orange hover:opacity-90 disabled:opacity-60 text-white font-bold rounded-xl py-3 transition-opacity text-sm">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-white/55 mt-4">
          <Link to="/forgot-password" className="hover:text-white">Esqueceu sua senha?</Link>
        </p>
        <p className="text-center text-sm text-white/50 mt-4">
          Não tem conta?{" "}
          <Link to="/register" className="text-brand-orange hover:underline font-semibold">
            Cadastre-se grátis
          </Link>
        </p>
        <p className="text-center text-sm text-white/50 mt-2">
          <Link to="/" className="hover:text-white">← Voltar ao início</Link>
        </p>
      </div>
    </div>
  );
}
