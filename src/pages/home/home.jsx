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

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.16 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isDark = useMemo(() => theme === "dark", [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="home">
      {/* Topbar com logo e alternância de tema */}
      <header className="topbar">
        <div className="container topbar-inner">
          <a className="brand" href="/" aria-label="Neurocom - Página inicial">
            <img
              className="brand-logo"
              src="https://i.imgur.com/knLE8C5.png"
              alt="Neurocom"
              width="120"
              height="28"
              loading="eager"
            />
          </a>

          <nav className="top-actions" aria-label="Navegação principal">
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
              {isDark ? "Modo claro" : "Modo escuro"}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section — estilo About do Gemini com logo central + halo */}
      <section className="hero">
        <div className="orbs" aria-hidden="true">
          <span className="orb orb-a" />
          <span className="orb orb-b" />
          <span className="orb orb-c" />
        </div>

        <div className="container hero-grid">
          <div className="hero-col">
            <div className="hero-brand reveal" style={{ ["--reveal-delay"]: "0ms" }}>
              <div className="logo-wrap">
                <span className="" aria-hidden="true" />
                <img
                  className="brand-logo-hero"
                  src="https://i.imgur.com/knLE8C5.png"
                  alt="Neurocom"
                  width="220"
                  height="56"
                  loading="eager"
                />
              </div>
            </div>

            <h1 className="hero-title shine reveal" style={{ ["--reveal-delay"]: "60ms" }}>
              Conheça o Assistente de IA Neurocom
            
            </h1>

            <p className="hero-subtitle reveal" style={{ ["--reveal-delay"]: "120ms" }}>
              Converse com um assistente de IA com visão relacional, projetado para oferecer
              informações claras, responsáveis e úteis — sem abrir mão da experiência e do cuidado.
            </p>

            <div className="hero-cta reveal" style={{ ["--reveal-delay"]: "160ms" }}>
              <button
                className="btn-primary"
                onClick={() => (window.location.href = "/login")}
              >
                Vamos começar
              </button>
              <a href="#features" className="btn-outline">Explorar recursos</a>
            </div>

            <div className="trust-row reveal" style={{ ["--reveal-delay"]: "200ms" }} aria-label="Selo de confiança e privacidade">
            
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card reveal hover-lift" style={{ ["--reveal-delay"]: "220ms" }}>
              <div className="hero-bubble-bot shimmer">
                Olá! Como posso ajudar hoje?
              </div>
              <div className="hero-bubble-user">
                Tenho dúvidas sobre dor de cabeça persistente.
              </div>
              <div className="hero-bubble-bot">
                Posso orientar com base em sinais e sintomas, mas não substituo uma consulta.
                Vamos começar?
              </div>
              <div className="input-ghost shimmer" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta" id="cta">
        <div className="container">
          <div className="cta-card reveal" style={{ ["--reveal-delay"]: "0ms" }}>
            <h2>Pronto para começar?</h2>
            <p>
              Inicie uma conversa com o Assistente Neurocom e experimente uma abordagem
              conversacional clara, humana e profissional.
            </p>
            <button className="btn-primary" onClick={() => (window.location.href = "/login")}>
              Vamos começar
            </button>
          </div>
        </div>
      </section>

      {/* Doctor/Autoridade Section */}
      <section className="doctor" id="doctor">
        <div className="container">
          <div className="doctor-card reveal" style={{ ["--reveal-delay"]: "0ms" }}>
            <div className="doctor-info">
              <h2>
                <span className="text-medical-blue">Dr. Sérgio Spritzer</span>
              </h2>

              <ul className="doctor-bio">
                <li>Formação em Medicina pela UFRGS - Porto Alegre.</li>
               Dr. Sérgio Spritzer é médico formado pela UFRGS, especialista em Neurologia Clínica, mestre pela PUC-SP e com formação em Psicanálise, PNL e Hipnose Relacional. Pioneiro em pesquisas sobre interações humanas, é idealizador da Neurocom, dedicada ao estudo e transformação de realidades humanas.
              </ul>

              <div className="doctor-details">
                <div><span className="dot-green" /> Neurologia Clínica • PNL • Hipnose Relacional</div>
                <div><span className="dot-blue" /> Pesquisa em interações humanas</div>
                <div><span className="dot-green" /> Idealizador da Neurocom</div>
              </div>
            </div>
            <div className="doctor-avatar">
              <img src="public/sergio1.png" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container features-grid">
          <div className="feature reveal hover-lift" style={{ ["--reveal-delay"]: "0ms" }}>
            <div className="feature-icon">
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Respostas confiáveis</h3>
            <p>Informações claras, com contexto e referências quando aplicável.</p>
          </div>

          <div className="feature reveal hover-lift" style={{ ["--reveal-delay"]: "80ms" }}>
            <div className="feature-icon">
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Disponível 24/7</h3>
            <p>Atendimento contínuo com boa experiência de uso.</p>
          </div>

          <div className="feature reveal hover-lift" style={{ ["--reveal-delay"]: "140ms" }}>
            <div className="feature-icon">
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3>Seguro e privado</h3>
            <p>Boas práticas de privacidade e responsabilidade desde o design.</p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="disclaimer">
        <div className="container">
          <p>
            <strong>Aviso:</strong> Este assistente fornece informações gerais e não substitui
            uma consulta profissional. Procure especialistas para diagnósticos e tratamentos.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;