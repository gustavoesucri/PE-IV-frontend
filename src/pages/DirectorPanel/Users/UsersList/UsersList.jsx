import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./UsersList.module.css";
import Menu from "../../../../components/Menu/Menu";
import { useNavigate } from "react-router-dom";
import api from "../../../../api";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Proteção: apenas diretor pode acessar esta página
  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (!saved) {
        navigate('/');
        return;
      }
      const u = JSON.parse(saved);
      if (!u || u.role !== 'diretor') {
        navigate('/');
      }
    } catch (err) {
      console.error('Erro verificando acesso a UsersList:', err);
      navigate('/');
    }
  }, [navigate]);
  // Carregar usuários e categorias do back-end
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Carregar usuários
        const usersResponse = await api.get('/users');
        setUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data);

        // Carregar categorias a partir de rolePermissions
        const rolePermsResponse = await api.get('/api/rolePermissions');
        const rolesFromPermissions = rolePermsResponse.data.map(rp => rp.role);
        setCategories(rolesFromPermissions);

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

  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingUser(null);
  };

  // Verificar se é o usuário Diretor primário (não pode ser deletado)
  const isPrimaryDirector = (user) => {
    return user.id === 1 && user.username === "Diretor" && user.role === "diretor";
  };

  const isCurrentUser = (user) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id === currentUser.id;
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
      await api.delete(`/users/${deletingUser.id}`);

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

      {successMessage && (
        <div className={styles.infoMessage}>
          {successMessage}
        </div>
      )}

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
                        className={styles.deleteButton}
                        onClick={() => handleDeleteClick(user)}
                        disabled={loading}
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
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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