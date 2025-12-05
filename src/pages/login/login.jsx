import './login.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Login({ setLogado }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  // Helper: decodifica JWT para fallback
  function decodeJwt(token) {
    try {
      const [, payload] = token.split('.');
      // padding para base64url
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      return JSON.parse(atob(padded));
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
          email: res.data.email || 'sem-email',
          avatar_url: res.data.avatar_url || null,
          provider: res.data.provider || null
        };
      }
    } catch {
      // silencioso
    }
    return null;
  }

  async function buildUserInfo(token, maybeUsuarioObj) {
    if (maybeUsuarioObj && (maybeUsuarioObj.email || maybeUsuarioObj.nome || maybeUsuarioObj.name)) {
      return {
        nome: maybeUsuarioObj.nome || maybeUsuarioObj.name || maybeUsuarioObj.displayName || 'Usuário',
        email: maybeUsuarioObj.email || 'sem-email',
        avatar_url: maybeUsuarioObj.avatar_url || null,
        provider: maybeUsuarioObj.provider || null
      };
    }

    const me = await fetchUserFromMe(token);
    if (me) return me;

    const decoded = decodeJwt(token);
    if (decoded) {
      return {
        nome: decoded.nome || decoded.name || decoded.preferred_username || decoded.sub || 'Usuário',
        email: decoded.email || 'sem-email',
        avatar_url: decoded.avatar_url || null,
        provider: decoded.provider || null
      };
    }

    return {
      nome: 'Usuário',
      email: 'sem-email',
      avatar_url: null,
      provider: null
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

  // Login Google via ID Token (GIS)
  const handleGoogleCredential = async (credential) => {
    try {
      setLoading(true);
      setErro('');
      const resp = await axios.post(`${BACKEND_URL}/auth/google-token`, {
        credential
      });

      if (!resp.data || !resp.data.token) {
        throw new Error('Resposta inválida do servidor Google backend');
      }

      const token = resp.data.token;
      localStorage.setItem('token', token);

      const userInfo = await buildUserInfo(token, resp.data.usuario);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      setLogado(true);
      navigate('/');
    } catch (e) {
      console.error('Erro Google Token:', e?.response?.data || e.message);
      setErro('Falha no login Google');
    } finally {
      setLoading(false);
    }
  };

  // Carrega e inicializa Google Identity Services dinamicamente
  useEffect(() => {
    let canceled = false;

    const initGoogle = () => {
      if (!window.google || !GOOGLE_CLIENT_ID) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response && response.credential) {
              handleGoogleCredential(response.credential);
            }
          },
          auto_select: false,
          itp_support: true,
          ux_mode: 'popup',
          context: 'signin',
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        }

        // One Tap (opcional)
        window.google.accounts.id.prompt();
        setGoogleLoaded(true);
      } catch (err) {
        console.error('Falha ao inicializar Google Identity:', err);
      }
    };

    // Se já está disponível
    if (window.google && window.google.accounts && GOOGLE_CLIENT_ID) {
      initGoogle();
      return;
    }

    // Injeta o script do GIS
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', initGoogle, { once: true });
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => !canceled && initGoogle();
      script.onerror = () => console.warn('Não foi possível carregar Google Identity Services.');
      document.head.appendChild(script);
    }

    return () => {
      canceled = true;
      try {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.cancel();
        }
      } catch { }
    };
  }, []);


  return (
    <div className="container-login">
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
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

        {/* Botão oficial do Google Identity Services */}
        <div
          ref={googleBtnRef}
          className='google-button'
          aria-label="Entrar com Google"
        />
        {!googleLoaded && (
          <p style={{ marginTop: 8, fontSize: 12, color: '#777' }}>
            Carregando botão do Google...
          </p>
        )}

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