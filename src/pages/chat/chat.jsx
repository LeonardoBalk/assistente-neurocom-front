import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./chat.css";
import ReactMarkdown from "react-markdown";


const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  /* ===== Estados principais ===== */
  // Estados novos
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

  /* Renomear sessão */
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");

  /* ===== Seleção / exclusão de sessões ===== */
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState("");

  /* ===== Pesquisa ===== */
  const [sessionSearch, setSessionSearch] = useState("");
  const searchInputRef = useRef(null);

  /* ===== Tema / Configurações ===== */
  const SETTINGS_KEY = "app_settings";
  const getInitialTheme = () => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
    } catch {}
    return "light";
  };
  const [theme, setTheme] = useState(getInitialTheme());


const [userInfo, setUserInfo] = useState(null);

useEffect(() => {
  try {
    const raw = localStorage.getItem('userInfo');
    if (raw) {
      setUserInfo(JSON.parse(raw));
    }
  } catch {}
}, []);
  
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("theme", theme); } catch {}
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

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", settings.fontScale + "%");
  }, [settings.fontScale]);
  useEffect(() => {
    if (settings.themePref === "light") setTheme("light");
    else if (settings.themePref === "dark") setTheme("dark");
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

  /* ===== Login inicial ===== */
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

  /* ===== Carregar sessões ===== */
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
          setCurrentSessionId(prev => prev || data.sessoes[0].id);
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

  /* ===== Histórico da sessão ativa ===== */
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

  /* ===== Animação typing ===== */
  useEffect(() => {
    if (!isTyping) return;
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, [isTyping]);

  /* ===== Enviar mensagem ===== */
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
      if (data.erro) throw new Error(data.erro);

      if (data.sessionId && data.sessionId !== currentSessionId) {
        setCurrentSessionId(data.sessionId);
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

  /* ===== Nova sessão ===== */
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

  /* ===== Selecionar sessão ===== */
  const handleSelectSession = (id) => {
    if (selectionMode) {
      toggleSelect(id);
      return;
    }
    if (id === currentSessionId) return;
    setCurrentSessionId(id);
    setHistorico([]);
  };

  /* ===== Renomear sessão ===== */
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
        setSessions(prev =>
          prev.map(s => (s.id === id ? { ...s, titulo: data.sessao.titulo } : s))
        );
      }
    } catch (err) {
      console.error("Erro renomeando sessão:", err);
      setErrorMsg("Falha ao renomear.");
    }
  };

  /* ===== Limpar conversas ===== */
  const limparConversas = () => {
    setHistorico([]);
  };

  /* ===== Logout ===== */
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

  /* ======= PESQUISA ======= */
  const normalizedSessions = useMemo(
    () => sessions.map(s => ({
      ...s,
      _tituloExibicao: s.titulo && s.titulo.trim() ? s.titulo : "(Sem título)"
    })),
    [sessions]
  );
  const filteredSessions = useMemo(() => {
    const q = sessionSearch.trim().toLowerCase();
    if (!q) return normalizedSessions;
    return normalizedSessions.filter(s =>
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
      regex.test(part) ? <mark key={i} className="hl">{part}</mark> : part
    );
  };
  const clearSearch = () => {
    setSessionSearch("");
    searchInputRef.current?.focus();
  };

  /* ======= SELEÇÃO DE SESSÕES ======= */
  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedSessions(new Set());
    }
    setSelectionMode(m => !m);
  };
  const toggleSelect = (id) => {
    setSelectedSessions(prev => {
      const ns = new Set(prev);
      if (ns.has(id)) ns.delete(id);
      else ns.add(id);
      return ns;
    });
  };
  const selectAllFiltered = () => {
    setSelectedSessions(new Set(filteredSessions.map(s => s.id)));
  };
  const clearSelected = () => setSelectedSessions(new Set());
  const isAllFilteredSelected =
    filteredSessions.length > 0 &&
    filteredSessions.every(s => selectedSessions.has(s.id));

  const handleDeleteSelected = async () => {
    if (selectedSessions.size === 0) return;
    if (!window.confirm(`Apagar ${selectedSessions.size} conversa(s)? Isso não pode ser desfeito.`)) return;
    setDeleting(true);
    setDeleteFeedback("");
    try {
      for (const id of selectedSessions) {
        await fetch(`${BACKEND_URL}/sessoes/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token
          }
        }).catch(() => {});
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

  return (
    <div className="app">
      <aside className="sidebar">
        <div>
          {/* ===== Logo + texto ===== */}
          
  <img src="public/neurocom.png" alt="Neurocom" className="neurocom-logo" 
  
  />
  


          {/* ===== Pesquisa ===== */}
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
                ×
              </button>
            )}
          </div>

            {sessionSearch && (
              <div className="search-feedback" aria-live="polite">
                {filteredSessions.length === 0
                  ? "Nenhum resultado."
                  : `${filteredSessions.length} resultado${filteredSessions.length > 1 ? "s" : ""}`}
              </div>
            )}

          <nav className="menu" aria-label="Navegação">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openSettings(e.currentTarget);
              }}
            >
              Configurações
            </a>
            <a href="/sobre">Sobre</a>
            <a
              href="#"
              onClick={(e)=>{ e.preventDefault(); logout(); }}
            >
              Sair
            </a>
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
  <span className="user-name">
    {userInfo?.nome || settings.displayName || 'Usuário'}
  </span>
  <span className="user-email">
    {userInfo?.email || settings.email || 'sem-email'}
  </span>
</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="content">
          <section className="chat-area" aria-label="Área de mensagens">
            {loadingHistory && <div className="msg-bot">Carregando histórico...</div>}
            {historico.map((msg, idx) => (
              <div
                key={idx}
                className={msg.remetente === "usuario" ? "msg-usuario" : "msg-bot"}
              >
                <ReactMarkdown>{msg.texto}</ReactMarkdown>
              </div>
            ))}
            {isTyping && <div className="msg-bot">..{dots}</div>}
            {errorMsg && <div className="msg-bot error">{errorMsg}</div>}
          </section>

          <aside className="chat-sidebar" aria-label="Lista de conversas">
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
                title={selectionMode ? "Sair do modo seleção" : "Selecionar vários"}
              >
                {selectionMode ? "Cancelar" : "Selecionar"}
              </button>
            </div>

            {selectionMode && (
              <div className="selection-actions">
                <div className="selection-info">
                  {selectedSessions.size > 0
                    ? `${selectedSessions.size} selecionada${selectedSessions.size > 1 ? "s" : ""}`
                    : "Nenhuma selecionada"}
                </div>
                <div className="selection-buttons">
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={isAllFilteredSelected ? clearSelected : selectAllFiltered}
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

            <div className="chat-title">
              {loadingSessions ? "Carregando..." : "Seus chats"}
            </div>
            <ul className={`chat-list ${selectionMode ? "selection-mode" : ""}`}>
              {filteredSessions.map(sessao => {
                const active = sessao.id === currentSessionId;
                const checked = selectedSessions.has(sessao.id);
                return (
                  <li
                    key={sessao.id}
                    className={`chat-item ${active ? "active" : ""} ${checked ? "checked" : ""}`}
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
                          onChange={(e) => setEditingTitleValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            else if (e.key === "Escape") setEditingSessionId(null);
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

                    {/* Ações minimalistas (apenas quando não está em modo seleção) */}
                    {!selectionMode && (
                      <div className="chat-actions">
                        
                      </div>
                    )}
                  </li>
                );
              })}
              {filteredSessions.length === 0 && !loadingSessions && (
                <li className="empty-state">
                  Nenhum chat encontrado.
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
          <button
            onClick={enviarMensagem}
            disabled={sending || !mensagem.trim()}
            className="send-btn"
          >
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