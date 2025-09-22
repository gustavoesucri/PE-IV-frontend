import { useState } from "react";
import { X } from "lucide-react";
import styles from "./FollowUp.module.css";
import BackButton from "../../components/BackButton/BackButton";

const alunosMock = [
  { 
    id: 1, 
    nome: "Rodrigo Martins", 
    admissao: "2024-03-10", 
    empresa: "Tech Solutions", 
    rh: "Ana Pereira" 
  },
  { 
    id: 2, 
    nome: "Maria Silva", 
    admissao: "2024-05-22", 
    empresa: "Inova Ltda", 
    rh: "Carlos Oliveira" 
  },
  { 
    id: 3, 
    nome: "João Souza", 
    admissao: "2024-06-15", 
    empresa: "StartUpX", 
    rh: "Fernanda Costa" 
  }
];

const FollowUp = () => {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [contactWith, setContactWith] = useState("");
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [error, setError] = useState("");

  const selectedStudent = alunosMock.find(a => a.id === Number(selectedStudentId));

  const handleSave = () => {
    if (!selectedStudentId || !visitDate || !contactWith || !generalFeedback) {
      setError("Preencha todos os campos.");
      return;
    }
    setError("");
    setSuccessModal(true);
  };

  const closeModal = () => {
    setSuccessModal(false);
    setVisitDate("");
    setContactWith("");
    setGeneralFeedback("");
    setSelectedStudentId("");
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h1 className={styles.title}>Acompanhamento</h1>

      <div className={styles.formGroup}>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className={styles.input}
        >
          <option value="">Selecione...</option>
          {alunosMock.map(aluno => (
            <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <>
          <div className={styles.formGroup}>
            <label>Data de Admissão:</label>
            <div className={styles.readonly}>{selectedStudent.admissao}</div>
          </div>

          <div className={styles.formGroup}>
            <label>Empresa:</label>
            <div className={styles.readonly}>{selectedStudent.empresa}</div>
          </div>

          <div className={styles.formGroup}>
            <label>Responsável RH:</label>
            <div className={styles.readonly}>{selectedStudent.rh}</div>
          </div>

          <div className={styles.formGroup}>
            <label>Data da Visita:</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Contato com:</label>
            <input
              type="text"
              value={contactWith}
              onChange={(e) => setContactWith(e.target.value)}
              className={styles.input}
              placeholder="Ex: Supervisor, Gerente, RH..."
            />
          </div>

          <div className={styles.formGroupColumn}>
            <label>Parecer Geral:</label>
            <textarea
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
              className={styles.textarea}
              placeholder="Digite suas observações..."
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.button} onClick={handleSave}>
            Salvar
          </button>

          {successModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={closeModal}>
                  <X size={20} />
                </button>
                <h2 className={styles.modalTitle}>Acompanhamento Salvo</h2>
                <p>O acompanhamento do aluno foi salvo com sucesso!</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FollowUp;
