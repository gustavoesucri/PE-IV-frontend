import { useState } from "react";
import { X } from "lucide-react";
import styles from "./FollowUp.module.css";
import Menu from "../../components/Menu/Menu";

const alunosMock = [
  { id: 1, nome: "Rodrigo Martins", admissao: "2024-03-10", empresa: "Tech Solutions", rh: "Ana Pereira" },
  { id: 2, nome: "Maria Silva", admissao: "2024-05-22", empresa: "Inova Ltda", rh: "Carlos Oliveira" },
  { id: 3, nome: "João Souza", admissao: "2024-06-15", empresa: "StartUpX", rh: "Fernanda Costa" }
];

// === MOCK DE REGISTROS (futuro: localStorage ou backend) ===
const initialRegistros = [
  {
    alunoId: 1,
    dataVisita: "2024-07-15",
    contatoCom: "Gerente Pedro",
    parecer: "Aluno adaptado, bom desempenho. Sugestão: mais autonomia em tarefas complexas.",
    dataRegistro: "2024-07-16"
  },
  {
    alunoId: 1,
    dataVisita: "2024-08-10",
    contatoCom: "RH Ana",
    parecer: "Melhora significativa. Recomenda-se promoção de cargo.",
    dataRegistro: "2024-08-11"
  },
  {
    alunoId: 2,
    dataVisita: "2024-06-20",
    contatoCom: "Supervisor Carla",
    parecer: "Primeira semana com dificuldades de pontualidade. Acompanhar.",
    dataRegistro: "2024-06-21"
  }
];

const FollowUp = () => {
  // === ESTADOS PRINCIPAIS ===
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [contactWith, setContactWith] = useState("");
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  // === ESTADOS DO MODAL INTERNO ===
  const [viewMode, setViewMode] = useState("form"); // "form" | "lista" | "visualizar"
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [registros, setRegistros] = useState(initialRegistros);

  const selectedStudent = alunosMock.find(a => a.id === Number(selectedStudentId));

  // === FUNÇÕES ===
  const handleSave = () => {
    if (!selectedStudentId || !visitDate || !contactWith || !generalFeedback) {
      setError("Preencha todos os campos.");
      return;
    }

    const novoRegistro = {
      alunoId: Number(selectedStudentId),
      dataVisita: visitDate,
      contatoCom: contactWith,
      parecer: generalFeedback,
      dataRegistro: new Date().toISOString().split("T")[0]
    };

    setRegistros(prev => [...prev, novoRegistro]);
    setError("");
    setSuccessModal(true);
  };

  const closeModal = () => {
    setSuccessModal(false);
    setVisitDate("");
    setContactWith("");
    setGeneralFeedback("");
  };

  const abrirLista = () => {
    if (!selectedStudentId) {
      setError("Selecione um aluno para ver os registros.");
      return;
    }
    setViewMode("lista");
  };

  const abrirVisualizacao = (registro) => {
    setSelectedRegistro(registro);
    setViewMode("visualizar");
  };

  const voltar = () => {
    if (viewMode === "visualizar") {
      setViewMode("lista");
    } else if (viewMode === "lista") {
      setViewMode("form");
    }
  };

  const registrosDoAluno = registros
    .filter(r => r.alunoId === Number(selectedStudentId))
    .sort((a, b) => b.dataRegistro.localeCompare(a.dataRegistro));

  // === RENDERIZAÇÃO CONDICIONAL ===
  return (
    <div className={styles.container}>
      <Menu />
      <h1 className={styles.title}>Acompanhamento</h1>

      {/* === ESTADO 1: FORMULÁRIO === */}
      {viewMode === "form" && (
        <>
          <div className={styles.formGroup}>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className={styles.input}
            >
              <option value="">-- Selecione um aluno(a)...</option>
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

              <div className={styles.buttonGroup}>
                <button className={styles.button} onClick={handleSave}>
                  Salvar
                </button>
                <button className={styles.button} onClick={abrirLista}>
                  Registros
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* === ESTADO 2: LISTA DE REGISTROS === */}
      {viewMode === "lista" && (
        <div className={styles.registroLista}>
          <h2 className={styles.subtitle}>Registros de {selectedStudent?.nome}</h2>

          {registrosDoAluno.length === 0 ? (
            <p className={styles.empty}>Nenhum registro encontrado.</p>
          ) : (
            <div className={styles.lista}>
              {registrosDoAluno.map((reg, idx) => (
                <div key={idx} className={styles.registroItem}>
                  <div>
                    <strong>{reg.dataVisita}</strong> → {reg.contatoCom}
                  </div>
                  <button
                    className={styles.viewButton}
                    onClick={() => abrirVisualizacao(reg)}
                  >
                    Visualizar
                  </button>
                </div>
              ))}
            </div>
          )}

          <button className={styles.button} onClick={voltar}>
            Voltar
          </button>
        </div>
      )}

      {/* === ESTADO 3: VISUALIZAR REGISTRO === */}
{viewMode === "visualizar" && selectedRegistro && (
  <div className={styles.registroVisualizacao}>
    <h2 className={styles.subtitle}>Registro - {selectedRegistro.dataVisita}</h2>

    {/* Dados do Aluno */}
    <div className={styles.formGroup}>
      <label>Aluno:</label>
      <div className={styles.readonly}>{selectedStudent?.nome}</div>
    </div>

    <div className={styles.formGroup}>
      <label>Data de Admissão:</label>
      <div className={styles.readonly}>{selectedStudent?.admissao}</div>
    </div>

    <div className={styles.formGroup}>
      <label>Empresa:</label>
      <div className={styles.readonly}>{selectedStudent?.empresa}</div>
    </div>

    <div className={styles.formGroup}>
      <label>Responsável RH:</label>
      <div className={styles.readonly}>{selectedStudent?.rh}</div>
    </div>

    {/* Dados do Registro */}
    <div className={styles.formGroup}>
      <label>Data da Visita:</label>
      <div className={styles.readonly}>{selectedRegistro.dataVisita}</div>
    </div>

    <div className={styles.formGroup}>
      <label>Contato com:</label>
      <div className={styles.readonly}>{selectedRegistro.contatoCom}</div>
    </div>

    <div className={styles.formGroupColumn}>
      <label>Parecer Geral:</label>
      <textarea
        value={selectedRegistro.parecer}
        readOnly
        className={`${styles.textarea} ${styles.readonlyTextarea}`}
      />
    </div>

    <div className={styles.formGroup}>
      <label>Registrado em:</label>
      <div className={styles.readonly}>{selectedRegistro.dataRegistro}</div>
    </div>

    <div className={styles.buttonGroup}>
      <button className={styles.button} onClick={voltar}>
        Voltar
      </button>
    </div>
  </div>
)}

      {/* === MODAL DE SUCESSO === */}
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
    </div>
  );
};

export default FollowUp;