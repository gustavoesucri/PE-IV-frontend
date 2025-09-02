import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton/BackButton";
import styles from "./EditStudent.module.css";

const EditStudent = () => {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Dados atualizados!");
    // Aqui você pode salvar os dados de fato
  };

  const handleDelete = () => {
    const confirmed = window.confirm(`Tem certeza que deseja excluir ${decodedName}?`);
    if (confirmed) {
      // Aqui você faz a exclusão (API, estado, etc)
      alert(`${decodedName} excluído com sucesso!`);
      navigate('/students'); // Redireciona para a lista, por exemplo
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h1 className={styles.title}>Editar Aluno</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Nome completo:
          <input type="text" defaultValue={decodedName} className={styles.input} />
        </label>

        <div className={styles.buttonsContainer}>
          <button type="submit" className={styles.button}>Salvar</button>
          <button
            type="button"
            className={styles.button}
            onClick={handleDelete}
          >
            Excluir
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStudent;
