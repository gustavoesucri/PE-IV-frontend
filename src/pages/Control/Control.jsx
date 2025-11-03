import React, { useState, useEffect, useCallback } from "react";
import styles from "./Control.module.css";
import Menu from "../../components/Menu/Menu";
import { X } from "lucide-react";
import api from "../../api";

const Control = () => {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [deletingData, setDeletingData] = useState(null);
  const [dateFilterType, setDateFilterType] = useState("dataIngresso");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [userPermissions, setUserPermissions] = useState({});

  const [students, setStudents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [controls, setControls] = useState([]);

  const [formData, setFormData] = useState({
    dataEntrevista1: "",
    dataEntrevista2: "",
    dataResultado: "",
    resultado: ""
  });

  // Criar estrutura de dados do estudante com todas as informações
  const createStudentData = useCallback((student) => {
    const studentAssessments = assessments.filter(a => a.studentId === student.id);
    const primeiraAval = studentAssessments.find(a => a.evaluationType === "primeira");
    const segundaAval = studentAssessments.find(a => a.evaluationType === "segunda");
    const control = controls.find(c => c.studentId === student.id);

    return {
      studentId: student.id,
      nome: student.nome,
      dataIngresso: student.dataIngresso,
      dataAvaliacao1: primeiraAval ? primeiraAval.assessmentDate : "",
      dataAvaliacao2: segundaAval ? segundaAval.assessmentDate : "",
      dataEntrevista1: control?.dataEntrevista1 || "",
      dataEntrevista2: control?.dataEntrevista2 || "",
      dataResultado: control?.dataResultado || "",
      resultado: control?.resultado || "Pendente",
      controlId: control?.id
    };
  }, [assessments, controls]);

  // Carregar permissões e dados
  useEffect(() => {
    const loadData = async () => {
      try {
        const studentsResponse = await api.get('/api/students');
        setStudents(studentsResponse.data);
        
        // Carregar outros dados em paralelo
        await Promise.all([
          loadAssessments(),
          loadControls()
        ]);

        // Criar dados iniciais após carregar tudo
        const initialData = studentsResponse.data.map(student => createStudentData(student));
        setFilteredData(initialData);
      } catch (error) {
        console.error("Erro ao carregar estudantes:", error);
        showMessage("Erro ao carregar lista de controle.", "error");
      }
    };

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

          // Carregar dados apenas se tiver permissão para visualizar
          if (finalPermissions.view_control) {
            await loadData();
          }
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
        showMessage("Erro ao carregar permissões do usuário.", "error");
      }
    };

    loadUserPermissionsAndData();
  }, []);

  const loadAssessments = async () => {
    try {
      const response = await api.get('/api/assessments');
      setAssessments(response.data);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
    }
  };

  const loadControls = async () => {
    try {
      const response = await api.get('/api/controls');
      setControls(response.data);
    } catch (error) {
      console.error("Erro ao carregar controles:", error);
      // Se não existir controles ainda, é normal
    }
  };

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

  const handleFilter = () => {
    if (!validateDates()) return;

    let results = students.map(student => createStudentData(student));

    if (search) {
      results = results.filter((s) =>
        s.nome.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (dateFrom || dateTo) {
      results = results.filter((s) => {
        const dateValue = s[dateFilterType] ? new Date(s[dateFilterType]) : null;
        if (!dateValue) return false;

        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;

        if (from && dateValue < from) return false;
        if (to && dateValue > to) return false;
        return true;
      });
    }

    setFilteredData(results);
  };

  const handleEditClick = (data) => {
    // Verificar permissão para editar controle
    if (!userPermissions.view_control) {
      showMessage("Você não tem permissão para editar controles. Se algo estiver errado consulte o Diretor.");
      return;
    }

    setEditingData(data);
    setFormData({
      dataEntrevista1: data.dataEntrevista1 || "",
      dataEntrevista2: data.dataEntrevista2 || "",
      dataResultado: data.dataResultado || "",
      resultado: data.resultado || ""
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (data) => {
    // Verificar permissão para deletar controle
    if (!userPermissions.view_control) {
      showMessage("Você não tem permissão para deletar controles. Se algo estiver errado consulte o Diretor.");
      return;
    }

    setDeletingData(data);
    setIsDeleteModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingData(null);
    setFormData({
      dataEntrevista1: "",
      dataEntrevista2: "",
      dataResultado: "",
      resultado: ""
    });
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingData(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const savedUser = localStorage.getItem("user");
      const user = savedUser ? JSON.parse(savedUser) : null;

      if (editingData.controlId) {
        // Atualizar controle existente
        await api.patch(`/api/controls/${editingData.controlId}`, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Criar novo controle
        await api.post('/api/controls', {
          studentId: editingData.studentId,
          dataIngresso: editingData.dataIngresso,
          ...formData,
          createdAt: new Date().toISOString(),
          createdBy: user ? user.id : null
        });
      }

      // Recarregar controles
      await loadControls();
      
      // Atualizar lista local
      const updatedData = filteredData.map(item => 
        item.studentId === editingData.studentId 
          ? { ...item, ...formData, controlId: editingData.controlId || Date.now() }
          : item
      );
      setFilteredData(updatedData);

      showMessage("Controle atualizado com sucesso!", "success");
      handleCloseEditModal();
    } catch (error) {
      console.error("Erro ao salvar controle:", error);
      if (error.response && error.response.status === 403) {
        showMessage("Acesso negado. Você não tem permissão para esta ação.");
      } else {
        showMessage("Erro ao salvar controle. Tente novamente.");
      }
    }
  };

  const handleDelete = async () => {
    try {
      if (deletingData.controlId) {
        await api.delete(`/api/controls/${deletingData.controlId}`);
      }

      // Recarregar controles
      await loadControls();
      
      // Atualizar lista local
      const updatedData = filteredData.map(item => 
        item.studentId === deletingData.studentId 
          ? { 
              ...item, 
              dataEntrevista1: "",
              dataEntrevista2: "",
              dataResultado: "",
              resultado: "Pendente",
              controlId: null
            }
          : item
      );
      setFilteredData(updatedData);

      handleCloseDeleteModal();
      showMessage("Controle deletado com sucesso!", "success");

    } catch (error) {
      console.error("Erro ao deletar controle:", error);
      if (error.response && error.response.status === 403) {
        showMessage("Acesso negado. Você não tem permissão para esta ação.");
      } else {
        showMessage("Erro ao deletar controle. Tente novamente.");
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const validateDates = () => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      showMessage("A data inicial não pode ser maior que a data final.");
      return false;
    }
    return true;
  };

  const handleClear = () => {
    setSearch("");
    setDateFilterType("dataIngresso");
    setDateFrom("");
    setDateTo("");
    const allData = students.map(student => createStudentData(student));
    setFilteredData(allData);
  };

  const displayDate = (dateStr) => {
    return dateStr ? formatDate(dateStr) : "-";
  };

  return (
    <div className={styles.container}>
      <Menu />
      <h1 className={styles.title}>Controle de Alunos</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input}
        />

        <select
          value={dateFilterType}
          onChange={(e) => setDateFilterType(e.target.value)}
          className={styles.input}
        >
          <option value="dataIngresso">Data de Ingresso</option>
          <option value="dataAvaliacao1">Avaliação 1</option>
          <option value="dataAvaliacao2">Avaliação 2</option>
          <option value="dataEntrevista1">Entrevista Pais 1</option>
          <option value="dataEntrevista2">Entrevista Pais 2</option>
          <option value="dataResultado">Resultado</option>
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={styles.input}
        />
        <span className={styles.rangeSeparator}>até</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={styles.input}
        />

        <button onClick={handleFilter} className={styles.filterButton}>
          Filtrar
        </button>
        <button onClick={handleClear} className={styles.clearButton}>
          Limpar
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {userPermissions.view_control ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Ingresso</th>
                <th>Avaliação 1</th>
                <th>Avaliação 2</th>
                <th>Entrevista Pais 1</th>
                <th>Entrevista Pais 2</th>
                <th>Resultado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((data) => (
                  <tr key={data.studentId}>
                    <td>{data.nome}</td>
                    <td>{displayDate(data.dataIngresso)}</td>
                    <td>{displayDate(data.dataAvaliacao1)}</td>
                    <td>{displayDate(data.dataAvaliacao2)}</td>
                    <td>{displayDate(data.dataEntrevista1)}</td>
                    <td>{displayDate(data.dataEntrevista2)}</td>
                    <td>{data.resultado}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleEditClick(data)}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteClick(data)}
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.noData}>
                    Nenhum registro encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className={styles.noPermissionMessage}>
            Não foi possível carregar a visualização devido a falta de permissões, se for um problema, consulte o diretor.
          </div>
        )}
      </div>

      {/* Modal de Edição/Visualização */}
      {isEditModalOpen && editingData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Controle do Aluno</h2>
              <button className={styles.modalClose} onClick={handleCloseEditModal}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <label>Nome:</label>
              <div className={styles.readonlyField}>{editingData.nome}</div>

              <label>Data de Ingresso:</label>
              <div className={styles.readonlyField}>{displayDate(editingData.dataIngresso)}</div>

              <label>Data da 1ª Avaliação:</label>
              <div className={styles.readonlyField}>{displayDate(editingData.dataAvaliacao1)}</div>

              <label>Data da 2ª Avaliação:</label>
              <div className={styles.readonlyField}>{displayDate(editingData.dataAvaliacao2)}</div>

              <label htmlFor="dataEntrevista1">Data da 1ª Entrevista com Pais:</label>
              <input
                id="dataEntrevista1"
                type="date"
                name="dataEntrevista1"
                value={formData.dataEntrevista1}
                onChange={handleChange}
                className={styles.input}
              />

              <label htmlFor="dataEntrevista2">Data da 2ª Entrevista com Pais:</label>
              <input
                id="dataEntrevista2"
                type="date"
                name="dataEntrevista2"
                value={formData.dataEntrevista2}
                onChange={handleChange}
                className={styles.input}
              />

              <label htmlFor="dataResultado">Data do Resultado:</label>
              <input
                id="dataResultado"
                type="date"
                name="dataResultado"
                value={formData.dataResultado}
                onChange={handleChange}
                className={styles.input}
              />

              <label htmlFor="resultado">Resultado:</label>
              <select
                id="resultado"
                name="resultado"
                value={formData.resultado}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">Selecione...</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Reprovado">Reprovado</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={handleSave} className={styles.filterButton}>
                Salvar
              </button>
              <button onClick={handleCloseEditModal} className={styles.clearButton}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Deleção */}
      {isDeleteModalOpen && deletingData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#dc3545' }}>Confirmar Deleção</h2>
              <button className={styles.modalClose} onClick={handleCloseDeleteModal}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p style={{ margin: '1rem 0', fontSize: '1rem', lineHeight: '1.5' }}>
                Tem certeza que deseja deletar o controle de <strong>"{deletingData.nome}"</strong>?
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Esta ação irá remover todas as datas de entrevistas e resultado.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={handleDelete}
                className={styles.deleteButton}
              >
                Sim, Deletar
              </button>
              <button
                onClick={handleCloseDeleteModal}
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

export default Control;