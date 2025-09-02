import React, { useState } from "react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/administration");
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
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.loginBtn}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
