import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Users.module.css";
import Menu from "../../../components/Menu/Menu";
import api from "../../../api";

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
    email: "",
    role: "",
  });

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newPermissions, setNewPermissions] = useState(DEFAULT_PERMISSIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingUsers, setExistingUsers] = useState([]); // Estado para armazenar usuários existentes

  // Carregar categorias e usuários existentes do back-end
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar categorias
        const categoriesResponse = await api.get('/api/userCategories');
        setCategories(categoriesResponse.data);

        // Carregar usuários existentes para validação
        const usersResponse = await api.get('/api/users');
        setExistingUsers(usersResponse.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpar mensagens de erro quando o usuário começar a digitar
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "new") {
      setNewPermissions(DEFAULT_PERMISSIONS);
      setNewCategory("");
      setIsModalOpen(true);
    } else {
      setFormData((prev) => ({ ...prev, role: value }));
    }
  };

  const handleNewCategoryChange = (e) => {
    setNewCategory(e.target.value);
  };

  const togglePermission = (perm) => {
    setNewPermissions((prev) => ({ ...prev, [perm]: !prev[perm] }));
  };

  // Função para validar username e email
  const validateUserData = (username, email) => {
    const usernameExists = existingUsers.some(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );
    
    if (usernameExists) {
      return "Nome de usuário já existe. Por favor, escolha outro.";
    }

    // Validar email apenas se foi preenchido
    if (email && email.trim() !== "") {
      const emailExists = existingUsers.some(user => 
        user.email && user.email.toLowerCase() === email.toLowerCase()
      );
      
      if (emailExists) {
        return "Email já está em uso. Por favor, use outro email.";
      }

      // Validação básica de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return "Por favor, insira um email válido.";
      }
    }

    return null;
  };

  // Adicionar nova categoria no back-end
  const handleAddCategory = async () => {
    const trimmed = newCategory.trim().toLowerCase();
    if (!trimmed) return;
    
    if (categories.includes(trimmed)) {
      setErrorMessage("Categoria já existe.");
      return;
    }

    try {
      setLoading(true);
      
      // Adicionar categoria
      const newCategories = [...categories, trimmed];
      setCategories(newCategories);
      
      // Criar permissões padrão para a nova categoria
      await api.post('/api/rolePermissions', {
        role: trimmed,
        permissions: newPermissions
      });

      setFormData((prev) => ({ ...prev, role: trimmed }));
      setSuccessMessage(`Categoria "${trimmed}" criada com sucesso!`);
      setNewCategory("");
      setIsModalOpen(false);
      
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      setErrorMessage("Erro ao criar categoria.");
    } finally {
      setLoading(false);
    }
  };

  // Criar novo usuário no back-end
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.role) {
      setErrorMessage("Preencha todos os campos obrigatórios.");
      return;
    }

    // Validar username e email
    const validationError = validateUserData(formData.username, formData.email);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      // Criar novo usuário
      const newUser = {
        username: formData.username,
        password: formData.password,
        email: formData.email || "",
        role: formData.role
      };

      await api.post('/api/users', newUser);

      // Atualizar lista de usuários existentes
      const updatedUsersResponse = await api.get('/api/users');
      setExistingUsers(updatedUsersResponse.data);

      setSuccessMessage("Usuário cadastrado com sucesso!");
      setFormData({ 
        username: "", 
        password: "", 
        email: "", 
        role: "" 
      });
      
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      if (error.response && error.response.status === 409) {
        setErrorMessage("Usuário ou email já existe no sistema.");
      } else {
        setErrorMessage("Erro ao cadastrar usuário.");
      }
    } finally {
      setLoading(false);
    }
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
            placeholder="Digite o nome de usuário para login"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label className={styles.label} htmlFor="email">
            Email (opcional):
          </label>
          <input
            className={styles.input}
            id="email"
            name="email"
            type="email"
            placeholder="Digite o email"
            value={formData.email}
            onChange={handleChange}
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

          <label className={styles.label} htmlFor="role">
            Cargo:
          </label>
          <select
            className={styles.input}
            id="role"
            name="role"
            value={formData.role}
            onChange={handleCategoryChange}
            required
          >
            <option value="" disabled>Selecione um cargo</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
            <option value="new">+ Novo Cargo</option>
          </select>

          <button 
            className={styles.button} 
            type="submit"
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <button className={styles.secondaryButton} onClick={handleNavigate}>
          Listar usuários cadastrados
        </button>
      </div>

      {/* MODAL PARA NOVO CARGO */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: "520px" }}>
            <div className={styles.modalHeader}>
              <h2>Novo Cargo</h2>
              <button 
                className={styles.modalClose} 
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
              >
                X
              </button>
            </div>

            <div className={styles.modalContent}>
              <label className={styles.label}>Nome do Cargo:</label>
              <input
                type="text"
                value={newCategory}
                onChange={handleNewCategoryChange}
                placeholder="Ex: coordenador"
                className={styles.input}
                style={{ marginBottom: "1.5rem" }}
                autoFocus
                disabled={loading}
              />

              <h3 style={{ margin: "1.2rem 0 0.8rem", fontSize: "1rem", color: "var(--azul)" }}>
                Permissões Padrão
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
                      className={`${styles.switch} ${loading ? styles.disabled : ''}`}
                      onClick={() => !loading && togglePermission(key)}
                      style={{
                        background: newPermissions[key] ? "var(--roxo)" : "var(--cinza)",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1
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
                disabled={!newCategory.trim() || loading}
              >
                {loading ? "Criando..." : "Criar Cargo"}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.button}
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

export default Users;