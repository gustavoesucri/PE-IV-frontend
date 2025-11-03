import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Users.module.css";
import Menu from "../../../components/Menu/Menu";

const PERMISSION_LABELS = {
  view_students: "Ver estudantes",
  create_students: "Criar estudantes",
  view_companies: "Ver empresas",
  create_companies: "Criar empresas",
  view_placements: "Ver encaminhados",
  create_placements: "Criar encaminhados",
  create_evaluations: "Registrar avaliações",
  view_evaluations: "Ver avaliações",
  view_control: "Ver controle interno",
  create_observations: "Registrar acompanhamento",
  view_observations: "Ver acompanhamento",
  // manage_users e manage_permissions NÃO estão aqui
};

const DEFAULT_PERMISSIONS = {
  view_students: true,
  create_students: false,
  view_companies: true,
  create_companies: false,
  view_placements: true,
  create_placements: false,
  create_evaluations: false,
  view_evaluations: true,
  view_control: false,
  create_observations: false,
  view_observations: true,
};

const Users = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    category: "",
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("userCategories");
    return saved ? JSON.parse(saved) : ["Professor", "Psicólogo", "Diretor"];
  });

  const [newCategory, setNewCategory] = useState("");
  const [newPermissions, setNewPermissions] = useState(DEFAULT_PERMISSIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [rolePermissions, setRolePermissions] = useState(() => {
    const saved = localStorage.getItem("rolePermissions");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("userCategories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("rolePermissions", JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "new") {
      setNewPermissions(DEFAULT_PERMISSIONS);
      setNewCategory("");
      setIsModalOpen(true);
    } else {
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  const handleNewCategoryChange = (e) => {
    setNewCategory(e.target.value);
  };

  const togglePermission = (perm) => {
    setNewPermissions((prev) => ({ ...prev, [perm]: !prev[perm] }));
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      setErrorMessage("Categoria já existe.");
      return;
    }

    // Adiciona categoria
    setCategories((prev) => [...prev, trimmed]);

    // Salva permissões (sem manage_users/permission)
    setRolePermissions((prev) => ({
      ...prev,
      [trimmed]: newPermissions,
    }));

    setFormData((prev) => ({ ...prev, category: trimmed }));
    setSuccessMessage(`Categoria "${trimmed}" criada!`);
    setNewCategory("");
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.category) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    localStorage.setItem(
      "users",
      JSON.stringify([...users, { ...formData, id: users.length + 1 }])
    );

    setSuccessMessage("Usuário cadastrado com sucesso!");
    setErrorMessage("");
    setFormData({ username: "", password: "", category: "" });
  };

  const handleNavigate = () => {
    navigate("/users-list");
  };

  return (
    <div className={styles.container}>
      <Menu />

      <div className={styles.card}>
        <h2 className={styles.title}>Cadastro de Usuários</h2>

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
            <option value="" disabled>Selecione uma categoria</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
            <option value="new">+ Nova Categoria</option>
          </select>

          <button className={styles.button} type="submit">
            Cadastrar
          </button>
        </form>

        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <button className={styles.secondaryButton} onClick={handleNavigate}>
          Listar usuários cadastrados
        </button>
      </div>

      {/* MODAL COM PERMISSÕES CORRETAS */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: "520px" }}>
            <div className={styles.modalHeader}>
              <h2>Nova Categoria</h2>
              <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>
                X
              </button>
            </div>

            <div className={styles.modalContent}>
              <label className={styles.label}>Nome da Categoria:</label>
              <input
                type="text"
                value={newCategory}
                onChange={handleNewCategoryChange}
                placeholder="Ex: Coordenador"
                className={styles.input}
                style={{ marginBottom: "1.5rem" }}
                autoFocus
              />

              <h3 style={{ margin: "1.2rem 0 0.8rem", fontSize: "1rem", color: "var(--azul)" }}>
                Permissões
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <label
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                    }}
                  >
                    {label}
                    <div
                      className={styles.switch}
                      onClick={() => togglePermission(key)}
                      style={{
                        background: newPermissions[key] ? "var(--roxo)" : "var(--cinza)",
                      }}
                    >
                      <div
                        className={styles.slider}
                        style={{
                          transform: newPermissions[key] ? "translateX(24px)" : "translateX(0)",
                        }}
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={handleAddCategory}
                className={styles.button}
                disabled={!newCategory.trim()}
                style={{ background: "var(--roxo)" }}
              >
                Criar Categoria
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.button}
                style={{ background: "var(--cinza)", color: "var(--preto)" }}
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

export default Users;