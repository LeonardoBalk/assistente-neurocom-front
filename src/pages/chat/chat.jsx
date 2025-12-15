import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from "react";
import "./chat.css";
import ReactMarkdown from "react-markdown";
import TypewriterText from "./TypewriterText";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  /* ================== ESTADOS PRINCIPAIS ================== */
  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState([]);
  const [token, setToken] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dots, setDots] = useState("");
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [typingMessageIdx, setTypingMessageIdx] = useState(null);

  /* Estados para Agentes Noesis */
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loadingAgents, setLoadingAgents] = useState(false);

  /* Renomear sessão */
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");

  /* Seleção / exclusão múltipla */
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState("");

  /* Pesquisa sessões */
  const [sessionSearch, setSessionSearch] = useState("");
  const searchInputRef = useRef(null);

  /* Tema / Configurações */
  const SETTINGS_KEY = "app_settings";
  const getInitialTheme = () => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
    } catch { }
    return "light";
  };
  const [theme, setTheme] = useState(getInitialTheme());

  const [userInfo, setUserInfo] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("userInfo");
      if (raw) setUserInfo(JSON.parse(raw));
    } catch { }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("theme", theme);
    } catch { }
  }, [theme]);

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
    } catch { }
    return {
      displayName: "Nome Usuário",
      email: "usuario@gmail.com",
      themePref: "auto",
      fontScale: "100"
    };
  };
  const [settings, setSettings] = useState(getInitialSettings);
  const updateSetting = (field, value) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-scale",
      settings.fontScale + "%"
    );
  }, [settings.fontScale]);

  useEffect(() => {
    if (settings.themePref === "light") setTheme("light");
    else if (settings.themePref === "dark") setTheme("dark");
  }, [settings.themePref]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch { }
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

  /* ======= Estados de colapso de navegações ======= */
  const getInitialBool = (k, def = true) => {
    try {
      const v = localStorage.getItem(k);
      if (v === "true") return true;
      if (v === "false") return false;
    } catch { }
    return def;
  };
  const [showLeftNav, setShowLeftNav] = useState(() =>
    getInitialBool("ui_show_left_nav", true)
  );
  const [showSessionsNav, setShowSessionsNav] = useState(() =>
    getInitialBool("ui_show_sessions_nav", true)
  );
  useEffect(() => {
    try {
      localStorage.setItem("ui_show_left_nav", String(showLeftNav));
      localStorage.setItem("ui_show_sessions_nav", String(showSessionsNav));
    } catch { }
  }, [showLeftNav, showSessionsNav]);

  /* ======= Login inicial ======= */
  useEffect(() => {
    const iniciar = async () => {
      try {
        setErrorMsg("");
        let savedToken = localStorage.getItem("token");
        if (!savedToken) {
          const res = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "usuario@teste.com",
              senha: "123456"
            })
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

  /* ======= Carregar sessões ======= */
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
          setCurrentSessionId((prev) => prev || data.sessoes[0].id);
        } else {
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

  useEffect(() => {
    if (!token) return;
    fetchSessions();
  }, [token, fetchSessions]);

  /* ======= Carregar Agentes Noesis ======= */
  useEffect(() => {
    const fetchAgents = async () => {
      setLoadingAgents(true);
      try {
        const res = await fetch(`${BACKEND_URL}/chat/agents`);
        const data = await res.json();
        if (data.agents) {
          setAgents(data.agents);
        }
      } catch (err) {
        console.error("Erro carregando agentes:", err);
      } finally {
        setLoadingAgents(false);
      }
    };
    fetchAgents();
  }, []);

  /* Handler para selecionar agente */
  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
  };

  /* Handler para criar novo chat e selecionar agente */
  const handleStartWithAgent = async (agent) => {
    setSelectedAgent(agent);
    await handleNewChat();
  };

  /* ======= Histórico da sessão ativa ======= */
  useEffect(() => {
    if (!token || !currentSessionId) return;
    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        setErrorMsg("");
        const res = await fetch(
          `${BACKEND_URL}/chat-historico/${currentSessionId}`,
          {
            headers: { Authorization: "Bearer " + token }
          }
        );
        const data = await res.json();
        if (data.mensagens) {
          const formatado = data.mensagens.flatMap((m) => [
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

  /* ======= Animação typing ======= */
  useEffect(() => {
    if (!isTyping) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, [isTyping]);

  /* ======= Posição dialógica (detecção automática; só exibição) ======= */
  const [posicao, setPosicao] = useState("TU");

  /* ======= Scroll & focus helpers ======= */
  const messagesEndRef = useRef(null);
  const chatAreaRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollToBottom = (smooth = true) => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end"
    });
  };
  useEffect(() => {
    scrollToBottom(false);
  }, [currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [historico, isTyping]);

  useEffect(() => {
    const el = chatAreaRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight > 120) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* ======= Enviar mensagem ======= */
  const enviarMensagem = async () => {
    if (!mensagem.trim() || !token || sending) return;

    const userMsg = { remetente: "usuario", texto: mensagem };
    setHistorico((prev) => [...prev, userMsg]);
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
        body: JSON.stringify({
          mensagem: mensagemAtual,
          sessionId: currentSessionId,
          agentId: selectedAgent?.id || null
        })
      });
      const data = await res.json();
      if (data.erro) throw new Error(data.erro);

      if (typeof data.user_position === "string") {
        setPosicao(data.user_position.toUpperCase());
      }

      if (data.sessionId && data.sessionId !== currentSessionId) {
        setCurrentSessionId(data.sessionId);
        fetchSessions();
      }

      const botMsg = {
        remetente: "bot",
        texto: data.resposta || "(Sem resposta)"
      };
      setHistorico((prev) => {
        setTypingMessageIdx(prev.length);
        return [...prev, botMsg];
      });
    } catch (err) {
      console.error("Erro no chat-rag:", err);
      setErrorMsg("Erro ao enviar mensagem.");
      const botMsg = {
        remetente: "bot",
        texto: "Erro ao processar a pergunta."
      };
      setHistorico((prev) => {
        setTypingMessageIdx(prev.length);
        return [...prev, botMsg];
      });
    } finally {
      setIsTyping(false);
      setDots("");
      setSending(false);
    }
  };

  /* ======= Nova sessão ======= */
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
        setSessions((prev) => [data.sessao, ...prev]);
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

  /* ======= Selecionar sessão ======= */
  const handleSelectSession = (id) => {
    if (selectionMode) {
      toggleSelect(id);
      return;
    }
    if (id === currentSessionId) return;
    setCurrentSessionId(id);
    setHistorico([]);
  };

  /* ======= Renomear sessão ======= */
  const startRename = (sessao) => {
    if (selectionMode) return;
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
        setSessions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, titulo: data.sessao.titulo } : s))
        );
      }
    } catch (err) {
      console.error("Erro renomeando sessão:", err);
      setErrorMsg("Falha ao renomear.");
    }
  };

  /* ======= Logout ======= */
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

  /* ======= Pesquisa / Listagem Sessions ======= */
  const normalizedSessions = useMemo(
    () =>
      sessions.map((s) => ({
        ...s,
        _tituloExibicao:
          s.titulo && s.titulo.trim() ? s.titulo : "(Sem título)"
      })),
    [sessions]
  );
  const filteredSessions = useMemo(() => {
    const q = sessionSearch.trim().toLowerCase();
    if (!q) return normalizedSessions;
    return normalizedSessions.filter((s) =>
      s._tituloExibicao.toLowerCase().includes(q)
    );
  }, [sessionSearch, normalizedSessions]);

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  const highlightTitle = (title) => {
    const q = sessionSearch.trim();
    if (!q) return title;
    const regex = new RegExp(`(${escapeRegExp(q)})`, "ig");
    const parts = title.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="hl">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
  const clearSearch = () => {
    setSessionSearch("");
    searchInputRef.current?.focus();
  };

  /* ======= Seleção múltipla ======= */
  const toggleSelectionMode = () => {
    if (selectionMode) setSelectedSessions(new Set());
    setSelectionMode((m) => !m);
  };
  const toggleSelect = (id) => {
    setSelectedSessions((prev) => {
      const ns = new Set(prev);
      if (ns.has(id)) ns.delete(id);
      else ns.add(id);
      return ns;
    });
  };
  const selectAllFiltered = () =>
    setSelectedSessions(new Set(filteredSessions.map((s) => s.id)));
  const clearSelected = () => setSelectedSessions(new Set());
  const isAllFilteredSelected =
    filteredSessions.length > 0 &&
    filteredSessions.every((s) => selectedSessions.has(s.id));

  const handleDeleteSelected = async () => {
    if (selectedSessions.size === 0) return;
    if (
      !window.confirm(
        `Apagar ${selectedSessions.size} conversa(s)? Isso não pode ser desfeito.`
      )
    )
      return;
    setDeleting(true);
    setDeleteFeedback("");
    try {
      for (const id of selectedSessions) {
        await fetch(`${BACKEND_URL}/sessoes/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token
          }
        }).catch(() => { });
      }
      await fetchSessions();
      if (selectedSessions.has(currentSessionId)) {
        setCurrentSessionId(null);
        setHistorico([]);
      }
      setSelectedSessions(new Set());
      setDeleteFeedback("Conversas apagadas.");
    } catch (err) {
      console.error("Erro apagando sessões:", err);
      setDeleteFeedback("Falha ao apagar algumas conversas.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSingle = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Apagar esta conversa?")) return;
    try {
      await fetch(`${BACKEND_URL}/sessoes/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });
      if (id === currentSessionId) {
        setCurrentSessionId(null);
        setHistorico([]);
      }
      await fetchSessions();
    } catch (err) {
      console.error("Erro apagando conversa:", err);
      setErrorMsg("Falha ao apagar conversa.");
    }
  };

  /* =========== Input moderno (textarea auto size) =========== */
  const textareaRef = useRef(null);
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(260, ta.scrollHeight) + "px";
  }, [mensagem]);

  const handleTextareaKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  /* ======= Funções utilitárias de mensagem ======= */
  const copyToClipboard = (texto) => {
    try {
      navigator.clipboard.writeText(texto);
    } catch { }
  };

  const regenerateLast = async () => {
    // (Opcional) exemplo simples: pega última pergunta do usuário e reenvia
    const lastUser = [...historico]
      .reverse()
      .find((m) => m.remetente === "usuario");
    if (lastUser) {
      setMensagem(lastUser.texto);
      setTimeout(() => enviarMensagem(), 50);
    }
  };

  /* ======= Barra superior estilo ChatGPT ======= */
  const toggleThemeQuick = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={`app modern-shell ${!showLeftNav ? "hide-left" : ""} ${!showSessionsNav ? "hide-sessions" : ""
        }`}
    >
      {/* ============ LEFT SIDEBAR ============ */}
      <aside
        className={`sidebar left-nav ${showLeftNav ? "expanded" : "collapsed"
          }`}
      >
        <div className="sidebar-inner">
          <div className="left-top-head">
            <div className="brand-row">
              <button
                className="collapse-btn"
                title={showLeftNav ? "Recolher" : "Expandir"}
                onClick={() => setShowLeftNav((v) => !v)}
                aria-label="Alternar navegação esquerda"
              >
                {showLeftNav ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                )}
              </button>
              {showLeftNav && (
                <img
                  src="https://i.imgur.com/knLE8C5.png"
                  alt="Neurocom"
                  className="neurocom-logo"
                />
              )}
            </div>
            {showLeftNav && (
              <div className="search-wrapper">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Pesquisar chats..."
                  className="search"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  aria-label="Pesquisar chats"
                />
                {sessionSearch && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={clearSearch}
                    aria-label="Limpar pesquisa"
                    title="Limpar"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            )}

            {showLeftNav && sessionSearch && (
              <div className="search-feedback" aria-live="polite">
                {filteredSessions.length === 0
                  ? "Nenhum resultado."
                  : `${filteredSessions.length} resultado${filteredSessions.length > 1 ? "s" : ""
                  }`}
              </div>
            )}
          </div>

          {showLeftNav && (
            <nav className="menu" aria-label="Navegação principal">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openSettings(e.currentTarget);
                }}
              >
                Configurações
              </a>
              <a target="_blank" href="/sobre" rel="noopener noreferrer">
                Sobre
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
              >
                Sair
              </a>
            </nav>
          )}

          <div className="user-box">
            <div className="user-info">
              <img
                src="https://static.vecteezy.com/ti/vetor-gratis/p1/9292244-default-avatar-icon-vector-of-social-media-user-vetor.jpg"
                alt="avatar"
                className="avatar"
              />
              {showLeftNav && (
                <div className="user-text">
                  <span className="user-name">
                    {userInfo?.nome || settings.displayName || "Usuário"}
                  </span>
                  <span className="user-email">
                    {userInfo?.email || settings.email || "sem-email"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ============ MAIN AREA ============ */}
      <main className="main">
        {/* Top Toolbar */}
        <header className="top-bar">
          <div className="top-left-group">
            <button
              className="ghost-btn"
              onClick={() => setShowLeftNav((v) => !v)}
              title={showLeftNav ? "Ocultar menu" : "Mostrar menu"}
              aria-label="Alternar sidebar esquerda"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button
              className="ghost-btn"
              onClick={() => setShowSessionsNav((v) => !v)}
              title={showSessionsNav ? "Ocultar lista de conversas" : "Mostrar lista de conversas"}
              aria-label="Alternar lista de conversas"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            </button>
            <button
              className="ghost-btn"
              onClick={() => handleNewChat()}
              disabled={selectionMode || sending}
              title="Novo chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              <span style={{ marginLeft: '6px' }}>Novo chat</span>
            </button>
          </div>
          <div className="top-center">
            <h1 className="chat-title-main">
              {sessions.find((s) => s.id === currentSessionId)?.titulo ||
                "Chat"}
            </h1>
          </div>
          <div className="top-right-group">
            <button
              className="ghost-btn"
              onClick={toggleThemeQuick}
              title="Alternar tema rápido"
            >
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" /></svg>
              )}
            </button>
            <button
              className="ghost-btn"
              onClick={() => openSettings()}
              title="Configurações"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
            </button>
          </div>
        </header>

        <div className="content modern-layout">
          <section
            className="chat-area modern-chat"
            aria-label="Área de mensagens"
            ref={chatAreaRef}
          >
            {loadingHistory && (
              <div className="msg-system">Carregando histórico...</div>
            )}

            {/* Tela de boas-vindas IA Noesis */}
            {!loadingHistory && historico.length === 0 && (
              <div className="welcome-noesis">
                <div className="noesis-avatar">
                  <img
                    src="https://i.imgur.com/lvJTfiM.png"
                    alt="IA Noesis"
                    className="noesis-avatar-img"
                  />
                </div>
                <h1 className="noesis-title">IA Noesis</h1>
                <p className="noesis-subtitle">
                  {selectedAgent
                    ? `Agente ${selectedAgent.name} ativo. Como posso te ajudar?`
                    : "Qual agente você quer ativar hoje?"}
                </p>

                {!selectedAgent && (
                  <div className="agents-grid">
                    {loadingAgents ? (
                      <div className="loading-agents">Carregando agentes...</div>
                    ) : (
                      agents.map((agent) => (
                        <button
                          key={agent.id}
                          className="agent-card"
                          onClick={() => handleStartWithAgent(agent)}
                        >
                          <span className="agent-icon">{agent.icon}</span>
                          <span className="agent-name">{agent.name}</span>
                          <span className="agent-description">{agent.description}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {selectedAgent && (
                  <div className="selected-agent-section">
                    <div className="selected-agent-badge">
                      <span className="agent-icon">{selectedAgent.icon}</span>
                      <span>{selectedAgent.name}</span>
                      <button
                        className="clear-agent-btn"
                        onClick={() => setSelectedAgent(null)}
                        title="Trocar agente"
                      >
                        ✕
                      </button>
                    </div>

                    {selectedAgent.starters && selectedAgent.starters.length > 0 && (
                      <div className="starters-section">
                        <p className="starters-label">Comece por:</p>
                        <div className="starters-grid">
                          {selectedAgent.starters.map((starter, idx) => (
                            <button
                              key={idx}
                              className="starter-btn"
                              onClick={() => {
                                setMensagem(starter);
                              }}
                            >
                              {starter}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {historico.map((msg, idx) => {
              const isUser = msg.remetente === "usuario";
              return (
                <div
                  key={idx}
                  className={`chat-msg-row ${isUser ? "user" : "bot"}`}
                >
                  <div className="msg-avatar">
                    {isUser ? (
                      <span className="avatar-circle bot-avatar"><img className="avatar-circle bot-avatar" src="https://i.imgur.com/zwTgEJh.png" alt="" /></span>

                    ) : (
                      <span className="avatar-circle user-avatar"><img className="avatar-circle user-avatar" src="https://i.imgur.com/lvJTfiM.png" alt="" /></span>

                    )}
                  </div>
                  <div className="msg-bubble">
                    <div className="msg-meta">
                      <span className="role">
                        {isUser ? "Você" : "Assistente"}
                      </span>
                      <div className="msg-actions">
                        <button
                          className="icon-btn"
                          title="Copiar"
                          onClick={() => copyToClipboard(msg.texto)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                        </button>
                        {!isUser && idx === historico.length - 1 && (
                          <button
                            className="icon-btn"
                            title="Regenerar (usa última pergunta)"
                            onClick={regenerateLast}
                            disabled={sending}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="msg-content">
                      {!isUser && idx === historico.length - 1 && typingMessageIdx === idx ? (
                        <TypewriterText
                          text={msg.texto}
                          speed={8}
                          onComplete={() => setTypingMessageIdx(null)}
                        />
                      ) : (
                        <ReactMarkdown>{msg.texto}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="chat-msg-row bot">
                <div className="msg-avatar">
                  <span className="avatar-circle user-avatar"><img className="avatar-circle user-avatar" src="https://i.imgur.com/lvJTfiM.png" alt="" /></span>
                </div>
                <div className="msg-bubble typing">
                  <div className="msg-meta">
                    <span className="role">Assistente</span>
                  </div>
                  <div className="msg-content">
                    <span className="typing-dots">
                      Gerando{dots}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="chat-msg-row bot">
                <div className="msg-avatar">
                  <span className="avatar-circle bot-avatar">!</span>
                </div>
                <div className="msg-bubble error">
                  <div className="msg-meta">
                    <span className="role">Erro</span>
                  </div>
                  <div className="msg-content">{errorMsg}</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
            {showScrollButton && (
              <button
                className="scroll-bottom-btn"
                onClick={() => scrollToBottom()}
                title="Ir para o final"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </button>
            )}
          </section>

          {/* ============ RIGHT SESSIONS NAV ============ */}
          <aside
            className={`chat-sidebar modern-sessions ${showSessionsNav ? "visible" : "hidden"
              }`}
            aria-label="Lista de conversas"
          >
            <div className="sessions-toolbar">
              <button
                className="new-chat"
                onClick={() => handleNewChat()}
                disabled={selectionMode}
              >
                Novo chat
              </button>
              <button
                className="select-toggle subtle-btn"
                onClick={toggleSelectionMode}
                aria-pressed={selectionMode}
                title={
                  selectionMode ? "Sair do modo seleção" : "Selecionar vários"
                }
              >
                {selectionMode ? "Cancelar" : "Selecionar"}
              </button>
              <button
                className="collapse-btn small"
                onClick={() => setShowSessionsNav((v) => !v)}
                title={
                  showSessionsNav
                    ? "Ocultar lista de conversas"
                    : "Mostrar lista de conversas"
                }
              >
                {showSessionsNav ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 7l-5 5 5 5M18 7l-5 5 5 5" /></svg>
                )}
              </button>
            </div>

            {selectionMode && (
              <div className="selection-actions">
                <div className="selection-info">
                  {selectedSessions.size > 0
                    ? `${selectedSessions.size} selecionada${selectedSessions.size > 1 ? "s" : ""
                    }`
                    : "Nenhuma selecionada"}
                </div>
                <div className="selection-buttons">
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={
                      isAllFilteredSelected ? clearSelected : selectAllFiltered
                    }
                    disabled={filteredSessions.length === 0}
                  >
                    {isAllFilteredSelected ? "Limpar" : "Tudo"}
                  </button>
                  <button
                    type="button"
                    className="mini-btn delete"
                    disabled={selectedSessions.size === 0 || deleting}
                    onClick={handleDeleteSelected}
                  >
                    {deleting ? "..." : "Apagar"}
                  </button>
                </div>
                {deleteFeedback && (
                  <div className="delete-feedback" aria-live="polite">
                    {deleteFeedback}
                  </div>
                )}
              </div>
            )}

            <div className="chat-title sessions-head">
              {loadingSessions ? "Carregando..." : "Seus chats"}
            </div>
            <ul
              className={`chat-list modern ${selectionMode ? "selection-mode" : ""
                }`}
            >
              {filteredSessions.map((sessao) => {
                const active = sessao.id === currentSessionId;
                const checked = selectedSessions.has(sessao.id);
                return (
                  <li
                    key={sessao.id}
                    className={`chat-item ${active ? "active" : ""} ${checked ? "checked" : ""
                      }`}
                    onClick={() => handleSelectSession(sessao.id)}
                    onDoubleClick={() => startRename(sessao)}
                    title={
                      selectionMode
                        ? "Clique para selecionar"
                        : "Duplo clique para renomear"
                    }
                  >
                    {selectionMode && (
                      <input
                        type="checkbox"
                        className="session-checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(sessao.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}

                    <div className="chat-item-main">
                      {editingSessionId === sessao.id ? (
                        <input
                          autoFocus
                          value={editingTitleValue}
                          onChange={(e) =>
                            setEditingTitleValue(e.target.value)
                          }
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            else if (e.key === "Escape")
                              setEditingSessionId(null);
                          }}
                          className="rename-input"
                        />
                      ) : (
                        <span
                          className="session-title"
                          style={{ fontWeight: active ? 600 : 500 }}
                        >
                          {highlightTitle(sessao._tituloExibicao)}
                        </span>
                      )}
                    </div>

                    {!selectionMode && (
                      <div className="chat-actions">
                        <button
                          className="icon-btn small danger"
                          title="Apagar"
                          onClick={(e) => handleDeleteSingle(e, sessao.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" /></svg>
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
              {filteredSessions.length === 0 && !loadingSessions && (
                <li className="empty-state">Nenhum chat encontrado.</li>
              )}
            </ul>
          </aside>
        </div>

        {/* ============ FOOTER INPUT AREA ============ */}
        <footer className="footer modern-footer">
          <div className="footer-inner">
            <div className="input-wrapper">
              <textarea
                ref={textareaRef}
                className="msg-input"
                placeholder={
                  sending
                    ? "Enviando..."
                    : "Digite sua mensagem (Enter envia, Shift+Enter quebra linha)..."
                }
                value={mensagem}
                disabled={sending}
                onChange={(e) => setMensagem(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                rows={1}
              />
              <div className="input-actions">
                <button
                  onClick={enviarMensagem}
                  disabled={sending || !mensagem.trim()}
                  className="send-btn modern"
                  title="Enviar mensagem"
                >
                  {sending ? "..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* ============ SETTINGS DRAWER ============ */}
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
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
                    onChange={(e) =>
                      updateSetting("displayName", e.target.value)
                    }
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
                    onChange={(e) =>
                      updateSetting("themePref", e.target.value)
                    }
                  >
                    <option value="auto">Auto / Manual</option>
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                  </select>
                </label>
                <label className="settings-field">
                  <span>Escala de fonte (%)</span>
                  <input
                    type="number"
                    min="80"
                    max="180"
                    value={settings.fontScale}
                    onChange={(e) =>
                      updateSetting("fontScale", e.target.value)
                    }
                  />
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
              <button type="button" className="outline-btn" onClick={closeSettings}>
                Fechar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

/*
Notas de adaptação de estilo (sem CSS aqui):
- Classes novas/alteradas para estilo ChatGPT:
  modern-shell, left-nav, collapse-btn, top-bar, ghost-btn, modern-layout,
  modern-chat, chat-msg-row, msg-avatar, avatar-circle, msg-bubble, msg-meta,
  msg-actions, icon-btn, typing, position-tag, scroll-bottom-btn,
  modern-sessions, top-right-group, top-left-group, chat-title-main,
  modern-footer, footer-inner, input-wrapper, msg-input, pos-btn, send-btn.modern
  error, msg-system, typing-dots.

- Ajustar transições de colapso com width/translate/opacity.
- Responsividade: em telas menores ocultar automaticamente a sidebar de sessões.
- Adicionar media queries para reorganizar layout mobile.
- Garantir scroll interno em .chat-area e sticky header/footer.
*/



