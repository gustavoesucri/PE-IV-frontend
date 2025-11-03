import React, { useState, useEffect } from "react";
import styles from "./StudentsList.module.css";
import Menu from "../../../components/Menu/Menu";
import { X } from "lucide-react";
import api from "../../../api";

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [dateFilterType, setDateFilterType] = useState("dataIngresso");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [userPermissions, setUserPermissions] = useState({});

  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    dataIngresso: "",
    dataDesligamento: "",
    status: "Ativo",
    observacaoBreve: "",
    observacaoDetalhada: "",
    cpf: ""
  });

  // Carregar permissões e estudantes
  useEffect(() => {
    // Mover loadStudents para dentro do useEffect
const loadStudents = async () => {
  try {
    const response = await api.get('/api/students');
    const studentsWithStatus = response.data.map(student => ({
      ...student,
      status: student.status || 'Ativo' // Garante que sempre tenha um status
    }));
    setStudents(studentsWithStatus);
    setFilteredStudents(studentsWithStatus);
  } catch (error) {
    console.error("Erro ao carregar estudantes:", error);
    showMessage("Erro ao carregar lista de estudantes.", "error");
  }
};

    const loadUserPermissionsAndStudents = async () => {
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

          // Carregar estudantes apenas se tiver permissão para visualizar
          if (finalPermissions.view_students) {
            await loadStudents();
          }
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
        showMessage("Erro ao carregar permissões do usuário.", "error");
      }
    };

    loadUserPermissionsAndStudents();
  }, []); // Agora não há mais dependências faltando

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

    let results = students.filter((s) =>
      s.nome.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter !== "Status") {
      results = results.filter((s) => s.status === statusFilter);
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

    setFilteredStudents(results);
  };

  const handleEditClick = (student) => {
    // Verificar permissão para editar estudantes
    if (!userPermissions.create_students) {
      showMessage("Você não tem permissão para editar estudantes. Se algo estiver errado consulte o Diretor.");
      return;
    }

    setEditingStudent(student);
    setFormData({
      ...student,
      observacaoBreve: student.observacaoBreve || "",
      observacaoDetalhada: student.observacaoDetalhada || "",
      cpf: student.cpf || "" // Inclua o CPF
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (student) => {
    // Verificar permissão para deletar estudantes
    if (!userPermissions.create_students) {
      showMessage("Você não tem permissão para deletar estudantes. Se algo estiver errado consulte o Diretor.");
      return;
    }

    setDeletingStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingStudent(null);
    setFormData({
      nome: "",
      dataNascimento: "",
      dataIngresso: "",
      dataDesligamento: "",
      status: "Ativo",
      observacaoBreve: "",
      observacaoDetalhada: "",
    });
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingStudent(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSave = async () => {
  try {
    // Garantir que o status tenha um valor padrão
    const dataToSave = {
      ...formData,
      status: formData.status || 'Ativo'
    };
    
    // Atualizar no back-end
    await api.patch(`/api/students/${editingStudent.id}`, dataToSave);
    
    // Atualizar lista local
    const updatedStudents = students.map(s => 
      s.id === editingStudent.id ? { ...s, ...dataToSave } : s
    );
    setStudents(updatedStudents);
    setFilteredStudents(updatedStudents);

    showMessage("Aluno atualizado com sucesso!", "success");
    handleCloseEditModal();
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    if (error.response && error.response.status === 403) {
      showMessage("Acesso negado. Você não tem permissão para esta ação.");
    } else {
      showMessage("Erro ao atualizar aluno. Tente novamente.");
    }
  }
};

  // Deletar estudante no back-end
  const handleDelete = async () => {
    try {
      // Deletar estudante
      await api.delete(`/api/students/${deletingStudent.id}`);

      // Atualizar lista local
      const updatedStudents = students.filter(s => s.id !== deletingStudent.id);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);

      handleCloseDeleteModal();
      showMessage("Aluno deletado com sucesso!", "success");

    } catch (error) {
      console.error("Erro ao deletar aluno:", error);
      if (error.response && error.response.status === 403) {
        showMessage("Acesso negado. Você não tem permissão para esta ação.");
      } else {
        showMessage("Erro ao deletar aluno. Tente novamente.");
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
    setStatusFilter("Status");
    setFilteredStudents(students);
  };

  return (
    <div className={styles.container}>
      <Menu />
      <h1 className={styles.title}>Lista de Alunos</h1>

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
          <option value="dataDesligamento">Data de Desligamento</option>
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.input}
        >
          <option value="Status">Status</option>
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>

        <button onClick={handleFilter} className={styles.filterButton}>
          Filtrar
        </button>
        <button onClick={handleClear} className={styles.clearButton}>
          Limpar
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {userPermissions.view_students ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Data de Ingresso</th>
                {dateFilterType === "dataDesligamento" && <th>Data de Desligamento</th>}
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.nome}</td>
                    <td>{formatDate(student.dataIngresso)}</td>
                    {dateFilterType === "dataDesligamento" && (
                      <td>{formatDate(student.dataDesligamento)}</td>
                    )}
                    <td>{student.status}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleEditClick(student)}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteClick(student)}
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.noData}>
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

      {/* Modal de Edição */}
      {isEditModalOpen && editingStudent && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Editar Aluno</h2>
              <button className={styles.modalClose} onClick={handleCloseEditModal}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <label htmlFor="nome">Nome:</label>
              <input
                id="nome"
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={styles.input}
              />

              {/* Campo CPF - apenas leitura */}
              <label htmlFor="cpf">CPF:</label>
              <input
                id="cpf"
                type="text"
                name="cpf"
                value={formData.cpf || ''}
                className={styles.input}
                disabled
                readOnly
                placeholder="CPF do aluno"
                style={{ backgroundColor: '#f5f5f5', color: '#666' }}
              />

              <label htmlFor="dataNascimento">Data de Nascimento:</label>
              <input
                id="dataNascimento"
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                className={styles.input}
              />

              <label htmlFor="dataIngresso">Data de Ingresso:</label>
              <input
                id="dataIngresso"
                type="date"
                name="dataIngresso"
                value={formData.dataIngresso}
                onChange={handleChange}
                className={styles.input}
              />

              <label htmlFor="status">Status:</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>

              {formData.status === "Inativo" && (
                <>
                  <label htmlFor="dataDesligamento">Data de Desligamento:</label>
                  <input
                    id="dataDesligamento"
                    type="date"
                    name="dataDesligamento"
                    value={formData.dataDesligamento}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </>
              )}

              <label htmlFor="observacaoBreve">Observação breve:</label>
              <input
                id="observacaoBreve"
                type="text"
                name="observacaoBreve"
                value={formData.observacaoBreve}
                onChange={handleChange}
                className={styles.input}
                placeholder="Digite uma observação breve"
              />

              <label htmlFor="observacaoDetalhada">Observações detalhadas:</label>
              <textarea
                id="observacaoDetalhada"
                name="observacaoDetalhada"
                value={formData.observacaoDetalhada}
                onChange={handleChange}
                rows={5}
                className={styles.textarea}
                placeholder="Digite observações detalhadas sobre o aluno..."
              />
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
      {isDeleteModalOpen && deletingStudent && (
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
                Tem certeza que deseja deletar o aluno <strong>"{deletingStudent.nome}"</strong>?
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Esta ação não pode ser desfeita.
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

export default StudentsList;