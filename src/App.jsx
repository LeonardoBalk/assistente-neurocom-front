import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/login/login.jsx";
import Chat from "./pages/chat/chat.jsx";
import Home from "./pages/home/home.jsx";
import Cadastro from "./pages/cadastro/cadastro.jsx";

// 🔒 Componente de rota protegida
function RotaProtegida({ children, logado }) {
  if (!logado) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 🌐 Componente de rota pública (não acessível se estiver logado)
function RotaPublica({ children, logado }) {
  if (logado) {
    return <Navigate to="/chat" replace />;
  }
  return children;
}

function App() {
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLogado(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route
          path="/login"
          element={
            <RotaPublica logado={logado}>
              <Login setLogado={setLogado} />
            </RotaPublica>
          }
        />
        <Route
         path="/cadastro"
       element={
      <RotaPublica logado={logado}>
      <Cadastro setLogado={setLogado} />
      </RotaPublica>
          }
        />

        {/* Rotas protegidas */}
        <Route
          path="/"
          element={
            <RotaProtegida logado={logado}>
              <Chat />
            </RotaProtegida>
          }
        />
        <Route
          path="/chat"
          element={
            <RotaProtegida logado={logado}>
              <Chat />
            </RotaProtegida>
          }
        />

        {/* Home pública */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
