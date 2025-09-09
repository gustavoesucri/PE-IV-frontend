import React from "react";
import styles from "./Students.module.css";
import BackButton from "../../components/BackButton/BackButton";
import { useNavigate } from "react-router-dom";

const Students = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/students-list");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // lógica futura para salvar no back-end
    alert("Aluno cadastrado com sucesso!");
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h1 className={styles.pageTitle}>Sistema de Gestão de Alunos</h1>

      <div className={styles.card}>
        <h2 className={styles.title}>Cadastro de Alunos</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Nome */}
          <label className={styles.label} htmlFor="nome">
            Nome do aluno(a):
          </label>
          <input
            className={styles.input}
            id="nome"
            name="nome"
            type="text"
            placeholder="Digite o nome"
            required
          />

          {/* Data de Nascimento */}
          <label className={styles.label} htmlFor="dataNascimento">
            Data de Nascimento:
          </label>
          <input
            className={styles.input}
            id="dataNascimento"
            name="dataNascimento"
            type="date"
            required
          />

          {/* Observações */}
          <label className={styles.label} htmlFor="observacoes">
            Observações:
          </label>
          <textarea
            className={styles.textarea}
            id="observacoes"
            name="observacoes"
            placeholder="Digite observações importantes..."
            rows="4"
          />

          <button className={styles.button} type="submit">
            Cadastrar
          </button>
        </form>

        <button className={styles.secondaryButton} onClick={handleNavigate}>
          Listar alunos cadastrados
        </button>
      </div>
    </div>
  );
};

export default Students;
