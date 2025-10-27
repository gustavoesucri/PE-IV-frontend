import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Users.module.css";
import Menu from "../../components/Menu/Menu";

const Users = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    category: "",
  });
  const [categories, setCategories] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem("userCategories");
    return saved ? JSON.parse(saved) : ["Professor", "Psicólogo", "Diretor"];
  });
  const [newCategory, setNewCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Persist categories to localStorage when updated
  useEffect(() => {
    localStorage.setItem("userCategories", JSON.stringify(categories));
  }, [categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "new") {
      setIsModalOpen(true);
    } else {
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  const handleNewCategoryChange = (e) => {
    setNewCategory(e.target.value);
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
      setFormData((prev) => ({ ...prev, category: newCategory }));
      setSuccessMessage("Categoria adicionada com sucesso!");
      setNewCategory("");
      setIsModalOpen(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.category) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }
    // Simulate backend save to localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    localStorage.setItem(
      "users",
      JSON.stringify([...users, { ...formData, id: users.length + 1 }])
    );
    setSuccessMessage("Administrador cadastrado com sucesso!");
    setErrorMessage("");
    setFormData({ username: "", password: "", category: "" });
  };

  const handleNavigate = () => {
    navigate("/users-list");
  };

  return (
    <div className={styles.container}>
      <Menu />
      <h1 className={styles.pageTitle}>Sistema de Gestão de Alunos</h1>

      <div className={styles.card}>
        <h2 className={styles.title}>Cadastro de Administrador</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="username">
            Nome de Usuário:
          </label>
          <input
            className={styles.input}
            id="username"
            name="username"
            type="text"
            placeholder="Digite o nome de usuário"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label className={styles.label} htmlFor="password">
            Senha:
          </label>
          <input
            className={styles.input}
            id="password"
            name="password"
            type="password"
            placeholder="Digite a senha"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label className={styles.label} htmlFor="category">
            Categoria:
          </label>
          <select
            className={styles.input}
            id="category"
            name="category"
            value={formData.category}
            onChange={handleCategoryChange}
            required
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
            <option value="new">+ Nova</option>
          </select>

          <button className={styles.button} type="submit">
            Cadastrar
          </button>
        </form>

        {successMessage && (
          <p className={styles.successMessage}>{successMessage}</p>
        )}
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <button className={styles.secondaryButton} onClick={handleNavigate}>
          Listar administradores cadastrados
        </button>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Nova Categoria</h2>
              <button
                className={styles.modalClose}
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalContent}>
              <input
                type="text"
                value={newCategory}
                onChange={handleNewCategoryChange}
                placeholder="Nome da Categoria"
                className={styles.input}
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={handleAddCategory}
                className={styles.button}
                disabled={!newCategory}
              >
                Adicionar
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.button}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;