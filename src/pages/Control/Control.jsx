import React, { useState } from "react";
import styles from "./Control.module.css";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import BackButton from "../../components/BackButton/BackButton";

const alunosMock = [
  { id: 1, nome: "Rodrigo Martins", status: { av1: true, av2: false, pais: true, pais2: false, resultado: "Aprovado" } },
  { id: 2, nome: "Maria Silva", status: { av1: true, av2: true, pais: true, pais2: true, resultado: "Em Experiência" } },
  { id: 3, nome: "João Souza", status: { av1: false, av2: false, pais: false, pais2: false, resultado: "" } }
];

const Control = () => {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [error, setError] = useState("");

  const selectedStudent = alunosMock.find(a => a.id === Number(selectedStudentId));

  const handleRegister = () => {
    if (!selectedStudentId || !entryDate) {
      setError("Preencher Data");
      return;
    }

    setSuccessModal(true);
    setError("");
  };

  const closeModal = () => {
    setSuccessModal(false);
  };

  return (
    <div className={styles.container}>
    <BackButton />
      <h1 className={styles.title}>Controle Interno</h1>

      <div className={styles.formGroup}>
        <label>Selecionar Aluno:</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className={styles.select}
        >
          <option value="">Selecione...</option>
          {alunosMock.map(aluno => (
            <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Data de Entrada:</label>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className={styles.input}
        />
      </div>

      {selectedStudent && (
        <>
          <div className={styles.statusRow}>
            <div className={styles.statusBox}>
              <span>Avaliação 1:</span>
              {selectedStudent.status.av1 ? (
                <FiCheckCircle className={styles.iconGreen} />
              ) : (
                <FiXCircle className={styles.iconRed} />
              )}
            </div>
            <div className={styles.statusBox}>
              <span>Avaliação 2:</span>
              {selectedStudent.status.av2 ? (
                <FiCheckCircle className={styles.iconGreen} />
              ) : (
                <FiXCircle className={styles.iconRed} />
              )}
            </div>
          </div>

          <div className={styles.statusRow}>
            <div className={styles.statusBox}>
              <span>Entrevista com Pais:</span>
              {selectedStudent.status.pais ? (
                <FiCheckCircle className={styles.iconGreen} />
              ) : (
                <FiXCircle className={styles.iconRed} />
              )}
            </div>
            <div className={styles.statusBox}>
              <span>Entrevista com Pais 2:</span>
              {selectedStudent.status.pais2 ? (
                <FiCheckCircle className={styles.iconGreen} />
              ) : (
                <FiXCircle className={styles.iconRed} />
              )}
            </div>
          </div>

          <div className={styles.resultado}>
            <span>Resultado:</span>
            <span className={styles.resultadoValor}>
              {successModal ? "Em Experiência" : selectedStudent.status.resultado || ""}
            </span>
          </div>
        </>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <button className={styles.button} onClick={handleRegister}>
        Registrar Aluno em Experiência
      </button>

      {successModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p>Registrado com Sucesso!</p>
            <button className={styles.modalButton} onClick={closeModal}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Control;
