import React, { useState, useEffect } from "react";
import "./chat.css";
import ReactMarkdown from "react-markdown";

export default function App() {
  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState([]);
  const [token, setToken] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dots, setDots] = useState("");
  const sessionId = "sessao123";

  // Tema com persistência
  const getInitialTheme = () => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    } catch {}
    return "light";
  };
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Login e carregar histórico
  useEffect(() => {
    const iniciar = async () => {
      try {
        let savedToken = localStorage.getItem("token");

        if (!savedToken) {
          // Se não existir token, faz login (pode vir de um formulário depois)
          const res = await fetch("http://https://assistente-neurocom.onrender.com/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "usuario@teste.com", senha: "123456" })
          });
          const data = await res.json();
          if (data.token) {
            savedToken = data.token;
            localStorage.setItem("token", savedToken);
          }
        }

        if (savedToken) {
          setToken(savedToken);

          // carregar histórico
          const histRes = await fetch(`http://https://assistente-neurocom.onrender.com/chat-historico/${sessionId}`, {
            headers: { Authorization: "Bearer " + savedToken }
          });
          const histData = await histRes.json();

          if (histData.mensagens) {
            const formatado = histData.mensagens.flatMap((m) => [
              { remetente: "usuario", texto: m.pergunta },
              { remetente: "bot", texto: m.resposta }
            ]);
            setHistorico(formatado);
          }
        }
      } catch (err) {
        console.error("Erro login ou histórico:", err);
      }
    };
    iniciar();
  }, []);

  // Pontinhos animados
  useEffect(() => {
    if (!isTyping) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, [isTyping]);

  // Enviar mensagem
  const enviarMensagem = async () => {
    if (!mensagem.trim() || !token) return;

    const userMsg = { remetente: "usuario", texto: mensagem };
    setHistorico((prev) => [...prev, userMsg]);
    setMensagem("");
    setIsTyping(true);

    try {
      const res = await fetch("http://https://assistente-neurocom.onrender.com/chat-rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ mensagem, sessionId })
      });

      const data = await res.json();
      const botMsg = { remetente: "bot", texto: data.resposta };
      setHistorico((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Erro no chat-rag:", err);
      const botMsg = { remetente: "bot", texto: "Erro ao processar a pergunta." };
      setHistorico((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
      setDots("");
    }
  };

  // Logout com redirect
  const logout = () => {
    try {
      localStorage.removeItem("token");
      setToken("");
      setHistorico([]);
      // redirect automático para login (outra página)
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
          <button
            className="darkmode-btn"
            onClick={toggleTheme}
            aria-label="Alternar entre modo claro e escuro"
            aria-pressed={theme === "dark"}
            style={{ marginBottom: "0.75rem", width: "100%" }}
          >
            {theme === "dark" ? "☀️ Modo claro" : "🌙 Modo escuro"}
          </button>

          <input type="text" placeholder="Pesquisar" className="search" />
          <nav className="menu">
            <a href="#">Sobre</a>
            <a href="#">Limpar conversas</a>
            <a href="#">Upgrade</a>
            <a href="#">Configurações</a>
            <a href="#" onClick={logout}>Sair</a>
          </nav>
        </div>
        <div className="user-box">
          <div className="user-info">
            <img src="https://i.pravatar.cc/100" alt="avatar" className="avatar" />
            <div className="user-text">
              <span className="user-name">Nome Usuário</span>
              <span className="user-email">usuario@gmail.com</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="content">
          <section className="chat-area">
            {historico.map((msg, idx) => (
              <div
                key={idx}
                className={msg.remetente === "usuario" ? "msg-usuario" : "msg-bot"}
              >
                <ReactMarkdown>{msg.texto}</ReactMarkdown>
              </div>
            ))}
            {isTyping && <div className="msg-bot">..{dots}</div>}
          </section>

          <aside className="chat-sidebar">
            <button className="new-chat">+ Novo chat</button>
            <div className="chat-title">Lista de chats</div>
            <ul className="chat-list">
              <li>
                <span>Chat exemplo 1</span>
                <small>08 Abril</small>
              </li>
              <li>
                <span>Chat exemplo 2</span>
                <small>08 Abril</small>
              </li>
            </ul>
          </aside>
        </div>

        <footer className="footer">
          <input
            className="input"
            placeholder="Escreva..."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") enviarMensagem();
            }}
          />
          <button onClick={enviarMensagem}>Enviar</button>
        </footer>
      </main>
    </div>
  );
}
