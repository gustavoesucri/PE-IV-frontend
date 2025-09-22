import { useState } from "react";
import styles from "./EmploymentPlacement.module.css";
import BackButton from "../../components/BackButton/BackButton";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/employment-placement-list");
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h1 className={styles.pageTitle}>Cadastro de Usuários Encaminhados</h1>

      <div className={styles.card}>
        <form className={styles.form}>
          {/* Nome */}
          <label className={styles.label}>Nome:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className={styles.input}
          >
            <option value="">Selecione...</option>
            {alunosMock.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.nome}
              </option>
            ))}
          </select>

          {/* Data de Admissão */}
          <label className={styles.label}>Data de Admissão:</label>
          <input
            type="date"
            value={admissao}
            onChange={(e) => setAdmissao(e.target.value)}
            className={styles.input}
          />

          {/* Empresa */}
          <label className={styles.label}>Empresa:</label>
          <select
            value={empresaId}
            onChange={(e) => setEmpresaId(e.target.value)}
            className={styles.input}
          >
            <option value="">Selecione...</option>
            {empresasMock.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nome}
              </option>
            ))}
          </select>

          {/* Função */}
          <label className={styles.label}>Função:</label>
          <input
            type="text"
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            className={styles.input}
            placeholder="Digite a função"
          />

          {/* Contato RH */}
          <label className={styles.label}>Contato RH:</label>
          <input
            type="text"
            value={contatoRh}
            onChange={(e) => setContatoRh(e.target.value)}
            className={styles.input}
            placeholder="Ex: Ana Pereira"
          />

          {/* Provável data desligamento */}
          <label className={styles.label}>Provável data desligamento IEEDF:</label>
          <input
            type="date"
            value={dataDesligamento}
            onChange={(e) => setDataDesligamento(e.target.value)}
            className={styles.input}
          />

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.button} type="button" onClick={handleSave}>
            Salvar
          </button>
        </form>

        <button className={styles.secondaryButton} onClick={handleNavigate}>
          Lista de Encaminhados
        </button>
      </div>

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
