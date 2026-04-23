import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

const PROFILE_URL = "https://functions.poehali.dev/64f1c298-8600-4d89-88fb-c05efe59fd40";

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
  user: AuthUser;
  token: string;
  onClose: () => void;
  onSave: (updated: AuthUser) => void;
}

export default function EditProfileModal({ user, token, onClose, onSave }: Props) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<{ b64: string; type: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Файл слишком большой (макс. 5 МБ)");
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      setAvatarPreview(result);
      // strip data url prefix
      const b64 = result.split(",")[1];
      setAvatarFile({ b64, type: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Имя не может быть пустым"); return; }
    setSaving(true);
    setError(null);

    try {
      let updatedUser = user;

      // 1. upload avatar if changed
      if (avatarFile) {
        const res = await fetch(`${PROFILE_URL}/avatar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": token,
          },
          body: JSON.stringify({ image: avatarFile.b64, content_type: avatarFile.type }),
        });
        const data = await res.json();
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (!res.ok) { setError(parsed.error || "Ошибка загрузки аватара"); setSaving(false); return; }
        updatedUser = parsed.user;
      }

      // 2. update name + bio
      const res = await fetch(`${PROFILE_URL}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": token,
        },
        body: JSON.stringify({ name: name.trim(), bio }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (!res.ok) { setError(parsed.error || "Ошибка сохранения"); setSaving(false); return; }

      onSave({ ...parsed.user, avatar_url: updatedUser.avatar_url });
    } catch {
      setError("Ошибка подключения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-md rounded-2xl overflow-hidden animate-fade-in"
        style={{
          background: "linear-gradient(135deg, rgba(10,15,40,0.98), rgba(15,10,35,0.98))",
          border: "1px solid rgba(0,191,255,0.3)",
          boxShadow: "0 0 60px rgba(0,80,255,0.2), 0 0 120px rgba(150,0,255,0.1)",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(0,191,255,0.12)" }}>
          <div>
            <h2 className="font-orbitron font-bold text-sm tracking-widest glow-text-blue">
              // РЕДАКТИРОВАТЬ ПРОФИЛЬ
            </h2>
            <p className="font-orbitron text-[10px] text-muted-foreground tracking-wider mt-0.5">
              NEXUS IDENTITY PROTOCOL
            </p>
          </div>
          <button onClick={onClose}
            className="text-muted-foreground hover:text-blue-300 transition-colors p-1">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <div className="holo-avatar w-20 h-20">
                <img
                  src={avatarPreview || user.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.6)" }}>
                <Icon name="Camera" size={20} className="text-cyan-400" />
              </div>
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()}
                className="neon-btn px-4 py-2 rounded-lg font-orbitron text-xs tracking-widest text-blue-300 transition-all block mb-1">
                <Icon name="Upload" size={12} className="inline mr-1.5" />
                ЗАГРУЗИТЬ ФОТО
              </button>
              <p className="font-ibm text-[11px] text-muted-foreground">JPG, PNG · макс. 5 МБ</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Name */}
          <div>
            <label className="font-orbitron text-[10px] tracking-widest text-cyan-400 mb-1.5 block">
              ИМЯ ПОЛЬЗОВАТЕЛЯ
            </label>
            <div className="relative">
              <Icon name="User" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={50}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg font-ibm text-sm outline-none transition-all"
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

          {/* Handle (readonly) */}
          <div>
            <label className="font-orbitron text-[10px] tracking-widest text-muted-foreground mb-1.5 block">
              НИКНЕЙМ (НЕЛЬЗЯ ИЗМЕНИТЬ)
            </label>
            <div className="relative">
              <Icon name="AtSign" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <div className="w-full pl-9 pr-4 py-2.5 rounded-lg font-ibm text-sm text-muted-foreground/60"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}>
                {user.handle}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="font-orbitron text-[10px] tracking-widest text-cyan-400 mb-1.5 block">
              БИО
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="// Расскажи о себе..."
              className="w-full px-4 py-2.5 rounded-lg font-ibm text-sm outline-none resize-none transition-all"
              style={{
                background: "rgba(0,191,255,0.05)",
                border: "1px solid rgba(0,191,255,0.2)",
                color: "hsl(var(--foreground))",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(0,191,255,0.6)")}
              onBlur={e => (e.target.style.borderColor = "rgba(0,191,255,0.2)")}
            />
            <div className="text-right font-orbitron text-[10px] text-muted-foreground mt-1">
              {bio.length}/300
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-2.5 rounded-lg font-ibm text-xs animate-fade-in"
              style={{ background: "rgba(255,30,80,0.1)", border: "1px solid rgba(255,30,80,0.4)", color: "#ff4d6d" }}>
              <Icon name="AlertCircle" size={12} className="inline mr-2" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-orbitron text-xs tracking-widest text-muted-foreground transition-all neon-btn">
              ОТМЕНА
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-orbitron text-xs tracking-widest transition-all"
              style={{
                background: saving
                  ? "rgba(0,100,255,0.2)"
                  : "linear-gradient(135deg, rgba(0,120,255,0.7), rgba(150,0,255,0.7))",
                border: "1px solid rgba(0,191,255,0.5)",
                color: "#e0f4ff",
                boxShadow: saving ? "none" : "0 0 20px rgba(0,191,255,0.25)",
              }}>
              {saving ? (
                <span className="animate-pulse">// СОХРАНЕНИЕ...</span>
              ) : (
                "// СОХРАНИТЬ //"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
