import React, { useState, useEffect } from "react";
import InputMask from "react-input-mask";
import styles from "./CompaniesList.module.css";
import Menu from "../../../components/Menu/Menu";
import { X } from "lucide-react";
import api from "../../../api";

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const validateCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14) return false;
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
};

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [userPermissions, setUserPermissions] = useState({});
  const [cnpjFilter, setCnpjFilter] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    rua: "",
    numero: "",
    bairro: "",
    estado: "",
    cep: "",
  });

  // Carregar permissões e empresas
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await api.get('/api/companies');
        setCompanies(response.data);
        setFilteredCompanies(response.data);
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
        showMessage("Erro ao carregar lista de empresas.", "error");
      }
    };

    const loadUserPermissionsAndCompanies = async () => {
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

          // Carregar empresas apenas se tiver permissão para visualizar
          if (finalPermissions.view_companies) {
            await loadCompanies();
          }
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
        showMessage("Erro ao carregar permissões do usuário.", "error");
      }
    };

    loadUserPermissionsAndCompanies();
  }, []);

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
    const normalize = (value) => value.replace(/[^\d]+/g, "");

    let results = companies;

    if (search) {
      results = results.filter((c) =>
        c.nome.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (cnpjFilter) {
      results = results.filter((c) =>
        normalize(c.cnpj).includes(normalize(cnpjFilter))
      );
    }

    if (stateFilter) {
      results = results.filter((c) => c.estado === stateFilter);
    }

    setFilteredCompanies(results);
  };

  const handleEditClick = (company) => {
    // Verificar permissão para editar empresas
    if (!userPermissions.create_companies) {
      showMessage("Você não tem permissão para editar empresas. Se algo estiver errado consulte o Diretor.");
      return;
    }

    setEditingCompany(company);
    setFormData({ ...company });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (company) => {
    // Verificar permissão para deletar empresas
    if (!userPermissions.create_companies) {
      showMessage("Você não tem permissão para deletar empresas. Se algo estiver errado consulte o Diretor.");
      return;
    }

    setDeletingCompany(company);
    setIsDeleteModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCompany(null);
    setFormData({
      nome: "",
      cnpj: "",
      rua: "",
      numero: "",
      bairro: "",
      estado: "",
      cep: "",
    });
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingCompany(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "numero") {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.cnpj) {
      showMessage("Por favor, preencha os campos obrigatórios (Nome e CNPJ).");
      return;
    }
    if (!validateCNPJ(formData.cnpj)) {
      showMessage("CNPJ inválido.");
      return;
    }
    if (formData.cep && formData.cep.replace(/[^\d]+/g, "").length !== 8) {
      showMessage("CEP deve ter exatamente 8 dígitos.");
      return;
    }

    try {
      // Preparar dados para envio
      const companyData = {
        nome: formData.nome.trim(),
        cnpj: formData.cnpj.replace(/[^\d]+/g, ""),
        rua: formData.rua.trim(),
        numero: formData.numero,
        bairro: formData.bairro.trim(),
        estado: formData.estado,
        cep: formData.cep.replace(/[^\d]+/g, ""),
      };

      // Atualizar no back-end
      await api.patch(`/api/companies/${editingCompany.id}`, companyData);
      
      // Atualizar lista local
      const updatedCompanies = companies.map(c => 
        c.id === editingCompany.id ? { ...c, ...companyData } : c
      );
      setCompanies(updatedCompanies);
      setFilteredCompanies(updatedCompanies);

      showMessage("Empresa atualizada com sucesso!", "success");
      handleCloseEditModal();
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
      if (error.response && error.response.status === 403) {
        showMessage("Acesso negado. Você não tem permissão para esta ação.");
      } else {
        showMessage("Erro ao atualizar empresa. Tente novamente.");
      }
    }
  };

  // Deletar empresa no back-end
  const handleDelete = async () => {
    try {
      // Deletar empresa
      await api.delete(`/api/companies/${deletingCompany.id}`);

      // Atualizar lista local
      const updatedCompanies = companies.filter(c => c.id !== deletingCompany.id);
      setCompanies(updatedCompanies);
      setFilteredCompanies(updatedCompanies);

      handleCloseDeleteModal();
      showMessage("Empresa deletada com sucesso!", "success");

    } catch (error) {
      console.error("Erro ao deletar empresa:", error);
      if (error.response && error.response.status === 403) {
        showMessage("Acesso negado. Você não tem permissão para esta ação.");
      } else {
        showMessage("Erro ao deletar empresa. Tente novamente.");
      }
    }
  };

  const formatCNPJ = (cnpj) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const handleClear = () => {
    setSearch("");
    setCnpjFilter("");
    setStateFilter("");
    setFilteredCompanies(companies);
  };

  return (
    <div className={styles.container}>
      <Menu />
      <h1 className={styles.title}>Lista de Empresas</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input}
        />

        <input
          type="text"
          placeholder="Buscar por CNPJ..."
          value={cnpjFilter}
          onChange={(e) => setCnpjFilter(e.target.value.replace(/\D/g, ""))}
          className={styles.input}
        />

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">Todos os estados</option>
          {brazilianStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <button onClick={handleFilter} className={styles.filterButton}>
          Filtrar
        </button>
        <button onClick={handleClear} className={styles.clearButton}>
          Limpar
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {userPermissions.view_companies ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.nome}</td>
                    <td>{formatCNPJ(company.cnpj)}</td>
                    <td>{company.estado}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleEditClick(company)}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteClick(company)}
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={styles.noData}>
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
      {isEditModalOpen && editingCompany && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Editar Empresa</h2>
              <button className={styles.modalClose} onClick={handleCloseEditModal}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <label className={styles.label} htmlFor="nome">
                Nome da empresa:
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Digite o nome da empresa"
                className={styles.input}
                required
              />

              <label className={styles.label} htmlFor="cnpj">
                CNPJ da empresa:
              </label>
              <InputMask
                mask="99.999.999/9999-99"
                value={formData.cnpj}
                onChange={handleChange}
                name="cnpj"
                required
              >
                {(inputProps) => (
                  <input
                    {...inputProps}
                    className={styles.input}
                    id="cnpj"
                    placeholder="Digite o CNPJ (ex: 12.345.678/0001-95)"
                  />
                )}
              </InputMask>

              <label className={styles.label} htmlFor="rua">
                Rua:
              </label>
              <input
                type="text"
                name="rua"
                value={formData.rua}
                onChange={handleChange}
                placeholder="Digite a rua"
                className={styles.input}
              />

              <label className={styles.label} htmlFor="numero">
                Número:
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="Digite o número"
                className={styles.input}
                maxLength="10"
              />

              <label className={styles.label} htmlFor="bairro">
                Bairro:
              </label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                placeholder="Digite o bairro"
                className={styles.input}
              />

              <label className={styles.label} htmlFor="estado">
                Estado:
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="" disabled>
                  Selecione um estado
                </option>
                {brazilianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>

              <label className={styles.label} htmlFor="cep">
                CEP:
              </label>
              <InputMask
                mask="99999-999"
                value={formData.cep}
                onChange={handleChange}
                name="cep"
              >
                {(inputProps) => (
                  <input
                    {...inputProps}
                    className={styles.input}
                    id="cep"
                    placeholder="Digite o CEP (ex: 12345-678)"
                  />
                )}
              </InputMask>
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
      {isDeleteModalOpen && deletingCompany && (
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
                Tem certeza que deseja deletar a empresa <strong>"{deletingCompany.nome}"</strong>?
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
                onClick={closeMessageModal}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesList;