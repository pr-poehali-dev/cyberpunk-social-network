import { useState } from "react";
import Icon from "@/components/ui/icon";

const AVATAR_URL = "https://cdn.poehali.dev/projects/e3101b69-ea70-472c-90da-0df04c7ea68d/files/968dcd57-0329-4e54-8130-bca43699052e.jpg";
const BANNER_URL = "https://cdn.poehali.dev/projects/e3101b69-ea70-472c-90da-0df04c7ea68d/files/c698a86e-c01e-490e-9dcf-2a8cbd2120b8.jpg";

const USERS = [
  { id: 1, name: "NEXUS_X77", handle: "@nexus_x77", avatar: AVATAR_URL, status: "online" },
  { id: 2, name: "V0ID_RUNNER", handle: "@void_runner", avatar: AVATAR_URL, status: "ghost" },
  { id: 3, name: "AURORA_9", handle: "@aurora_9", avatar: AVATAR_URL, status: "online" },
];

const INITIAL_POSTS = [
  {
    id: 1,
    user: USERS[0],
    time: "2 мин назад",
    content: "Взломал матрицу корпоративного протокола. Данные в свободном доступе. Система не знает, что мы уже внутри. #NEXUS #HACK",
    likes: 342,
    comments: 87,
    reposts: 124,
    liked: false,
    tags: ["#NEXUS", "#HACK"],
    image: BANNER_URL,
    comments_list: [
      { id: 1, user: USERS[1], text: "Красиво. Чисто. Ни следа.", time: "1 мин" },
      { id: 2, user: USERS[2], text: "Ты легенда, NEXUS. Ждём координаты.", time: "30 сек" },
    ],
  },
  {
    id: 2,
    user: USERS[1],
    time: "18 мин назад",
    content: "Новый имплант нейроинтерфейса. Задержка 0.003мс. Реальность стала расширением кода. Ощущения не поддаются описанию.",
    likes: 218,
    comments: 54,
    reposts: 73,
    liked: false,
    tags: ["#AUGMENT", "#NEURO"],
    image: null,
    comments_list: [
      { id: 1, user: USERS[0], text: "Какой производитель? Icebreaker или PsyTech?", time: "15 мин" },
    ],
  },
  {
    id: 3,
    user: USERS[2],
    time: "1 ч назад",
    content: "Слои голограмм над городом сегодня особенно красивы. Реклама Arasaka перекрывает закат. Уродство и красота одновременно.",
    likes: 509,
    comments: 112,
    reposts: 234,
    liked: false,
    tags: ["#CITY", "#HOLO"],
    image: BANNER_URL,
    comments_list: [],
  },
];

const ACTIVITY = [
  { id: 1, icon: "Zap", color: "text-blue-400", text: "NEXUS_X77 взломал 3 новых узла", time: "только что" },
  { id: 2, icon: "Heart", color: "text-pink-400", text: "V0ID_RUNNER лайкнул твой пост", time: "2 мин" },
  { id: 3, icon: "MessageSquare", color: "text-purple-400", text: "AURORA_9 ответила на комментарий", time: "5 мин" },
  { id: 4, icon: "Share2", color: "text-cyan-400", text: "Твой пост репостнули 12 раз", time: "10 мин" },
  { id: 5, icon: "UserPlus", color: "text-green-400", text: "Новый подписчик: GHOST_//77", time: "15 мин" },
];

type Tab = "feed" | "profile";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [newPostText, setNewPostText] = useState("");

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLike = (postId: number) => {
    setPosts(p => p.map(post =>
      post.id === postId
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
    showNotification("// ЛАЙК ДОБАВЛЕН В БАЗУ //");
  };

  const handleAddComment = (postId: number) => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      user: USERS[0],
      text: newComment,
      time: "только что",
    };
    setPosts(p => p.map(post =>
      post.id === postId
        ? { ...post, comments_list: [...post.comments_list, comment], comments: post.comments + 1 }
        : post
    ));
    setNewComment("");
    showNotification("// КОММЕНТАРИЙ ОПУБЛИКОВАН //");
  };

  const handleNewPost = () => {
    if (!newPostText.trim()) return;
    const post = {
      id: Date.now(),
      user: USERS[0],
      time: "только что",
      content: newPostText,
      likes: 0,
      comments: 0,
      reposts: 0,
      liked: false,
      tags: [],
      image: null,
      comments_list: [],
    };
    setPosts(p => [post, ...p]);
    setNewPostText("");
    showNotification("// ПОСТ ОТПРАВЛЕН В СЕТЬ //");
  };

  return (
    <div className="min-h-screen grid-bg relative">
      {/* Ambient orbs */}
      <div className="fixed top-20 left-10 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #00bfff 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="fixed bottom-20 right-10 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #bf5fff 0%, transparent 70%)", filter: "blur(60px)" }} />

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg font-orbitron text-xs tracking-widest animate-fade-in"
          style={{
            background: "linear-gradient(135deg, rgba(0,191,255,0.2), rgba(191,95,255,0.2))",
            border: "1px solid rgba(0,191,255,0.6)",
            boxShadow: "0 0 20px rgba(0,191,255,0.4), 0 0 40px rgba(0,191,255,0.2)",
            color: "#00ffff",
          }}>
          <span className="notification-ping inline-block w-2 h-2 rounded-full bg-cyan-400 mr-2" />
          {notification}
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 px-6 py-3 flex items-center justify-between"
        style={{
          background: "rgba(5,8,25,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,191,255,0.15)",
        }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00bfff, #bf5fff)" }}>
            <span className="font-orbitron font-black text-sm" style={{ color: "#000" }}>N</span>
          </div>
          <span className="font-orbitron font-bold text-lg tracking-widest glow-text-blue">NEXUS</span>
          <span className="text-xs font-ibm opacity-40 tracking-wider hidden sm:block">// КИБЕРПРОСТРАНСТВО v2.077</span>
        </div>

        <nav className="flex gap-1">
          {(["feed", "profile"] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`neon-btn px-4 py-1.5 rounded-lg font-orbitron text-xs tracking-widest uppercase transition-all ${
                activeTab === tab ? "text-blue-300" : "text-muted-foreground"
              }`}
              style={activeTab === tab ? {
                borderColor: "rgba(0,191,255,0.6)",
                boxShadow: "0 0 15px rgba(0,191,255,0.3)",
              } : {}}>
              {tab === "feed" ? "// ЛЕНТА" : "// ПРОФИЛЬ"}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative notification-ping w-2 h-2 rounded-full bg-cyan-400" />
          <div className="holo-avatar w-8 h-8 cursor-pointer" onClick={() => setActiveTab("profile")}>
            <img src={AVATAR_URL} alt="me" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

        {/* ============ FEED TAB ============ */}
        {activeTab === "feed" && (
          <>
            {/* Activity sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="holo-card rounded-xl p-4 sticky top-20">
                <h3 className="font-orbitron text-xs tracking-widest text-cyan-400 mb-4">
                  // АКТИВНОСТЬ СЕТИ
                </h3>
                <div className="space-y-3">
                  {ACTIVITY.map((item, i) => (
                    <div key={item.id} className="flex gap-3 items-start animate-fade-in"
                      style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center"
                        style={{ background: "rgba(0,191,255,0.08)", border: "1px solid rgba(0,191,255,0.15)" }}>
                        <Icon name={item.icon} size={13} className={item.color} />
                      </div>
                      <div>
                        <p className="text-xs text-foreground/80 font-ibm leading-snug">{item.text}</p>
                        <p className="text-[10px] text-muted-foreground font-orbitron mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(0,191,255,0.1)" }}>
                  <h3 className="font-orbitron text-xs tracking-widest text-purple-400 mb-3">// ОНЛАЙН</h3>
                  <div className="flex gap-2">
                    {USERS.map(u => (
                      <div key={u.id} className="relative">
                        <div className="holo-avatar w-9 h-9">
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover rounded-full" />
                        </div>
                        {u.status === "online" && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-cyan-400 notification-ping"
                            style={{ border: "1.5px solid hsl(var(--background))" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Feed */}
            <div className="flex-1 space-y-4 min-w-0">
              {/* New post */}
              <div className="holo-card rounded-xl p-4 animate-fade-in">
                <div className="flex gap-3">
                  <div className="holo-avatar w-10 h-10 shrink-0">
                    <img src={AVATAR_URL} alt="me" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newPostText}
                      onChange={e => setNewPostText(e.target.value)}
                      placeholder="// Передать сообщение в сеть..."
                      rows={2}
                      className="w-full bg-transparent text-foreground/90 font-ibm text-sm resize-none outline-none placeholder:text-muted-foreground/50"
                    />
                    <div className="flex items-center justify-between mt-2 pt-2"
                      style={{ borderTop: "1px solid rgba(0,191,255,0.1)" }}>
                      <div className="flex gap-2">
                        <button className="neon-btn p-1.5 rounded-lg text-muted-foreground hover:text-blue-300 transition-colors">
                          <Icon name="Image" size={15} />
                        </button>
                        <button className="neon-btn p-1.5 rounded-lg text-muted-foreground hover:text-purple-400 transition-colors">
                          <Icon name="Hash" size={15} />
                        </button>
                      </div>
                      <button onClick={handleNewPost}
                        className="px-4 py-1.5 rounded-lg font-orbitron text-xs tracking-wider transition-all"
                        style={{
                          background: "linear-gradient(135deg, rgba(0,100,255,0.6), rgba(150,0,255,0.6))",
                          border: "1px solid rgba(0,191,255,0.5)",
                          color: "#e0f4ff",
                          boxShadow: newPostText ? "0 0 15px rgba(0,191,255,0.3)" : "none",
                        }}>
                        ОТПРАВИТЬ //
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts */}
              {posts.map((post, idx) => (
                <article key={post.id} className="holo-card rounded-xl overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}>
                  {/* Post header */}
                  <div className="p-4 flex items-start gap-3">
                    <div className="holo-avatar w-11 h-11 shrink-0">
                      <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-orbitron font-bold text-sm glow-text-blue">{post.user.name}</span>
                        <span className="text-xs text-muted-foreground font-ibm">{post.user.handle}</span>
                        {post.user.status === "online" && (
                          <span className="text-[9px] font-orbitron px-1.5 py-0.5 rounded tracking-widest"
                            style={{ background: "rgba(0,255,200,0.1)", color: "#00ffcc", border: "1px solid rgba(0,255,200,0.3)" }}>
                            ONLINE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-orbitron">{post.time}</p>
                    </div>
                    <button className="text-muted-foreground hover:text-blue-300 transition-colors">
                      <Icon name="MoreHorizontal" size={16} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-4 pb-3">
                    <p className="font-ibm text-sm text-foreground/90 leading-relaxed">{post.content}</p>
                    {post.tags.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-xs font-orbitron text-purple-400">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Image */}
                  {post.image && (
                    <div className="mx-4 mb-3 rounded-lg overflow-hidden scanline"
                      style={{ border: "1px solid rgba(0,191,255,0.2)" }}>
                      <img src={post.image} alt="" className="w-full h-48 object-cover" />
                      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #00bfff, #bf5fff, transparent)" }} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-4 pb-3 flex items-center gap-4"
                    style={{ borderTop: "1px solid rgba(0,191,255,0.08)" }}>
                    <div className="flex gap-4 pt-3 flex-1">
                      <button onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-orbitron transition-all ${
                          post.liked ? "text-pink-400" : "text-muted-foreground hover:text-pink-400"
                        }`}
                        style={post.liked ? { textShadow: "0 0 10px rgba(255,100,180,0.8)" } : {}}>
                        <Icon name="Heart" size={15} className={post.liked ? "fill-pink-400" : ""} />
                        {post.likes}
                      </button>
                      <button
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        className="flex items-center gap-1.5 text-xs font-orbitron text-muted-foreground hover:text-blue-300 transition-all">
                        <Icon name="MessageSquare" size={15} />
                        {post.comments}
                      </button>
                      <button
                        onClick={() => showNotification("// РЕПОСТ ДОБАВЛЕН //")}
                        className="flex items-center gap-1.5 text-xs font-orbitron text-muted-foreground hover:text-cyan-400 transition-all">
                        <Icon name="Repeat2" size={15} />
                        {post.reposts}
                      </button>
                    </div>
                    <button
                      onClick={() => showNotification("// СКОПИРОВАНО В БУФЕР //")}
                      className="pt-3 text-muted-foreground hover:text-purple-400 transition-colors">
                      <Icon name="Share" size={15} />
                    </button>
                  </div>

                  {/* Comments section */}
                  {expandedPost === post.id && (
                    <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid rgba(0,191,255,0.08)" }}>
                      <div className="pt-3 space-y-2 max-h-48 overflow-y-auto">
                        {post.comments_list.length === 0 && (
                          <p className="text-xs text-muted-foreground font-orbitron text-center py-2">
                            // НЕТ КОММЕНТАРИЕВ //
                          </p>
                        )}
                        {post.comments_list.map((c, ci) => (
                          <div key={c.id} className="flex gap-2 items-start animate-comment"
                            style={{ animationDelay: `${ci * 60}ms` }}>
                            <div className="holo-avatar w-7 h-7 shrink-0">
                              <img src={c.user.avatar} alt={c.user.name} className="w-full h-full object-cover rounded-full" />
                            </div>
                            <div className="flex-1 rounded-lg p-2 text-xs"
                              style={{
                                background: "rgba(0,191,255,0.05)",
                                border: "1px solid rgba(0,191,255,0.12)",
                              }}>
                              <span className="font-orbitron text-blue-300 mr-2">{c.user.name}</span>
                              <span className="font-ibm text-foreground/80">{c.text}</span>
                              <div className="text-[10px] text-muted-foreground font-orbitron mt-1">{c.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Comment input */}
                      <div className="flex gap-2 items-center">
                        <input
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleAddComment(post.id)}
                          placeholder="// Ввести ответ..."
                          className="flex-1 bg-transparent text-xs font-ibm outline-none placeholder:text-muted-foreground/50 px-3 py-2 rounded-lg"
                          style={{ background: "rgba(0,191,255,0.05)", border: "1px solid rgba(0,191,255,0.2)" }}
                        />
                        <button onClick={() => handleAddComment(post.id)}
                          className="p-2 rounded-lg transition-all hover:scale-105"
                          style={{
                            background: "linear-gradient(135deg, rgba(0,100,255,0.5), rgba(150,0,255,0.5))",
                            border: "1px solid rgba(0,191,255,0.4)",
                          }}>
                          <Icon name="Send" size={14} className="text-cyan-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}

        {/* ============ PROFILE TAB ============ */}
        {activeTab === "profile" && (
          <div className="flex-1 space-y-4 animate-fade-in">
            {/* Banner */}
            <div className="holo-card rounded-xl overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img src={BANNER_URL} alt="banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(5,8,25,0.95) 100%)" }} />
                <div className="absolute inset-0 scanline" />
                <div className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, #00bfff, #bf5fff, #00ffff, transparent)" }} />
              </div>

              <div className="px-6 pb-6 relative">
                <div className="flex items-end gap-4 -mt-12 mb-4 flex-wrap">
                  <div className="holo-avatar w-24 h-24 relative animate-float">
                    <img src={AVATAR_URL} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div className="pb-1">
                    <h1 className="font-orbitron font-black text-2xl glow-text-blue glitch-text" data-text="NEXUS_X77">
                      NEXUS_X77
                    </h1>
                    <p className="text-sm font-ibm text-muted-foreground">@nexus_x77</p>
                  </div>
                  <div className="ml-auto pb-1">
                    <button className="neon-btn px-5 py-2 rounded-lg font-orbitron text-xs tracking-widest text-blue-300 transition-all">
                      РЕДАКТИРОВАТЬ //
                    </button>
                  </div>
                </div>

                <p className="font-ibm text-sm text-foreground/80 leading-relaxed mb-4 max-w-lg">
                  Хакер. Нейронавт. Исследователь цифровой пустоши. Взламываю корпоративные узлы ради свободы данных.
                  <span className="text-blue-300"> #Ghost #Netrunner</span>
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "ПОСТЫ", value: "342" },
                    { label: "ПОДПИСЧИКИ", value: "12.4K" },
                    { label: "ПОДПИСКИ", value: "891" },
                    { label: "РЕЙТИНГ", value: "99.2" },
                  ].map((stat, i) => (
                    <div key={stat.label} className="text-center p-3 rounded-lg animate-fade-in"
                      style={{
                        animationDelay: `${i * 80}ms`,
                        background: "rgba(0,191,255,0.05)",
                        border: "1px solid rgba(0,191,255,0.15)",
                      }}>
                      <div className="font-orbitron font-black text-xl glow-text-blue">{stat.value}</div>
                      <div className="font-orbitron text-[9px] tracking-widest text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {["NETRUNNER LVL.77", "CORPO ENEMY", "DATA FREE", "GHOST PROTOCOL"].map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full font-orbitron text-[10px] tracking-widest text-purple-300"
                      style={{
                        background: "linear-gradient(135deg, rgba(0,100,255,0.15), rgba(150,0,255,0.15))",
                        border: "1px solid rgba(191,95,255,0.3)",
                      }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* User posts */}
            <div className="holo-card rounded-xl p-4">
              <h3 className="font-orbitron text-xs tracking-widest text-cyan-400 mb-4">// МОИ ПОСТЫ</h3>
              <div className="space-y-3">
                {posts.filter(p => p.user.id === 1).map((post, i) => (
                  <div key={post.id} className="p-3 rounded-lg animate-fade-in"
                    style={{
                      animationDelay: `${i * 100}ms`,
                      background: "rgba(0,191,255,0.04)",
                      border: "1px solid rgba(0,191,255,0.12)",
                    }}>
                    <p className="font-ibm text-sm text-foreground/80 mb-2">{post.content}</p>
                    <div className="flex gap-4 text-xs font-orbitron text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Heart" size={12} className="text-pink-400" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="MessageSquare" size={12} className="text-blue-300" /> {post.comments}
                      </span>
                      <span className="ml-auto">{post.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}