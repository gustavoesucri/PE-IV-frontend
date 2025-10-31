import React, { useState } from "react";
import InputMask from "react-input-mask";
import styles from "./Students.module.css";
import { useNavigate } from "react-router-dom";
import Menu from "../../components/Menu/Menu";

const Students = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    dataIngresso: "",
    observacao: "",
    observacoesDetalhadas: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Aluno cadastrado com sucesso!");
    setFormData({
      nome: "",
      cpf: "",
      dataNascimento: "",
      dataIngresso: "",
      observacao: "",
      observacoesDetalhadas: "",
    });
  };

  const handleNavigate = () => {
    navigate("/students-list");
  };

  return (
    <div className={styles.container}>
      <Menu />
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
            value={formData.nome}
            onChange={handleChange}
            required
          />

          {/* CPF */}
          <label className={styles.label} htmlFor="cpf">
            CPF:
          </label>
          <InputMask
            mask="999.999.999-99"
            className={styles.input}
            id="cpf"
            name="cpf"
            placeholder="Digite o CPF"
            value={formData.cpf}
            onChange={handleChange}
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
            value={formData.dataNascimento}
            onChange={handleChange}
            required
          />

          {/* Data de Ingresso */}
          <label className={styles.label} htmlFor="dataIngresso">
            Data de Ingresso no Instituto:
          </label>
          <input
            className={styles.input}
            id="dataIngresso"
            name="dataIngresso"
            type="date"
            value={formData.dataIngresso}
            onChange={handleChange}
            required
          />

          {/* Observação curta */}
          <label className={styles.label} htmlFor="observacao">
            Observação (curta):
          </label>
          <input
            className={styles.input}
            id="observacao"
            name="observacao"
            type="text"
            placeholder="Digite uma observação breve"
            value={formData.observacao}
            onChange={handleChange}
          />

          {/* Observações detalhadas */}
          <label className={styles.label} htmlFor="observacoesDetalhadas">
            Observações detalhadas:
          </label>
          <textarea
            className={styles.textarea}
            id="observacoesDetalhadas"
            name="observacoesDetalhadas"
            placeholder="Digite observações detalhadas sobre o aluno..."
            rows="4"
            value={formData.observacoesDetalhadas}
            onChange={handleChange}
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
