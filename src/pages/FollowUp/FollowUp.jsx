import { useState, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./FollowUp.module.css";
import Menu from "../../components/Menu/Menu";
import api from "../../api";

const FollowUp = () => {
  // === ESTADOS PRINCIPAIS ===
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [contactWith, setContactWith] = useState("");
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});

  // === ESTADOS DO MODAL INTERNO ===
  const [viewMode, setViewMode] = useState("form"); // "form" | "lista" | "visualizar"
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [students, setStudents] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [companies, setCompanies] = useState([]);

  // === MODAIS DE MENSAGEM ===
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

  // === MODAL DE CONFIRMAÇÃO DE DELEÇÃO ===
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [registroToDelete, setRegistroToDelete] = useState(null);

  const showMessage = (message, type = "error") => {
    setModalMessage(message);
    setModalType(type);
    setIsMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setModalMessage("");
    setModalType("");
  };

  // Carregar permissões e dados
  useEffect(() => {
    const loadUserPermissionsAndData = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);

          // Carregar permissões do cargo
          const rolePermsResponse = await api.get(`/api/rolePermissions?role=${user.role}`);
          let rolePermissions = {};
          if (rolePermsResponse.data.length > 0) {
            rolePermissions = rolePermsResponse.data[0].permissions;
          }

          // Carregar permissões específicas do usuário
          const userPermsResponse = await api.get(`/api/userSpecificPermissions?userId=${user.id}`);
          let userSpecificPermissions = {};
          if (userPermsResponse.data.length > 0) {
            userSpecificPermissions = userPermsResponse.data[0].permissions;
          }

          // Combinar permissões (usuário sobrepõe cargo)
          const finalPermissions = { ...rolePermissions };
          Object.keys(userSpecificPermissions).forEach(perm => {
            if (userSpecificPermissions[perm] !== null) {
              finalPermissions[perm] = userSpecificPermissions[perm];
            }
          });

          setUserPermissions(finalPermissions);

          // SEMPRE carregar os dados, independente das permissões
          // Carregar estudantes, empresas e encaminhamentos
          try {
            const studentsResponse = await api.get('/api/students');
            setStudents(studentsResponse.data);

            const companiesResponse = await api.get('/api/companies');
            setCompanies(companiesResponse.data);

            const placementsResponse = await api.get('/api/placements');
            setPlacements(placementsResponse.data);
          } catch (error) {
            console.error("Erro ao carregar dados:", error);
            showMessage("Erro ao carregar dados dos alunos.", "error");
          }

          // Carregar registros de acompanhamento
          try {
            const response = await api.get('/api/followUps');
            setRegistros(response.data);
          } catch (error) {
            console.error("Erro ao carregar registros:", error);
            // Em caso de erro, usar dados vazios
            setRegistros([]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
        showMessage("Erro ao carregar permissões do usuário.", "error");
      }
    };

    loadUserPermissionsAndData();
  }, []);

  const selectedStudent = students.find(a => a.id === Number(selectedStudentId));
  const studentPlacement = placements.find(p => p.studentId === Number(selectedStudentId));
  const studentCompany = companies.find(c => c.id === studentPlacement?.empresaId);

  // === FUNÇÕES ===
  const handleSave = async () => {
    // Verificar permissão para criar observações
    if (!userPermissions.create_observations) {
      showMessage("Você não tem permissão para criar observações de acompanhamento. Se algo estiver errado consulte o Diretor.");
      return;
    }

    if (!selectedStudentId || !visitDate || !contactWith || !generalFeedback) {
      setError("Preencha todos os campos.");
      return;
    }

    // Verificar se já existe acompanhamento para este aluno na mesma data
    const acompanhamentoExistente = registros.find(
      r => r.alunoId === Number(selectedStudentId) && r.dataVisita === visitDate
    );

    if (acompanhamentoExistente) {
      showMessage(`Já existe um acompanhamento feito do aluno "${selectedStudent?.nome}" nesta data.`);
      return;
    }

    try {
      const savedUser = localStorage.getItem("user");
      const user = savedUser ? JSON.parse(savedUser) : null;

      const novoRegistro = {
        alunoId: Number(selectedStudentId),
        dataVisita: visitDate,
        contatoCom: contactWith,
        parecer: generalFeedback,
        dataRegistro: new Date().toISOString().split("T")[0],
        createdBy: user ? user.id : null
      };

      // Salvar no backend
      const response = await api.post('/api/followUps', novoRegistro);

      // Atualizar lista local
      setRegistros(prev => [...prev, response.data]);
      setError("");
      setSuccessModal(true);
      
      // Limpar formulário
      setVisitDate("");
      setContactWith("");
      setGeneralFeedback("");
    } catch (error) {
      console.error("Erro ao salvar acompanhamento:", error);
      if (error.response && error.response.status === 403) {
        showMessage("Acesso negado. Você não tem permissão para esta ação.");
      } else {
        showMessage("Erro ao salvar acompanhamento. Tente novamente.");
      }
    }
  };

  const handleDeleteClick = (registro) => {
    // Verificar permissão para criar observações (mesma permissão para deletar)
    if (!userPermissions.create_observations) {
      showMessage("Você não tem permissão para deletar observações de acompanhamento. Se algo estiver errado consulte o Diretor.");
      return;
    }

    setRegistroToDelete(registro);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!registroToDelete) return;

    try {
      // Deletar do backend
      await api.delete(`/api/followUps/${registroToDelete.id}`);

      // Atualizar lista local
      setRegistros(prev => prev.filter(r => r.id !== registroToDelete.id));
      showMessage("Registro deletado com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao deletar registro:", error);
      if (error.response && error.response.status === 403) {
        showMessage("Acesso negado. Você não tem permissão para esta ação.");
      } else {
        showMessage("Erro ao deletar registro. Tente novamente.");
      }
    } finally {
      setIsDeleteModalOpen(false);
      setRegistroToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setRegistroToDelete(null);
  };

  const closeModal = () => {
    setSuccessModal(false);
  };

  const abrirLista = () => {
    if (!selectedStudentId) {
      setError("Selecione um aluno para ver os registros.");
      return;
    }
    
    // Verificar permissão para visualizar observações
    if (!userPermissions.view_observations) {
      showMessage("Você não tem permissão para visualizar observações de acompanhamento. Se algo estiver errado consulte o Diretor.");
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
              {students.map(aluno => (
                <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <>
              <div className={styles.formGroup}>
                <label>Data de Admissão:</label>
                <div className={styles.readonly}>
                  {studentPlacement ? studentPlacement.dataAdmissao : "Não encaminhado"}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Empresa:</label>
                <div className={styles.readonly}>
                  {studentCompany ? studentCompany.nome : "Não encaminhado"}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Responsável RH:</label>
                <div className={styles.readonly}>
                  {studentPlacement ? studentPlacement.contatoRh : "Não encaminhado"}
                </div>
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
                <button 
                  className={styles.button} 
                  onClick={handleSave}
                >
                  Salvar
                </button>
                <button 
                  className={styles.button} 
                  onClick={abrirLista}
                >
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
              {registrosDoAluno.map((reg) => (
                <div key={reg.id} className={styles.registroItem}>
                  <div>
                    <strong>{reg.dataVisita}</strong> → {reg.contatoCom}
                  </div>
                  <div className={styles.registroActions}>
                    <button
                      className={styles.viewButton}
                      onClick={() => abrirVisualizacao(reg)}
                    >
                      Visualizar
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteClick(reg)}
                    >
                      Deletar
                    </button>
                  </div>
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
            <div className={styles.readonly}>
              {studentPlacement ? studentPlacement.dataAdmissao : "Não encaminhado"}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Empresa:</label>
            <div className={styles.readonly}>
              {studentCompany ? studentCompany.nome : "Não encaminhado"}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Responsável RH:</label>
            <div className={styles.readonly}>
              {studentPlacement ? studentPlacement.contatoRh : "Não encaminhado"}
            </div>
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

      {/* Modal de Confirmação de Deleção */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#dc3545' }}>Confirmar Deleção</h2>
              <button className={styles.modalClose} onClick={handleDeleteCancel}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p style={{ margin: '1rem 0', fontSize: '1rem', lineHeight: '1.5' }}>
                Tem certeza que deseja deletar o registro de acompanhamento do dia <strong>"{registroToDelete?.dataVisita}"</strong>?
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={handleDeleteConfirm}
                className={styles.deleteButton}
              >
                Sim, Deletar
              </button>
              <button
                onClick={handleDeleteCancel}
                className={styles.filterButton}
                style={{ backgroundColor: 'var(--cinza)', color: 'var(--preto)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Mensagem */}
      {isMessageModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={modalType === "success" ? styles.modalSuccessTitle : styles.modalErrorTitle}>
                {modalType === "success" ? "Sucesso" : "Aviso"}
              </h2>
              <button className={styles.modalClose} onClick={closeMessageModal}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>{modalMessage}</p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.modalButton} ${modalType === "success" ? styles.modalSuccessButton : styles.modalErrorButton}`}
                onClick={closeMessageModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUp;