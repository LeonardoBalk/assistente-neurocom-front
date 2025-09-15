import './cadastro.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Cadastro({ setLogado }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErro('');
    const nomeTrim = nome.trim();
    const emailTrim = email.trim();
    const senhaTrim = senha.trim();

    if (!nomeTrim || !emailTrim || !senhaTrim) {
      setErro('Preencha nome, email e senha.');
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/usuarios`, {
        nome: nomeTrim,
        email: emailTrim,
        senha: senhaTrim,
      });
      console.log('Resposta backend:', res.data);
      localStorage.setItem('token', res.data.token);
      setLogado(true);
      navigate('/');
    } catch (err) {
      console.log('Erro axios:', err.response ? err.response.data : err.message);
      setErro('Não foi possível realizar o cadastro. Verifique os dados e tente novamente.');
    }
  };

  // Exemplo: cadastro via Google (se implementar OAuth)
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  // Checa se veio token na URL (cadastro Google)
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
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <h1 className="title">Cadastro</h1>

        <input
          name="nome"
          type="text"
          placeholder="Nome completo"
          className="input"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          aria-label="Nome completo"
          autoComplete="name"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email"
          autoComplete="email"
        />

        <input
          name="senha"
          type="password"
          placeholder="Senha"
          className="input"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          aria-label="Senha"
          autoComplete="new-password"
        />

        <button type="button" className="button" onClick={handleLogin}>
          Cadastrar
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
        Já possui uma conta?
        <a href="/login" className="logar"> Fazer login</a>
      </div>
    </div>
  );
}

export default Cadastro;