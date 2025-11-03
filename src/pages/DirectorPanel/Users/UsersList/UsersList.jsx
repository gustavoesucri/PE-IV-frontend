import React, { useState, useEffect } from "react";
import styles from "./UsersList.module.css";
import Menu from "../../../components/Menu/Menu";

const mockUsers = [
  {
    id: 1,
    username: "admin1",
    password: "******",
    category: "Professor",
  },
  {
    id: 2,
    username: "admin2",
    password: "******",
    category: "Psicólogo",
  },
  {
    id: 3,
    username: "admin3",
    password: "******",
    category: "Diretor",
  },
];

const UsersList = () => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("users");
    return saved ? JSON.parse(saved) : mockUsers;
  });
  const categories = (() => {
    const saved = localStorage.getItem("userCategories");
    return saved ? JSON.parse(saved) : ["Professor", "Psicólogo", "Diretor"];
  })();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    category: "",
  });

  // Update users when localStorage changes (e.g., new user added in Users.jsx)
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(savedUsers.length > 0 ? savedUsers : mockUsers);
    setFilteredUsers(savedUsers.length > 0 ? savedUsers : mockUsers);
  }, []);

  // Persist users to localStorage when updated
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const handleFilter = () => {
    let results = users.filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase())
    );

    if (categoryFilter) {
      results = results.filter((u) => u.category === categoryFilter);
    }

    setFilteredUsers(results);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      category: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...formData, id: u.id } : u))
    );
    setFilteredUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...formData, id: u.id } : u))
    );
    handleCloseModal();
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
              {cat}
            </option>
          ))}
        </select>
        <button onClick={handleFilter} className={styles.filterButton}>
          Filtrar
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome de Usuário</th>
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.category}</td>
                  <td>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditClick(user)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className={styles.noData}>
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Editar Usuário</h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <div className={styles.modalContent}>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nome de Usuário"
                className={styles.input}
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Senha"
                className={styles.input}
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="" disabled>
                  Selecione uma categoria
                </option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={handleSave} className={styles.filterButton}>
                Salvar
              </button>
              <button onClick={handleCloseModal} className={styles.filterButton}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;