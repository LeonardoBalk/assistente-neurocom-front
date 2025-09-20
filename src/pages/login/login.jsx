import './login.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Login({ setLogado }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper: decodifica JWT para fallback (C)
  function decodeJwt(token) {
    try {
      const [, payload] = token.split('.');
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  }

  async function fetchUserFromMe(token) {
    try {
      const res = await axios.get(`${BACKEND_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && (res.data.email || res.data.nome || res.data.name)) {
        return {
          nome: res.data.nome || res.data.name || res.data.displayName || 'Usuário',
          email: res.data.email || 'sem-email'
        };
      }
    } catch {
      // silencioso
    }
    return null;
  }

  async function buildUserInfo(token, maybeUsuarioObj) {
    // 1. Se backend já mandou
    if (maybeUsuarioObj && (maybeUsuarioObj.email || maybeUsuarioObj.nome || maybeUsuarioObj.name)) {
      return {
        nome: maybeUsuarioObj.nome || maybeUsuarioObj.name || maybeUsuarioObj.displayName || 'Usuário',
        email: maybeUsuarioObj.email || 'sem-email'
      };
    }

    // 2. Tenta /me
    const me = await fetchUserFromMe(token);
    if (me) return me;

    // 3. Fallback: decodifica o token
    const decoded = decodeJwt(token);
    if (decoded) {
      return {
        nome: decoded.nome || decoded.name || decoded.preferred_username || decoded.sub || 'Usuário',
        email: decoded.email || 'sem-email'
      };
    }

    return {
      nome: 'Usuário',
      email: 'sem-email'
    };
  }

  const handleLogin = async () => {
    if (!email || !senha) {
      setErro('Preencha email e senha');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/login`, { email, senha });
      if (!res.data || !res.data.token) {
        throw new Error('Resposta inválida do servidor.');
      }

      const token = res.data.token;
      localStorage.setItem('token', token);

      // Gera/obtém userInfo
      const userInfo = await buildUserInfo(token, res.data.usuario);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      setLogado(true);
      navigate('/');
    } catch (err) {
      console.log('Erro login:', err?.response?.data || err.message);
      setErro('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  // Caso retorno OAuth (token como query param)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userEmail = params.get('email'); // se backend enviar
    const userName = params.get('nome') || params.get('name');

    (async () => {
      if (token) {
        localStorage.setItem('token', token);
        let existing = null;
        if (userEmail || userName) {
          existing = {
            nome: userName || 'Usuário',
            email: userEmail || 'sem-email'
          };
        } else {
          existing = await buildUserInfo(token, null);
        }
        localStorage.setItem('userInfo', JSON.stringify(existing));
        setLogado(true);
        navigate('/');
      }
    })();
  }, [navigate, setLogado]);

  return (
    <div className="container-login">
      <form className="form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <div className="logo" aria-hidden="true">
          <img
            src="https://i.imgur.com/knLE8C5.png"
            alt="NeuroCom"
            loading="lazy"
            width={140}
            height={140}
          />
        </div>

        <h1 className="title">Login</h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          name="senha"
          type="password"
          placeholder="Senha"
          className="input"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="current-password"
        />

        <button
          type="submit"
            className="button"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <button
          type="button"
          className="button button-google"
          onClick={handleGoogleLogin}
          aria-label="Entrar com Google"
          disabled={loading}
        >
          <img
            className="g-icon"
            src="https://developers.google.com/identity/images/g-logo.png"
            alt=""
            aria-hidden="true"
          />
          Entrar com Google
        </button>

        {erro && <p style={{ color: 'red', marginTop: '10px' }}>{erro}</p>}
      </form>

      <div className="conta">
        Não possui uma conta?
        <a href="/cadastro" className="logar"> Cadastrar-se</a>
      </div>
    </div>
  );
}

export default Login;