import { useEffect, useMemo, useState } from "react";
import "./home.css";

const Home = () => {
  // Tema (claro/escuro) com preferência persistida e fallback para prefers-color-scheme
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

  const isDark = useMemo(() => theme === "dark", [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="home">
      {/* Topbar com logo e alternância de tema */}
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">🩺</div>
            <div className="brand-text">
              <span className="brand-name">Neurocom</span>
              <span className="brand-sub"></span>
            </div>
          </div>

          <nav className="top-actions">
            <a className="top-link" href="#features">Recursos</a>
            <a className="top-link" href="#doctor">Sobre</a>
            <a className="top-link" href="#cta">Iniciar</a>
            <button
              className="darkmode-btn"
              onClick={toggleTheme}
              aria-label="Alternar entre modo claro e escuro"
              aria-pressed={isDark}
              title={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
            >
              {isDark ? "☀️ Modo claro" : "🌙 Modo escuro"}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-col">
            <div className="hero-logo">
              <div className="hero-icon">
                <img
                  className="icon-xl"
                  src="https://static.wixstatic.com/media/653ae5_a88c01b6ee004684a1ea74786324c9e2~mv2.png"
                  alt="Logomarca Neurocom"
                />
              </div>
            </div>

            <h1 className="hero-title">
              Seu Assistente Médico
              <span className="gradient-text">Inteligente</span>
            </h1>

            <p className="hero-subtitle">
              Converse com um assistente de IA especializado em medicina, desenvolvido para fornecer
              informações precisas e atualizadas sobre saúde e cuidados médicos.
            </p>

            <div className="hero-cta">
              <button
                className="cta-btn"
                onClick={() => (window.location.href = "/login")}
              >
                Vamos Começar
              </button>
              <a href="#features" className="btn-outline">Explorar Recursos</a>
            </div>

            <div className="trust-row" aria-label="Selo de confiança e privacidade">
              <span className="trust-item">🔒 Privacidade protegida</span>
              <span className="dot-sep" />
              <span className="trust-item">⚕️ Conteúdo orientado por evidências</span>
              <span className="dot-sep" />
              <span className="trust-item">⏱️ Disponível 24/7</span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card">
              <div className="hero-bubble-bot">
                Olá! Como posso ajudar hoje?
              </div>
              <div className="hero-bubble-user">
                Tenho dúvidas sobre dor de cabeça persistente.
              </div>
              <div className="hero-bubble-bot">
                Posso orientar com base em sinais e sintomas, mas não substituo uma consulta. Vamos começar?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta" id="cta">
        <div className="container">
          <div className="cta-card">
            <h2>Pronto para começar?</h2>
            <p>
              Inicie uma conversa com seu assistente médico inteligente e obtenha informações de
              saúde confiáveis e atualizadas.
            </p>
            <button className="cta-btn" onClick={() => (window.location.href = "/login")}>
              Vamos Começar
            </button>
          </div>
        </div>
      </section>

      {/* Doctor Section */}
      <section className="doctor" id="doctor">
        <div className="container">
          <div className="doctor-card">
            <div className="doctor-info">
              <h2>
                Desenvolvido por <span className="text-medical-blue"></span>
              </h2>
              <p>
                Médico.
                Este assistente foi desenvolvido com base em conhecimentos médicos atualizados e melhores práticas da medicina.
              </p>
              <div className="doctor-details">
                <div><span className="dot-green" /> CRM </div>
                <div><span className="dot-blue" /> Especialista em </div>
                <div><span className="dot-green" /> P</div>
              </div>
            </div>
            <div className="doctor-avatar">
              <div className="avatar-icon">
                <svg className="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="34" r="16" strokeWidth="6" />
                  <path d="M20 84c0-16.568 13.432-30 30-30s30 13.432 30 30" strokeWidth="6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container features-grid">
          <div className="feature">
            <div className="feature-icon green-blue">
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Respostas Confiáveis</h3>
            <p>Informações baseadas em evidências científicas</p>
          </div>

          <div className="feature">
            <div className="feature-icon blue-green">
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Disponível 24/7</h3>
            <p>Atendimento inteligente a qualquer hora</p>
          </div>

          <div className="feature">
            <div className="feature-icon green-blue-alt">
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3>Seguro e Privado</h3>
            <p>Suas informações são protegidas</p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="disclaimer">
        <div className="container">
          <p>
            <strong>Aviso:</strong> Este assistente fornece informações gerais sobre saúde e não substitui
            a consulta médica profissional. Sempre consulte um médico para diagnósticos e tratamentos.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;