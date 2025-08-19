// src/pages/Login/Login.jsx
import React, { useState } from "react";
import styles from "./Login.module.css";
import Button from "../../components/Button/Button";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/administration");
  };

  return (
    <div className={styles.container}>
      <form className={styles.loginBox} onSubmit={handleSubmit}>
        <label htmlFor="nome">Nome:</label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <label htmlFor="senha">Senha:</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <Button type="submit" className={styles.loginButton}>Entrar</Button>
      </form>
    </div>
  );
};

export default Login;
