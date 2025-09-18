import './cadastro.css';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Cadastro({ setLogado }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState({ nome: '', email: '', senha: '' });
  const [touched, setTouched] = useState({ nome: false, email: false, senha: false });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // ---- Validações isoladas ----
  const validateNome = (value) => {
    const v = value.trim();
    if (!v) return 'Informe seu nome completo.';
    if (v.length < 3) return 'Nome muito curto.';
    if (!v.includes(' ')) return 'Inclua pelo menos um sobrenome.';
    return '';
  };

  const validateEmail = (value) => {
    const v = value.trim();
    if (!v) return 'Informe o email.';
    // Regex simples e robusta o suficiente p/ front
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!re.test(v)) return 'Email inválido.';
    return '';
  };

  const validateSenha = (value) => {
    if (!value) return 'Informe a senha.';
    if (value.length < 8) return 'Mínimo 8 caracteres.';
    if (!/[A-Z]/.test(value)) return 'Inclua letra maiúscula.';
    if (!/[a-z]/.test(value)) return 'Inclua letra minúscula.';
    if (!/[0-9]/.test(value)) return 'Inclua um número.';
    if (!/[!@#$%^&*()_\-+={[}\]|:;"'<>,.?/`~]/.test(value)) return 'Inclua caractere especial.';
    return '';
  };

  // ---- Força da senha (score + descrição) ----
  const passwordStrength = useMemo(() => {
    const value = senha;
    if (!value) return { score: 0, label: 'Vazia', color: '#999' };

    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[!@#$%^&*()_\-+={[}\]|:;"'<>,.?/`~]/.test(value)) score++;
    if (!/(.)\1{2,}/.test(value)) score++; // evita repetições longas
    if (!/senha/i.test(value)) score++;
    if (nome && !value.toLowerCase().includes(nome.split(' ')[0]?.toLowerCase())) score++;

    // Máximo possível: 9
    const pct = Math.min(100, Math.round((score / 9) * 100));
    let label = 'Fraca';
    if (pct >= 80) label = 'Excelente';
    else if (pct >= 60) label = 'Forte';
    else if (pct >= 40) label = 'Média';

    let color = '#dc2626';
    if (pct >= 80) color = '#059669';
    else if (pct >= 60) color = '#2563eb';
    else if (pct >= 40) color = '#f59e0b';

    return { score: pct, label, color };
  }, [senha, nome]);

  // ---- Validação reativa quando campos mudam ----
  useEffect(() => {
    setErrors({
      nome: validateNome(nome),
      email: validateEmail(email),
      senha: validateSenha(senha),
    });
  }, [nome, email, senha]);

  const allValid = Object.values(errors).every((e) => e === '') &&
    nome.trim() && email.trim() && senha;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleCadastro = async () => {
    setSubmitError('');

    // Marca todos como tocados para exibir mensagens
    setTouched({ nome: true, email: true, senha: true });

    if (!allValid) return;

    try {
      setSubmitting(true);
      const res = await axios.post(`${BACKEND_URL}/usuarios`, {
        nome: nome.trim(),
        email: email.trim(),
        senha: senha,
      });
      localStorage.setItem('token', res.data.token);
      setLogado(true);
      navigate('/');
    } catch (err) {
      console.log('Erro axios:', err.response ? err.response.data : err.message);
      setSubmitError('Não foi possível realizar o cadastro. Verifique os dados ou tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Login/cadastro via Google
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  // Checa se veio token (OAuth)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      setLogado(true);
      navigate('/');
    }
  }, [navigate, setLogado]);

  return (
    <div className="container-cadastro">
      <form className="form" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="logo">
          <img
            src="/public/neurocom.png"
            alt="NeuroCom"
            width={120}
            height={120}
            loading="lazy"
            draggable="false"
          />
        </div>
        <h1 className="title">Cadastro</h1>

        <div className="field">
          <input
            name="nome"
            type="text"
            placeholder="Nome completo"
            className={`input ${touched.nome && errors.nome ? 'input-error' : ''}`}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onBlur={() => handleBlur('nome')}
            aria-label="Nome completo"
            aria-invalid={!!(touched.nome && errors.nome)}
            aria-describedby={touched.nome && errors.nome ? 'erro-nome' : undefined}
            autoComplete="name"
          />
          {touched.nome && errors.nome && (
            <p id="erro-nome" className="error" role="alert">{errors.nome}</p>
          )}
        </div>

        <div className="field">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className={`input ${touched.email && errors.email ? 'input-error' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            aria-label="Email"
            aria-invalid={!!(touched.email && errors.email)}
            aria-describedby={touched.email && errors.email ? 'erro-email' : undefined}
            autoComplete="email"
          />
          {touched.email && errors.email && (
            <p id="erro-email" className="error" role="alert">{errors.email}</p>
          )}
        </div>

        <div className="field">
          <input
            name="senha"
            type="password"
            placeholder="Senha"
            className={`input ${touched.senha && errors.senha ? 'input-error' : ''}`}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onBlur={() => handleBlur('senha')}
            aria-label="Senha"
            aria-invalid={!!(touched.senha && errors.senha)}
            aria-describedby={`senha-strength ${touched.senha && errors.senha ? 'erro-senha' : ''}`}
            autoComplete="new-password"
          />
          {touched.senha && errors.senha && (
            <p id="erro-senha" className="error" role="alert">{errors.senha}</p>
          )}

            <div className="password-strength-wrapper" aria-live="polite" id="senha-strength">
              <div className="password-meter">
                <div
                  className="password-meter-bar"
                  style={{
                    width: `${passwordStrength.score}%`,
                    backgroundColor: passwordStrength.color
                  }}
                />
              </div>
              <span className="password-status" style={{ color: passwordStrength.color }}>
                {senha ? `${passwordStrength.label} (${passwordStrength.score}%)` : 'Força da senha'}
              </span>
            </div>

            <details className="password-rules">
              <summary>Requisitos da senha</summary>
              <ul>
                <li>Mínimo 8 caracteres</li>
                <li>Letra maiúscula e minúscula</li>
                <li>Número e caractere especial</li>
                <li>Evite usar seu nome ou "senha"</li>
              </ul>
            </details>
        </div>

        <button
          type="button"
          className="button"
          onClick={handleCadastro}
          disabled={!allValid || submitting}
          aria-disabled={!allValid || submitting}
        >
          {submitting ? 'Enviando...' : 'Cadastrar'}
        </button>

        <button
          type="button"
            className="button button-google"
          onClick={handleGoogleLogin}
          aria-label="Entrar com Google"
        >
          <img
            className="g-icon"
            src="https://developers.google.com/identity/images/g-logo.png"
            alt=""
            aria-hidden="true"
          />
          Entrar com Google
        </button>

        {submitError && (
          <p style={{ color: 'red', marginTop: '10px' }} role="alert">
            {submitError}
          </p>
        )}
      </form>
      <div className="conta">
        Já possui uma conta?
        <a href="/login" className="logar"> Fazer login</a>
      </div>
    </div>
  );
}

export default Cadastro;