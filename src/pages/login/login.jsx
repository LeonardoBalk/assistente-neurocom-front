import './login.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


function Login({ setLogado }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
  try {
    const res = await axios.post(`${BACKEND_URL}/login`, { email, senha });
    console.log('Resposta backend:', res.data); // <-- verifique aqui
    localStorage.setItem('token', res.data.token);
    setLogado(true);
    navigate('/');
  } catch (err) {
    // Mostra o erro completo
    console.log('Erro axios:', err.response ? err.response.data : err.message);
    setErro('Email ou senha inválidos');
  }
};

  // Exemplo: login via Google (se implementar OAuth)
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  // Checa se veio token na URL (login Google)
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
    <div className="container-login">
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <h1 className="title">Login</h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          name="senha"
          type="password"
          placeholder="Senha"
          className="input"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button type="button" className="button" onClick={handleLogin}>
          Entrar
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
