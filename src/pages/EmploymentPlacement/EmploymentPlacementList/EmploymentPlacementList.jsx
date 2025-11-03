import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import styles from "./EmploymentPlacementList.module.css";
import Menu from "../../../components/Menu/Menu";
import { X } from "lucide-react";
import api from "../../../api";

const EmploymentPlacementList = () => {
  const [search, setSearch] = useState("");
  const [dateType, setDateType] = useState("dataAdmissao");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filteredPlacements, setFilteredPlacements] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  // Estados para modais e mensagens
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [userPermissions, setUserPermissions] = useState({});
  
  const [selectedPlacement, setSelectedPlacement] = useState(null);
  const [deletingPlacement, setDeletingPlacement] = useState(null);

  // Carregar dados e permissões
  useEffect(() => {
    const loadDataAndPermissions = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);

          // Carregar permissões
          const rolePermsResponse = await api.get(`/api/rolePermissions?role=${user.role}`);
          let rolePermissions = {};
          if (rolePermsResponse.data.length > 0) {
            rolePermissions = rolePermsResponse.data[0].permissions;
          }

          const userPermsResponse = await api.get(`/api/userSpecificPermissions?userId=${user.id}`);
          let userSpecificPermissions = {};
          if (userPermsResponse.data.length > 0) {
            userSpecificPermissions = userPermsResponse.data[0].permissions;
          }

          const finalPermissions = { ...rolePermissions };
          Object.keys(userSpecificPermissions).forEach(perm => {
            if (userSpecificPermissions[perm] !== null) {
              finalPermissions[perm] = userSpecificPermissions[perm];
            }
          });

          setUserPermissions(finalPermissions);

          // Carregar dados apenas se tiver permissão para visualizar
          if (finalPermissions.view_placements) {
            await loadPlacements();
            await loadStudents();
            await loadCompanies();
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        showMessage("Erro ao carregar dados. Tente novamente.", "error");
      }
    };

    loadDataAndPermissions();
  }, []);

  const loadPlacements = async () => {
    try {
      const response = await api.get('/api/placements');
      setPlacements(response.data);
      setFilteredPlacements(response.data);
    } catch (error) {
      console.error("Erro ao carregar encaminhamentos:", error);
      throw error;
    }
  };

  const loadStudents = async () => {
    try {
      const response = await api.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error("Erro ao carregar estudantes:", error);
      throw error;
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await api.get('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      throw error;
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

  // Função para obter nome do estudante
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.nome : "N/A";
  };

  // Função para obter nome da empresa
  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.nome : "N/A";
  };

  const validateDates = () => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      showMessage("A data inicial não pode ser maior que a data final.");
      return false;
    }
    return true;
  };

  const handleFilter = () => {
    if (!validateDates()) return;

    let results = placements;

    if (search) {
      results = results.filter(p => {
        const studentName = getStudentName(p.studentId).toLowerCase();
        const companyName = getCompanyName(p.empresaId).toLowerCase();
        return studentName.includes(search.toLowerCase()) || 
               companyName.includes(search.toLowerCase()) ||
               p.funcao.toLowerCase().includes(search.toLowerCase());
      });
    }

    if (dateFrom || dateTo) {
      results = results.filter(p => {
        const dateValue = new Date(p[dateType]);
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;

        if (from && dateValue < from) return false;
        if (to && dateValue > to) return false;
        return true;
      });
    }

    setFilteredPlacements(results);
  };

  const handleView = (placement) => {
    setSelectedPlacement(placement);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (placement) => {
    // Verificar permissão para deletar
    if (!userPermissions.create_placements) {
      showMessage("Você não tem permissão para deletar encaminhamentos. Se algo estiver errado consulte o Diretor.");
      return;
    }

    setDeletingPlacement(placement);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/placements/${deletingPlacement.id}`);

      // Atualizar lista local
      const updatedPlacements = placements.filter(p => p.id !== deletingPlacement.id);
      setPlacements(updatedPlacements);
      setFilteredPlacements(updatedPlacements);

      setIsDeleteModalOpen(false);
      setDeletingPlacement(null);
      showMessage("Encaminhamento deletado com sucesso!", "success");

    } catch (error) {
      console.error("Erro ao deletar encaminhamento:", error);
      if (error.response && error.response.status === 403) {
        showMessage("Acesso negado. Você não tem permissão para esta ação.");
      } else {
        showMessage("Erro ao deletar encaminhamento. Tente novamente.");
      }
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedPlacement(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingPlacement(null);
  };

  // função de formatação usando date-fns
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const handleClear = () => {
    setSearch("");
    setDateType("dataAdmissao");
    setDateFrom("");
    setDateTo("");
    setFilteredPlacements(placements);
  };

  return (
    <div className={styles.container}>
      <Menu />
      <h1 className={styles.title}>Lista de Encaminhamentos</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nome, empresa ou função..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input}
        />

        <select
          value={dateType}
          onChange={(e) => setDateType(e.target.value)}
          className={styles.input}
        >
          <option value="dataAdmissao">Data de Admissão</option>
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

        <button onClick={handleFilter} className={styles.filterButton}>
          Filtrar
        </button>
        <button onClick={handleClear} className={styles.clearButton}>
          Limpar
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {userPermissions.view_placements ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Data Admissão</th>
                <th>Empresa</th>
                <th>Função</th>
                <th>Contato RH</th>
                <th>Provável Desligamento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlacements.length > 0 ? (
                filteredPlacements.map(p => (
                  <tr key={p.id}>
                    <td>{getStudentName(p.studentId)}</td>
                    <td>{formatDate(p.dataAdmissao)}</td>
                    <td>{getCompanyName(p.empresaId)}</td>
                    <td>{p.funcao}</td>
                    <td>{p.contatoRh}</td>
                    <td>{formatDate(p.dataDesligamento)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleView(p)}
                        >
                          Visualizar
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteClick(p)}
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.noData}>
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

      {/* Modal de Visualização */}
      {isViewModalOpen && selectedPlacement && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Detalhes do Encaminhamento</h2>
              <button className={styles.modalClose} onClick={closeViewModal}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p><strong>Nome:</strong> {getStudentName(selectedPlacement.studentId)}</p>
              <p><strong>Data de Admissão:</strong> {formatDate(selectedPlacement.dataAdmissao)}</p>
              <p><strong>Empresa:</strong> {getCompanyName(selectedPlacement.empresaId)}</p>
              <p><strong>Função:</strong> {selectedPlacement.funcao}</p>
              <p><strong>Contato RH:</strong> {selectedPlacement.contatoRh}</p>
              <p><strong>Provável Desligamento:</strong> {formatDate(selectedPlacement.dataDesligamento)}</p>
              <p><strong>Status:</strong> {selectedPlacement.status}</p>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeViewModal} className={styles.filterButton}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Deleção */}
      {isDeleteModalOpen && deletingPlacement && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#dc3545' }}>Confirmar Deleção</h2>
              <button className={styles.modalClose} onClick={closeDeleteModal}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p style={{ margin: '1rem 0', fontSize: '1rem', lineHeight: '1.5' }}>
                Tem certeza que deseja deletar o encaminhamento de <strong>"{getStudentName(deletingPlacement.studentId)}"</strong> na empresa <strong>"{getCompanyName(deletingPlacement.empresaId)}"</strong>?
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
                onClick={closeDeleteModal}
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

export default EmploymentPlacementList;