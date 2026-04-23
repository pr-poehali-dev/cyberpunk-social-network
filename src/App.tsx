
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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

function AppContent() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("nexus_token");
    if (!savedToken) { setChecking(false); return; }

    fetch(`${AUTH_URL}/me`, {
      headers: { "X-Session-Token": savedToken },
    })
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed.user) {
          setUser(parsed.user);
          setToken(savedToken);
        } else {
          localStorage.removeItem("nexus_token");
        }
      })
      .catch(() => localStorage.removeItem("nexus_token"))
      .finally(() => setChecking(false));
  }, []);

  const handleAuth = (authUser: AuthUser, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem("nexus_token", authToken);
  };

  const handleLogout = async () => {
    if (token) {
      await fetch(`${AUTH_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      }).catch(() => null);
    }
    localStorage.removeItem("nexus_token");
    setUser(null);
    setToken(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="font-orbitron text-xs tracking-widest text-cyan-400 animate-pulse">
          // ПОДКЛЮЧЕНИЕ К NEXUS...
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index currentUser={user} token={token} onLogout={handleLogout} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;