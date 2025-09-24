import React, { useEffect } from "react";
import "./sobre.css";

export default function Sobre() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.14 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="sobre" id="conteudo-principal">
      {/* HERO — logo central + halo animado + headline */}
      <section className="sobre-hero">
        <div className="orbs" aria-hidden="true">
          <span className="orb orb-a" />
          <span className="orb orb-b" />
          <span className="orb orb-c" />
        </div>
        <div className="hero-brand reveal" style={{ ["--reveal-delay"]: "0ms" }}>
          <div className="logo-wrap">
            <span className="" aria-hidden="true" />
            <img
              className="brand-logo-hero"
              src="https://i.imgur.com/knLE8C5.png"
              alt="Neurocom"
              width="180"
              height="56"
              loading="eager"
            />
          </div>
        </div>
        <div className="sobre-hero-inner reveal" style={{ ["--reveal-delay"]: "60ms" }}>
          <h1 className="shine">
            Assistente IA Neurocom
          </h1>
          <p className="sobre-lead">
            Inovação em atendimento digital para clínica, educação e organizações.<br />
            Experimente uma abordagem relacional, humana e segura — com IA de alto nível.
          </p>
          <div className="hero-gallery">
          </div>
          <div className="sobre-cta">
            <a className="btn-primary" href="https://www.neurocom.com.br/" target="_blank" rel="noopener noreferrer">
              Visitar Neurocom
            </a>
          </div>
        </div>
        {/* Navegação local em pílulas */}
        <nav className="sobre-localnav reveal" aria-label="Seções desta página" style={{ ["--reveal-delay"]: "100ms" }}>
          <a href="#visao" className="local-pill">Visão</a>
          <a href="#neurocom" className="local-pill">Neurocom</a>
          <a href="#dr-sergio" className="local-pill">Dr. Sérgio</a>
          <a href="#assistente" className="local-pill">Assistente IA</a>
          <a href="#galeria" className="local-pill">Imagens</a>
          <a href="#contato" className="local-pill">Contato</a>
        </nav>
      </section>

      {/* Seção: Visão */}
      <section id="visao" className="sobre-section">
        <div className="section-header reveal">
          <h2>O “entre” como ponto de virada</h2>
          <p className="section-sub">
            A Neurocom acredita que o essencial está nas relações — no que acontece entre pessoas. Essa lente orienta nossa atuação e sustenta mudanças reais.
          </p>
        </div>
        <div className="cols-2">
          <article className="card card-soft reveal" style={{ ["--reveal-delay"]: "80ms" }}>
            <h3>Campo relacional</h3>
            <p>
              Desenvolvemos consciência sobre padrões de interação e repertório para agir com clareza, responsabilidade e cuidado — em casa, na escola e no trabalho.
            </p>
          </article>
          <article className="card card-soft reveal" style={{ ["--reveal-delay"]: "140ms" }}>
            <h3>Do consultório ao digital</h3>
            <p>
              O Assistente Neurocom leva essa abordagem para uma experiência digital, com linguagem acessível, segurança e foco em UX.
            </p>
          </article>
        </div>
      </section>

      {/* Seção: Neurocom (institucional) */}
      <section id="neurocom" className="sobre-section">
        <div className="section-header reveal">
          <h2>Quem somos</h2>
        </div>
        <div className="cards-grid">
          <article className="card hover-lift reveal" style={{ ["--reveal-delay"]: "60ms" }}>
            <div className="icon-circle" aria-hidden="true"><SvgTarget /></div>
            <h3>Missão</h3>
            <p>
              Apoiar pessoas, famílias, escolas e empresas a lidar com mudanças e desafios de forma criativa e estratégica, preparando indivíduos para contextos dinâmicos.
            </p>
          </article>
          <article className="card hover-lift reveal" style={{ ["--reveal-delay"]: "100ms" }}>
            <div className="icon-circle" aria-hidden="true"><SvgLayers /></div>
            <h3>Metodologia</h3>
            <p>
              Foco no “entre” — o campo relacional — integrando práticas psico‑relacionais em terapia e consultoria, com processos pragmáticos e sustentáveis.
            </p>
          </article>
          <article className="card hover-lift reveal" style={{ ["--reveal-delay"]: "140ms" }}>
            <div className="icon-circle" aria-hidden="true"><SvgHandshake /></div>
            <h3>Serviços</h3>
            <ul>
              <li>Terapia individual, de casais e famílias</li>
              <li>Consultoria para lideranças, equipes e cultura</li>
              <li>Mediação e facilitação de diálogos</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Seção: Dr. Sérgio */}
      <section id="dr-sergio" className="sobre-section">
        <div className="section-header reveal">
          <h2>Dr. Sérgio Spritzer</h2>
          <p className="section-sub">
            Idealizador da Neurocom, atuação clínica e consultiva orientada pelo campo relacional, com olhar sistêmico e pragmático.
          </p>
        </div>
        <div className="bio">
          <figure className="portrait-card card reveal" style={{ ["--reveal-delay"]: "60ms" }}>
            <img
              src="https://i.imgur.com/p1sKSj1.jpeg"
              alt="Retrato profissional do Dr. Sérgio Spritzer"
              loading="lazy"
              width="640"
              height="800"
            />
            <figcaption>
              <strong>Dr. Sérgio Spritzer</strong>
              <span>Psico‑relacional • Clínica, Educação e Organizações</span>
            </figcaption>
          </figure>
          <article className="bio-text card card-soft reveal" style={{ ["--reveal-delay"]: "120ms" }}>
            <h3>Bio e atuação</h3>
            <p>
              Foco no que acontece “entre” as pessoas — nas relações. Prática que integra clínica e consultoria, apoiando decisões e mudanças com base em diálogos qualificados.
            </p>
            <div className="qual-list">
              <div>
                <h4>Abordagem</h4>
                <ul>
                  <li>Foco no campo relacional (“entre”)</li>
                  <li>Integração clínica–consultiva</li>
                  <li>Processos práticos e mensuráveis</li>
                </ul>
              </div>
              <div>
                <h4>Âmbitos</h4>
                <ul>
                  <li>Indivíduos, casais e famílias</li>
                  <li>Lideranças e equipes</li>
                  <li>Educação e cultura organizacional</li>
                </ul>
              </div>
              <div>
                <h4>Credenciais</h4>
                <ul>
                  <li>Formação em Medicina pela UFRGS - Porto Alegre</li>
                  <li>Especialização em Neurologia Clínica pela Fundação Faculdade Federal de Ciências Médicas de Porto Alegre</li>
                  <li>Pós-graduação em Desenvolvimento da Inteligência Humana no Instituto de Psicologia da UFRGS</li>
                  <li>Mestrado em Distúrbios da Comunicação Humana pela PUC de São Paulo (1989)</li>
                  <li>Atuação como professor adjunto no Instituto de Filosofia e Ciências Humanas</li>
                  <li>Formação psicanalítica; membro fundador da Associação Psicanalítica de Porto Alegre</li>
                  <li>Master Trainer em Programação Neurolinguística e Hipnose Relacional<br />— estudos avançados na NLP University (UCLA)</li>
                  <li>Palestrante principal no primeiro Congresso Brasileiro de Programação Neurolinguística (Universidade São Camilo de São Paulo)</li>
                  <li>Pesquisador pioneiro na fenomenologia das interações humanas</li>
                  <li>Idealizador e mantenedor da Neurocom</li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Seção: Assistente Neurocom — institucional e visual */}
      <section id="assistente" className="sobre-section">
        <div className="section-header reveal">
          <h2>Experiência conversacional profissional</h2>
          <p className="section-sub">
            O Assistente Neurocom traduz a visão relacional em uma experiência digital clara, segura e com foco no usuário.
          </p>
        </div>
        <div className="cols-2 media-feature">
          {/* Mock visual estilo “browser card” + GIF da IA */}
          <div className="browser-mock card reveal hover-lift" style={{ ["--reveal-delay"]: "120ms" }}>
            <div className="browser-topbar">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <div className="browser-body">
              <img src="/public/chat.png" alt="IA Neurocom em ação" className="browser-gif" />
             
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="sobre-section final-cta">
        <div className="cta-card card reveal">
          <h2>Vamos conversar</h2>
          <p>Descubra como a Neurocom e o Assistente IA podem apoiar seu contexto.<br />Solicite uma conversa personalizada.</p>
          <div className="sobre-cta">
            <a
              className="btn-primary"
              href="https://www.neurocom.com.br/cadastre-se"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contato oficial
            </a>
            <a
              className="btn-outline"
              href="https://www.neurocom.com.br/en/contact-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Página de contato
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

// ---------- Ícones (inline SVG, usam currentColor) ----------
function SvgTarget() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}
function SvgLayers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M20.5 12.5 12 17l-8.5-4.5" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
      <path d="M20.5 16.5 12 21l-8.5-4.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  );
}
function SvgHandshake() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M7 12l3-2 3 2 3-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 8l3 4 3 6M20 8l-3 4-3 6" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
    </svg>
  );
}
function SvgPeople() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="16" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" opacity="0.8"/>
      <path d="M4.5 18a4.5 4.5 0 0 1 9 0" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13 18a4 4 0 0 1 7 0" stroke="currentColor" strokeWidth="1.5" opacity="0.8"/>
    </svg>
  );
}