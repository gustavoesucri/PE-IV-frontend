import { useState } from "react";
import styles from "./EmploymentPlacement.module.css";
import BackButton from "../../components/BackButton/BackButton";

const empresasMock = [
  { id: 1, nome: "Tech Solutions" },
  { id: 2, nome: "Inova Ltda" },
  { id: 3, nome: "StartUpX" }
];

const alunosMock = [
  { id: 1, nome: "Rodrigo Martins", admissao: "2024-03-10" },
  { id: 2, nome: "Maria Silva", admissao: "2024-05-22" },
  { id: 3, nome: "João Souza", admissao: "2024-06-15" }
];

const EmploymentPlacement = () => {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [admissao, setAdmissao] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [funcao, setFuncao] = useState("");
  const [contatoRh, setContatoRh] = useState("");
  const [dataDesligamento, setDataDesligamento] = useState("");
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  const handleSave = () => {
    if (!selectedStudentId || !admissao || !empresaId || !funcao || !contatoRh || !dataDesligamento) {
      setError("Preencha todos os campos.");
      return;
    }
    setError("");
    setSuccessModal(true);
  };

  const closeModal = () => setSuccessModal(false);

  return (
    <div className={styles.container}>
      <BackButton />
      <h1 className={styles.title}>Cadastro de Usuários Encaminhados</h1>

      <div className={styles.formGroup}>
        <label>Nome:</label>
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
        <label>Data de Admissão:</label>
        <input
          type="date"
          value={admissao}
          onChange={(e) => setAdmissao(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Empresa:</label>
        <select
          value={empresaId}
          onChange={(e) => setEmpresaId(e.target.value)}
          className={styles.select}
        >
          <option value="">Selecione...</option>
          {empresasMock.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.nome}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Função:</label>
        <input
          type="text"
          value={funcao}
          onChange={(e) => setFuncao(e.target.value)}
          className={styles.input}
          placeholder="Digite a função"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Contato RH:</label>
        <input
          type="text"
          value={contatoRh}
          onChange={(e) => setContatoRh(e.target.value)}
          className={styles.input}
          placeholder="Ex: Ana Pereira"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Provável data desligamento IEEDF:</label>
        <input
          type="date"
          value={dataDesligamento}
          onChange={(e) => setDataDesligamento(e.target.value)}
          className={styles.input}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button className={styles.button} onClick={handleSave}>
        Salvar
      </button>

      {successModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p>Cadastro salvo com sucesso!</p>
            <button className={styles.modalButton} onClick={closeModal}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmploymentPlacement;
