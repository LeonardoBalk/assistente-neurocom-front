import React, { useState, useEffect, useRef, useCallback } from "react";
import "./chat.css";
import ReactMarkdown from "react-markdown";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
 /* estados */
  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState([]);
  const [token, setToken] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dots, setDots] = useState("");
  const [sessions, setSessions] = useState([]);      // sessões existentes
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* renomear sessão */
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");


  const getInitialTheme = () => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
    } catch {}
    return "light";
  };
  const [theme, setTheme] = useState(getInitialTheme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);
  const toggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  /* ===== Settings overlay ===== */
  const SETTINGS_KEY = "app_settings";
  const getInitialSettings = () => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        return {
          displayName: p.displayName || "Nome Usuário",
          email: p.email || "usuario@gmail.com",
          themePref: p.themePref || "auto",
          fontScale: p.fontScale || "100"
        };
      }
    } catch {}
    return {
      displayName: "Nome Usuário",
      email: "usuario@gmail.com",
      themePref: "auto",
      fontScale: "100"
    };
  };
  const [settings, setSettings] = useState(getInitialSettings);
  const updateSetting = (field, value) =>
    setSettings(prev => ({ ...prev, [field]: value }));

  /* Aplicar escala de fonte */
  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", settings.fontScale + "%");
  }, [settings.fontScale]);

  /* Forçar tema por preferência */
  useEffect(() => {
    if (settings.themePref === "light") setTheme("light");
    else if (settings.themePref === "dark") setTheme("dark");
    // auto => não força
  }, [settings.themePref]);

  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
  }, [settings]);

  const [showSettings, setShowSettings] = useState(false);
  const settingsTriggerRef = useRef(null);
  const drawerRef = useRef(null);

  const openSettings = (triggerEl) => {
    settingsTriggerRef.current = triggerEl || null;
    setShowSettings(true);
  };
  const closeSettings = () => {
    setShowSettings(false);
    requestAnimationFrame(() => settingsTriggerRef.current?.focus?.());
  };

  /* Focus trap & ESC */
  useEffect(() => {
    if (!showSettings) return;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeSettings();
      }
      if (e.key === "Tab") {
        const focusable = drawerRef.current?.querySelectorAll(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    const first = drawerRef.current?.querySelector("input, select, button");
    first?.focus?.();
    return () => window.removeEventListener("keydown", handleKey);
  }, [showSettings]);

  /* ===================== Login e carga inicial ===================== */
  useEffect(() => {
    const iniciar = async () => {
      try {
        setErrorMsg("");
        let savedToken = localStorage.getItem("token");
        if (!savedToken) {
          const res = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "usuario@teste.com", senha: "123456" })
          });
          const data = await res.json();
          if (data.token) {
            savedToken = data.token;
            localStorage.setItem("token", savedToken);
          } else {
            throw new Error(data.erro || "Falha no login");
          }
        }
        setToken(savedToken);
      } catch (err) {
        console.error("Erro login:", err);
        setErrorMsg("Falha ao autenticar.");
      }
    };
    iniciar();
  }, []);

  /* Carregar sessões quando token disponível */
  useEffect(() => {
    if (!token) return;
    fetchSessions();
  }, [token]);

  /* ===================== Fetch sessions ===================== */
  const fetchSessions = useCallback(async () => {
    if (!token) return;
    setLoadingSessions(true);
    try {
      setErrorMsg("");
      const res = await fetch(`${BACKEND_URL}/sessoes`, {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      if (data.sessoes) {
        setSessions(data.sessoes);
        if (data.sessoes.length > 0) {
          // seleciona a primeira (mais recente)
            setCurrentSessionId(prev => prev || data.sessoes[0].id);
        } else {
          // cria uma nova sessão automaticamente
          await handleNewChat(true);
        }
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error("Erro carregando sessões:", err);
      setErrorMsg("Erro ao carregar sessões.");
    } finally {
      setLoadingSessions(false);
    }
  }, [token]);

  /* ===================== Carrega histórico da sessão ativa ===================== */
  useEffect(() => {
    if (!token || !currentSessionId) return;
    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        setErrorMsg("");
        const res = await fetch(`${BACKEND_URL}/chat-historico/${currentSessionId}`, {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        if (data.mensagens) {
          const formatado = data.mensagens.flatMap(m => [
            { remetente: "usuario", texto: m.pergunta },
            { remetente: "bot", texto: m.resposta }
          ]);
          setHistorico(formatado);
        } else {
          setHistorico([]);
        }
      } catch (err) {
        console.error("Erro histórico:", err);
        setErrorMsg("Erro ao carregar histórico.");
        setHistorico([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [token, currentSessionId]);

  /* ===================== Animação digitação ===================== */
  useEffect(() => {
    if (!isTyping) return;
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, [isTyping]);

  /* ===================== Enviar mensagem ===================== */
  const enviarMensagem = async () => {
    if (!mensagem.trim() || !token) return;
    if (sending) return;

    const userMsg = { remetente: "usuario", texto: mensagem };
    setHistorico(prev => [...prev, userMsg]);
    const mensagemAtual = mensagem;
    setMensagem("");
    setIsTyping(true);
    setSending(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${BACKEND_URL}/chat-rag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ mensagem: mensagemAtual, sessionId: currentSessionId })
      });
      const data = await res.json();

      if (data.erro) {
        throw new Error(data.erro);
      }

      // Se backend criou nova sessão
      if (data.sessionId && data.sessionId !== currentSessionId) {
        setCurrentSessionId(data.sessionId);
        // Recarregar sessões (para aparecer a nova)
        fetchSessions();
      }

      const botMsg = { remetente: "bot", texto: data.resposta || "(Sem resposta)" };
      setHistorico(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Erro no chat-rag:", err);
      setErrorMsg("Erro ao enviar mensagem.");
      const botMsg = { remetente: "bot", texto: "Erro ao processar a pergunta." };
      setHistorico(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
      setDots("");
      setSending(false);
    }
  };

  /* ===================== Novo Chat ===================== */
  const handleNewChat = async (silent = false) => {
    if (!token) return;
    try {
      if (!silent) setLoadingSessions(true);
      const res = await fetch(`${BACKEND_URL}/sessoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.sessao) {
        setSessions(prev => [data.sessao, ...prev]);
        setCurrentSessionId(data.sessao.id);
        setHistorico([]);
      } else {
        throw new Error("Não foi possível criar sessão");
      }
    } catch (err) {
      console.error("Erro criando sessão:", err);
      setErrorMsg("Erro ao criar novo chat.");
    } finally {
      if (!silent) setLoadingSessions(false);
    }
  };

  /* ===================== Selecionar Chat ===================== */
  const handleSelectSession = (id) => {
    if (id === currentSessionId) return;
    setCurrentSessionId(id);
    setHistorico([]);
  };

  /* ===================== Renomear sessão ===================== */
  const startRename = (sessao) => {
    setEditingSessionId(sessao.id);
    setEditingTitleValue(sessao.titulo || "");
  };

  const commitRename = async () => {
    const id = editingSessionId;
    if (!id) return;
    const newTitle = editingTitleValue.trim();
    setEditingSessionId(null);
    if (!newTitle) return;

    try {
      const res = await fetch(`${BACKEND_URL}/sessoes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ titulo: newTitle })
      });
      const data = await res.json();
      if (data.sessao) {
        setSessions(prev =>
          prev.map(s => (s.id === id ? { ...s, titulo: data.sessao.titulo } : s))
        );
      }
    } catch (err) {
      console.error("Erro renomeando sessão:", err);
      setErrorMsg("Falha ao renomear.");
    }
  };

  /* ===================== Limpar conversas (local) ===================== */
  const limparConversas = () => {
    setHistorico([]);
    // Se quiser realmente limpar no backend, seria necessário implementar rota DELETE:
    // DELETE /historico/:sessionId (não implementada ainda)
  };

  /* ===================== Logout ===================== */
  const logout = () => {
    try {
      localStorage.removeItem("token");
      setToken("");
      setHistorico([]);
      setSessions([]);
      setCurrentSessionId(null);
      window.location.href = "/login";
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div>
          <div className="logo">Neurocom</div>
          

          <input type="text" placeholder="Pesquisar" className="search" disabled />

          <nav className="menu" aria-label="Navegação">
            <a href="/sobre">Sobre</a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); limparConversas(); }}
            >
              Limpar conversas (local)
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openSettings(e.currentTarget);
              }}
            >
              Configurações
            </a>
            <a href="#" onClick={(e)=>{ e.preventDefault(); logout(); }}>Sair</a>
          </nav>
        </div>

        <div className="user-box">
          <div className="user-info">
            <img
              src="https://static.vecteezy.com/ti/vetor-gratis/p1/9292244-default-avatar-icon-vector-of-social-media-user-vetor.jpg"
              alt="avatar"
              className="avatar"
            />
            <div className="user-text">
              <span className="user-name">{settings.displayName}</span>
              <span className="user-email">{settings.email}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="content">
          <section className="chat-area" aria-label="Área de mensagens">
            {loadingHistory && (
              <div className="msg-bot">
                Carregando histórico...
              </div>
            )}
            {historico.map((msg, idx) => (
              <div
                key={idx}
                className={msg.remetente === "usuario" ? "msg-usuario" : "msg-bot"}
              >
                <ReactMarkdown>{msg.texto}</ReactMarkdown>
              </div>
            ))}
            {isTyping && <div className="msg-bot">..{dots}</div>}
            {errorMsg && (
              <div className="msg-bot error">
                {errorMsg}
              </div>
            )}
          </section>

          <aside className="chat-sidebar" aria-label="Lista de conversas">
            <button className="new-chat" onClick={() => handleNewChat()}>
              + Novo chat
            </button>
            <div className="chat-title">
              {loadingSessions ? "Carregando..." : "Seus chats"}
            </div>
            <ul className="chat-list">
              {sessions.map(sessao => {
                const active = sessao.id === currentSessionId;
                return (
                  <li
                    key={sessao.id}
                    className={active ? "active" : ""}
                    onClick={() => handleSelectSession(sessao.id)}
                    onDoubleClick={() => startRename(sessao)}
                    title="Duplo clique para renomear"
                    style={{ position: "relative" }}
                  >
                    {editingSessionId === sessao.id ? (
                      <input
                        autoFocus
                        value={editingTitleValue}
                        onChange={(e) => setEditingTitleValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            commitRename();
                          } else if (e.key === "Escape") {
                            setEditingSessionId(null);
                          }
                        }}
                        style={{
                          width: "100%",
                          fontSize: "0.8rem",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          padding: "4px 6px"
                        }}
                      />
                    ) : (
                      <>
                        <span style={{ fontWeight: active ? 600 : 500 }}>
                          {sessao.titulo
                            ? sessao.titulo
                            : "(Sem título)"}
                        </span>
                      </>
                    )}
                    {/* Pode adicionar data/hora depois */}
                  </li>
                );
              })}
              {sessions.length === 0 && !loadingSessions && (
                <li style={{ opacity: 0.6 }}>
                  Nenhum chat ainda.
                </li>
              )}
            </ul>
          </aside>
        </div>

        <footer className="footer">
          <input
            className="input"
            placeholder={sending ? "Enviando..." : "Escreva..."}
            value={mensagem}
            disabled={sending}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") enviarMensagem();
            }}
          />
          <button onClick={enviarMensagem} disabled={sending}>
            {sending ? "..." : "Enviar"}
          </button>
        </footer>
      </main>

      {showSettings && (
        <div
          className="settings-overlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeSettings();
          }}
        >
          <div
            className="settings-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settingsTitle"
            ref={drawerRef}
          >
            <header className="settings-drawer-header">
              <h1 id="settingsTitle">Configurações</h1>
              <button
                className="settings-close-btn"
                onClick={closeSettings}
                aria-label="Fechar painel de configurações"
              >
                ✕
              </button>
            </header>

            <div className="settings-drawer-content">
              <section className="settings-block">
                <h2>Perfil</h2>
                <label className="settings-field">
                  <span>Nome</span>
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => updateSetting("displayName", e.target.value)}
                    placeholder="Seu nome"
                  />
                </label>
                <label className="settings-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting("email", e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </label>
              </section>

              <section className="settings-block">
                <h2>Aparência</h2>
                <label className="settings-field">
                  <span>Tema</span>
                  <select
                    value={settings.themePref}
                    onChange={(e) => updateSetting("themePref", e.target.value)}
                  >
                    <option value="auto">Auto / Manual</option>
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                  </select>
                </label>
                <label className="settings-field">
                  <span>Fonte</span>
                  <select
                    value={settings.fontScale}
                    onChange={(e) => updateSetting("fontScale", e.target.value)}
                  >
                    <option value="90">90%</option>
                    <option value="100">100%</option>
                    <option value="110">110%</option>
                    <option value="120">120%</option>
                  </select>
                </label>
              </section>

              <section className="settings-block">
                <h2>Sessão</h2>
                <button
                  type="button"
                  className="secondary-btn settings-inline-btn"
                  onClick={logout}
                >
                  Logout
                </button>
              </section>
            </div>

            <footer className="settings-drawer-footer">
              <button
                type="button"
                className="outline-btn"
                onClick={closeSettings}
              >
                Fechar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}