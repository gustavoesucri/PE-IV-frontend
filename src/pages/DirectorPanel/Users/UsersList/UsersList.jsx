import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./UsersList.module.css";
import Menu from "../../../../components/Menu/Menu";
import api from "../../../../api";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    role: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userPasswordFromServer, setUserPasswordFromServer] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // Carregar usuários e categorias do back-end
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Carregar usuários
        const usersResponse = await api.get('/api/users');
        setUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data);

        // Carregar categorias
        const categoriesResponse = await api.get('/api/userCategories');
        setCategories(categoriesResponse.data);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar usuários
  useEffect(() => {
    let results = users.filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase())
    );

    if (categoryFilter) {
      results = results.filter((u) => u.role === categoryFilter);
    }

    setFilteredUsers(results);
  }, [search, categoryFilter, users]);

  const handleEditClick = async (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      role: user.role
    });

    // Buscar senha atual do usuário do back-end
    try {
      const userResponse = await api.get(`/api/users/${user.id}`);
      setUserPasswordFromServer(userResponse.data.password);
    } catch (error) {
      console.error("Erro ao buscar senha do usuário:", error);
    }

    setIsEditModalOpen(true);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordMatch(null);
    setSuccessMessage("");
  };

  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setFormData({
      username: "",
      role: "",
    });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordMatch(null);
    setSuccessMessage("");
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro de senha quando o usuário começar a digitar
    if (passwordError) {
      setPasswordError("");
    }

    // Verificar se as senhas coincidem
    if (name === "confirmPassword") {
      setPasswordMatch(value === passwordData.newPassword && value !== "");
    } else if (name === "newPassword") {
      setPasswordMatch(value === passwordData.confirmPassword && value !== "");
    }
  };

  // Verificar se é o usuário Diretor primário (não pode ser deletado)
  const isPrimaryDirector = (user) => {
    return user.id === 1 && user.username === "Diretor" && user.role === "diretor";
  };

  // Verificar se é o usuário atual logado
  const isCurrentUser = (user) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id === currentUser.id;
  };

  // Atualizar usuário no back-end
  const handleSave = async () => {
    if (!formData.username || !formData.role) {
      setSuccessMessage("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      setPasswordError("");

      // Verificar se username já existe (excluindo o usuário atual)
      const usersResponse = await api.get('/api/users');
      const usernameExists = usersResponse.data.some(
        user => user.username === formData.username && user.id !== editingUser.id
      );

      if (usernameExists) {
        setSuccessMessage("Nome de usuário já existe.");
        return;
      }

      // Preparar dados para atualização
      const updateData = {
        username: formData.username,
        role: formData.role
      };

      // Se a seção de senha está visível e preenchida, validar e incluir senha
      const isPasswordSectionFilled = passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword;

      if (isPasswordSectionFilled) {
        // Se algum campo de senha foi preenchido, validar todos
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
          setSuccessMessage("Preencha todos os campos de senha ou deixe todos em branco.");
          return;
        }

        // Verificar se a senha atual está correta
        if (passwordData.currentPassword !== userPasswordFromServer) {
          setPasswordError("Senha atual incorreta!");
          return;
        }

        // Verificar se as senhas coincidem
        if (!passwordMatch) {
          setPasswordError("As senhas não coincidem!");
          return;
        }

        updateData.password = passwordData.newPassword;
      }

      // Atualizar usuário
      await api.patch(`/api/users/${editingUser.id}`, updateData);

      // Atualizar lista local
      const updatedUsers = users.map(u =>
        u.id === editingUser.id ? { ...u, username: formData.username, role: formData.role } : u
      );
      setUsers(updatedUsers);

      setSuccessMessage("Usuário atualizado com sucesso!");
      setTimeout(() => {
        handleCloseEditModal();
      }, 1500);

    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      setSuccessMessage("Erro ao atualizar usuário.");
    } finally {
      setLoading(false);
    }
  };

  // Deletar usuário no back-end
  const handleDelete = async () => {
    try {
      setLoading(true);

      // Não permitir deletar o usuário Diretor primário
      if (isPrimaryDirector(deletingUser)) {
        setSuccessMessage("Não é possível deletar o usuário Diretor primário.");
        return;
      }

      // Não permitir deletar o próprio usuário
      if (isCurrentUser(deletingUser)) {
        setSuccessMessage("Você não pode deletar seu próprio usuário.");
        return;
      }

      // Deletar usuário
      await api.delete(`/api/users/${deletingUser.id}`);

      // Atualizar lista local
      const updatedUsers = users.filter(u => u.id !== deletingUser.id);
      setUsers(updatedUsers);

      handleCloseDeleteModal();
      setSuccessMessage("Usuário deletado com sucesso!");

    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      setSuccessMessage("Erro ao deletar usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Menu />

      <h1 className={styles.title}>Lista de Usuários</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nome de usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Mensagem informativa sobre edição de usuários */}
      <div className={styles.infoMessage}>
        <strong>Observação:</strong> Ao alterar o nome de usuário ou senha de um usuário,
        ele precisará relogar no sistema se estiver conectado no momento e precisará fazer login com as novas credenciais.
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome de Usuário</th>
              <th>Email</th>
              <th>Cargo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email || "-"}</td>
                  <td>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleEditClick(user)}
                        disabled={loading}
                      >
                        Editar
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteClick(user)}
                        disabled={loading || isPrimaryDirector(user) || isCurrentUser(user)}>
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noData}>
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição */}
      {isEditModalOpen && editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h2>Editar Usuário</h2>
              <button className={styles.modalClose} onClick={handleCloseEditModal}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              {/* Mensagem de sucesso/erro dentro do modal */}
              {successMessage && (
                <div style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  borderRadius: '6px',
                  backgroundColor: successMessage.includes('Erro') ? '#f8d7da' : '#d1edff',
                  color: successMessage.includes('Erro') ? '#721c24' : '#004085',
                  border: `1px solid ${successMessage.includes('Erro') ? '#f5c6cb' : '#b8daff'}`,
                  fontSize: '0.9rem'
                }}>
                  {successMessage}
                </div>
              )}

              {/* Seção de Dados Básicos */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--azul)', fontSize: '1.1rem' }}>
                  Dados do Usuário
                </h3>

                <p className={styles.fieldLabel}>Nome de Usuário:</p>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Digite o nome de usuário"
                  className={styles.dados}
                  disabled={loading}
                />

                <p className={styles.fieldLabel}>Cargo:</p>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={styles.dados}
                  disabled={loading || isPrimaryDirector(editingUser)}
                >
                  <option value="" disabled>
                    Selecione um cargo
                  </option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Mensagem informativa se for o diretor primário */}
                {isPrimaryDirector(editingUser) && (
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#666',
                    marginTop: '0.5rem',
                    fontStyle: 'italic'
                  }}>
                    A categoria do usuário Diretor primário não pode ser alterada.
                  </p>
                )}

                <p className={styles.fieldLabel}>Senha Atual:</p>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Digite a senha atual"
                  className={styles.dados}
                  disabled={loading}
                />

                <p className={styles.fieldLabel}>Nova Senha:</p>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Digite a nova senha"
                  className={styles.dados}
                  disabled={loading}
                />

                <p className={styles.fieldLabel}>Confirmar Nova Senha:</p>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirme a nova senha"
                  className={styles.dados}
                  disabled={loading}
                />

                {passwordError && (
                  <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 'bold' }}>
                    {passwordError}
                  </p>
                )}

                {passwordMatch === true && passwordData.newPassword && !passwordError && (
                  <p style={{ color: 'green', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    ✔ Senhas coincidem
                  </p>
                )}
                {passwordMatch === false && passwordData.newPassword && !passwordError && (
                  <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    ✘ Senhas não coincidem
                  </p>
                )}

                <p style={{
                  fontSize: '0.8rem',
                  color: '#666',
                  marginTop: '0.5rem',
                  fontStyle: 'italic'
                }}>
                  Deixe em branco se não quiser alterar a senha
                </p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={handleSave}
                className={styles.filterButton}
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={handleCloseEditModal}
                className={styles.filterButton}
                disabled={loading}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Deleção */}
      {isDeleteModalOpen && deletingUser && (
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
                Tem certeza que deseja deletar o usuário <strong>"{deletingUser.username}"</strong>?
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={handleDelete}
                className={styles.deleteButton}
                disabled={loading}
              >
                {loading ? "Deletando..." : "Sim, Deletar"}
              </button>
              <button
                onClick={handleCloseDeleteModal}
                className={styles.filterButton}
                style={{ backgroundColor: 'var(--cinza)', color: 'var(--preto)' }}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;