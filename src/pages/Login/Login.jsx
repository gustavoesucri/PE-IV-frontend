// src/pages/Login/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import api from "../../api";
import ForgotPasswordModal from "../../components/ForgotPasswordModal";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await api.post("/auth/login", { username, password });

    localStorage.setItem("token", response.data.accessToken);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    navigate("/administration");
  } catch (err) {
    // Garante que NÃO redireciona aqui
    console.log("Erro de login:", err.message);
    const errorMessage = err.response?.data?.message || err.message || "Usuário ou senha inválidos";
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.loginPage}>
      <h2 className={styles.systemTitle}>Sistema de Gestão de Alunos</h2>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Bem-vindo</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            required
            disabled={loading}
            autoFocus
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
            disabled={loading}
          />

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className={styles.hint}>
          <button
            type="button"
            className={styles.forgotPasswordLink}
            onClick={() => setShowForgotPassword(true)}
          >
            Esqueceu a senha?
          </button>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Login;