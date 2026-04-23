import { useState } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/ee84af09-1e7f-4b93-8990-63c5bf396ca6";

interface AuthUser {
  id: number;
  name: string;
  handle: string;
  avatar_url: string;
  bio: string;
  status: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
  rating: number;
  tags: string[];
}

interface Props {
  onAuth: (user: AuthUser, token: string) => void;
}

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const body: Record<string, string> = { action: mode, handle, password };
      if (mode === "register") body.name = name;

      const res = await fetch(`${AUTH_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;

      if (!res.ok) {
        setError(parsed.error || "Ошибка сервера");
      } else {
        onAuth(parsed.user, parsed.token);
      }
    } catch {
      setError("Ошибка подключения к сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,100,255,0.12) 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(150,0,255,0.12) 0%, transparent 70%)", filter: "blur(80px)" }} />

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none scanline opacity-30" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-float"
            style={{ background: "linear-gradient(135deg, #00bfff, #bf5fff)", boxShadow: "0 0 40px rgba(0,191,255,0.4)" }}>
            <span className="font-orbitron font-black text-2xl text-black">N</span>
          </div>
          <h1 className="font-orbitron font-black text-4xl tracking-widest glow-text-blue mb-1">NEXUS</h1>
          <p className="font-orbitron text-xs tracking-[0.3em] text-muted-foreground">
            // КИБЕРПРОСТРАНСТВО v2.077
          </p>
        </div>

        {/* Card */}
        <div className="holo-card rounded-2xl p-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
          {/* Tabs */}
          <div className="flex mb-8 rounded-xl overflow-hidden"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,191,255,0.15)" }}>
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); }}
                className="flex-1 py-2.5 font-orbitron text-xs tracking-widest transition-all"
                style={mode === m ? {
                  background: "linear-gradient(135deg, rgba(0,100,255,0.4), rgba(150,0,255,0.4))",
                  color: "#00bfff",
                  boxShadow: "0 0 15px rgba(0,191,255,0.2)",
                } : { color: "hsl(var(--muted-foreground))" }}>
                {m === "login" ? "// ВХОД" : "// РЕГИСТРАЦИЯ"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Name — only register */}
            {mode === "register" && (
              <div className="animate-fade-in">
                <label className="font-orbitron text-[10px] tracking-widest text-cyan-400 mb-1.5 block">
                  ИМЯ ПОЛЬЗОВАТЕЛЯ
                </label>
                <div className="relative">
                  <Icon name="User" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="NEXUS_X77"
                    className="w-full pl-9 pr-4 py-3 rounded-lg font-ibm text-sm outline-none transition-all"
                    style={{
                      background: "rgba(0,191,255,0.05)",
                      border: "1px solid rgba(0,191,255,0.2)",
                      color: "hsl(var(--foreground))",
                    }}
                    onFocus={e => (e.target.style.borderColor = "rgba(0,191,255,0.6)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(0,191,255,0.2)")}
                  />
                </div>
              </div>
            )}

            {/* Handle */}
            <div>
              <label className="font-orbitron text-[10px] tracking-widest text-cyan-400 mb-1.5 block">
                НИКНЕЙМ
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-orbitron text-sm text-muted-foreground">@</span>
                <input
                  value={handle}
                  onChange={e => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  placeholder="nexus_x77"
                  className="w-full pl-8 pr-4 py-3 rounded-lg font-ibm text-sm outline-none transition-all"
                  style={{
                    background: "rgba(0,191,255,0.05)",
                    border: "1px solid rgba(0,191,255,0.2)",
                    color: "hsl(var(--foreground))",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(0,191,255,0.6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(0,191,255,0.2)")}
                  onKeyDown={e => e.key === "Enter" && submit()}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="font-orbitron text-[10px] tracking-widest text-cyan-400 mb-1.5 block">
                ПАРОЛЬ
              </label>
              <div className="relative">
                <Icon name="Lock" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 rounded-lg font-ibm text-sm outline-none transition-all"
                  style={{
                    background: "rgba(0,191,255,0.05)",
                    border: "1px solid rgba(0,191,255,0.2)",
                    color: "hsl(var(--foreground))",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(0,191,255,0.6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(0,191,255,0.2)")}
                  onKeyDown={e => e.key === "Enter" && submit()}
                />
                <button onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-300 transition-colors">
                  <Icon name={showPass ? "EyeOff" : "Eye"} size={14} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="animate-fade-in px-4 py-3 rounded-lg font-orbitron text-xs tracking-wide"
                style={{
                  background: "rgba(255,30,80,0.1)",
                  border: "1px solid rgba(255,30,80,0.4)",
                  color: "#ff4d6d",
                }}>
                <Icon name="AlertCircle" size={12} className="inline mr-2" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button onClick={submit} disabled={loading}
              className="w-full py-3 rounded-xl font-orbitron text-sm tracking-widest transition-all mt-2 relative overflow-hidden"
              style={{
                background: loading
                  ? "rgba(0,100,255,0.2)"
                  : "linear-gradient(135deg, rgba(0,120,255,0.7), rgba(150,0,255,0.7))",
                border: "1px solid rgba(0,191,255,0.5)",
                color: "#e0f4ff",
                boxShadow: loading ? "none" : "0 0 25px rgba(0,191,255,0.3)",
              }}>
              {loading ? (
                <span className="animate-pulse">// АВТОРИЗАЦИЯ...</span>
              ) : (
                mode === "login" ? "// ВОЙТИ В СИСТЕМУ //" : "// СОЗДАТЬ ПРОФИЛЬ //"
              )}
            </button>
          </div>

          {/* Divider hint */}
          <div className="mt-6 text-center">
            <p className="font-ibm text-xs text-muted-foreground">
              {mode === "login" ? "Нет аккаунта? " : "Уже в системе? "}
              <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
                className="font-orbitron text-[11px] text-blue-300 hover:text-cyan-400 transition-colors tracking-wide">
                {mode === "login" ? "Регистрация //" : "Войти //"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 font-orbitron text-[10px] tracking-widest text-muted-foreground/40 animate-fade-in"
          style={{ animationDelay: "200ms" }}>
          // NEXUS NETWORK · ENCRYPTED · 2077 //
        </p>
      </div>
    </div>
  );
}
