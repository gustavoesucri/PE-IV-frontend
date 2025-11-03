// src/pages/DirectorPanel/DirectorPanel.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DirectorPanel.module.css";
import Menu from "../../components/Menu/Menu";
import { Shield, Bell, Users, Settings, ChevronRight, UserCog } from "lucide-react";

const NOTIFICATION_EVENTS = [
    { id: "new_student", label: "Novo aluno registrado" },
    { id: "new_evaluation", label: "Nova avaliação submetida" },
    { id: "new_observation", label: "Nova observação de acompanhamento" },
    { id: "user_created", label: "Novo usuário criado" },
];

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
    manage_users: "Gerenciar usuários",
    manage_permissions: "Gerenciar permissões",
};

const DEFAULT_ROLE_PERMISSIONS = {
  // Professor
  Professor: {
    view_students: true,
    create_students: true,
    view_companies: true,
    create_companies: false,
    view_placements: true,
    create_placements: true,
    create_evaluations: true,
    view_evaluations: true,
    view_control: false,
    create_observations: true,
    view_observations: true,
    manage_users: false,
    manage_permissions: false,
  },

  // Psicólogo
  Psicólogo: {
    view_students: true,
    create_students: false,
    view_companies: true,
    create_companies: false,
    view_placements: true,
    create_placements: false,
    create_evaluations: true,
    view_evaluations: true,
    view_control: false,
    create_observations: true,
    view_observations: true,
    manage_users: false,
    manage_permissions: false,
  },

  // Diretor (fixo)
  Diretor: {
    view_students: true,
    create_students: true,
    view_companies: true,
    create_companies: true,
    view_placements: true,
    create_placements: true,
    create_evaluations: true,
    view_evaluations: true,
    view_control: true,
    create_observations: true,
    view_observations: true,
    manage_users: true,
    manage_permissions: true,
  },
};

const DirectorPanel = () => {
    const navigate = useNavigate();

    // Categorias
    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem("userCategories");
        return saved ? JSON.parse(saved) : ["Professor", "Psicólogo", "Diretor"];
    });

    // Usuários
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem("users");
        return saved ? JSON.parse(saved) : [];
    });

    // Permissões por cargo
const [rolePermissions, setRolePermissions] = useState(() => {
  const saved = localStorage.getItem("rolePermissions");
  if (saved) {
    const parsed = JSON.parse(saved);
    // Garante que Diretor sempre tenha tudo
    return {
      ...parsed,
      Diretor: {
        ...DEFAULT_ROLE_PERMISSIONS.Diretor,
        ...(parsed.Diretor || {}),
      },
    };
  }

  // Se não existir, usa os defaults completos
  return DEFAULT_ROLE_PERMISSIONS;
});

    // Permissões específicas por usuário
    const [userSpecificPermissions, setUserSpecificPermissions] = useState(() => {
        const saved = localStorage.getItem("userSpecificPermissions");
        return saved ? JSON.parse(saved) : {};
    });

    // Notificações
    const [globalNotifications, setGlobalNotifications] = useState(() => {
        const saved = localStorage.getItem("globalNotifications");
        return saved
            ? JSON.parse(saved)
            : NOTIFICATION_EVENTS.reduce((acc, ev) => ({ ...acc, [ev.id]: true }), {});
    });

    const [activeTab, setActiveTab] = useState("roles");
    const [selectedRole, setSelectedRole] = useState(categories[0] || "Professor");
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Persistência
    useEffect(() => {
        localStorage.setItem("rolePermissions", JSON.stringify(rolePermissions));
    }, [rolePermissions]);

    useEffect(() => {
        localStorage.setItem("userSpecificPermissions", JSON.stringify(userSpecificPermissions));
    }, [userSpecificPermissions]);

    useEffect(() => {
        localStorage.setItem("globalNotifications", JSON.stringify(globalNotifications));
    }, [globalNotifications]);

    // Atualiza categorias e usuários
    useEffect(() => {
        const handleStorageChange = () => {
            const savedCats = localStorage.getItem("userCategories");
            const savedUsers = localStorage.getItem("users");
            if (savedCats) {
                const newCats = JSON.parse(savedCats);
                setCategories(newCats);
                if (!newCats.includes(selectedRole)) setSelectedRole(newCats[0]);
            }
            if (savedUsers) setUsers(JSON.parse(savedUsers));
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [selectedRole]);

    const togglePermission = (role, perm) => {
        if (role === "Diretor" && (perm === "manage_users" || perm === "manage_permissions")) return;

        setRolePermissions((prev) => ({
            ...prev,
            [role]: {
                ...(prev[role] || DEFAULT_ROLE_PERMISSIONS),
                [perm]: !prev[role]?.[perm],
            },
        }));
    };

    const toggleUserPermission = (userId, perm) => {
        setUserSpecificPermissions((prev) => ({
            ...prev,
            [userId]: {
                ...(prev[userId] || {}),
                [perm]: !(prev[userId]?.[perm] ?? false),
            },
        }));
    };

    const toggleGlobalNotification = (id) => {
        setGlobalNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const selectedUser = users.find(u => u.id === selectedUserId);

    return (
        <div className={styles.container}>
            <Menu />

            <div className={styles.header}>
                <h1 className={styles.title}>
                    <Shield size={32} /> Painel do Diretor
                </h1>
                <p className={styles.subtitle}>Gerencie permissões, cargos, usuários e notificações</p>
            </div>

            <div className={styles.quickActions}>
                <button className={styles.actionBtn} onClick={() => navigate("/users")}>
                    <Users size={20} /> Gerenciar Usuários
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* TABS */}
            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tab} ${activeTab === "roles" ? styles.active : ""}`}
                    onClick={() => setActiveTab("roles")}
                >
                    <Settings size={18} /> Cargos
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "users" ? styles.active : ""}`}
                    onClick={() => setActiveTab("users")}
                >
                    <UserCog size={18} /> Usuários
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "notifications" ? styles.active : ""}`}
                    onClick={() => setActiveTab("notifications")}
                >
                    <Bell size={18} /> Notificações
                </button>
            </div>

            <div className={styles.content}>

                {/* ==================== CARGOS ==================== */}
                {activeTab === "roles" && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Permissões por Cargo</h2>

                        <div className={styles.roleSelector}>
                            {categories.map((role) => (
                                <button
                                    key={role}
                                    className={`${styles.roleBtn} ${selectedRole === role ? styles.selected : ""}`}
                                    onClick={() => setSelectedRole(role)}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        <div className={styles.permissionsGrid}>
                            {rolePermissions[selectedRole] ? (
                                Object.entries(PERMISSION_LABELS)
                                    .filter(([key]) => {
                                        if (key === "manage_users" || key === "manage_permissions") {
                                            return selectedRole === "Diretor";
                                        }
                                        return true;
                                    })
                                    .map(([key, label]) => {
                                        const value = rolePermissions[selectedRole][key] ?? false;
                                        const isLocked = selectedRole === "Diretor" && (key === "manage_users" || key === "manage_permissions");

                                        return (
                                            <label key={key} className={styles.switchLabel} style={{ opacity: isLocked ? 0.7 : 1 }}>
                                                <span>{label}</span>
                                                <div
                                                    className={`${styles.switch} ${value ? styles.on : styles.off} ${isLocked ? styles.locked : ""}`}
                                                    onClick={() => !isLocked && togglePermission(selectedRole, key)}
                                                    style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                                                >
                                                    <div className={styles.slider} />
                                                </div>
                                            </label>
                                        );
                                    })
                            ) : (
                                <p className={styles.info}>Nenhuma permissão definida.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* ==================== USUÁRIOS ==================== */}
                {activeTab === "users" && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Permissões por Usuário</h2>

                        <p className={styles.info} style={{ marginBottom: "1.5rem", fontSize: "0.9rem", color: "#555" }}>
                            <strong>Atenção:</strong> As permissões aqui <strong>sobrepõem</strong> as do cargo. Use apenas em casos especiais.
                        </p>

                        <div className={styles.userSelector}>
                            {users.length === 0 ? (
                                <p className={styles.info}>Nenhum usuário cadastrado.</p>
                            ) : (
                                users.map((user) => (
                                    <button
                                        key={user.id}
                                        className={`${styles.userBtn} ${selectedUserId === user.id ? styles.selected : ""}`}
                                        onClick={() => setSelectedUserId(user.id)}
                                    >
                                        <strong>{user.username}</strong> <small>({user.category})</small>
                                    </button>
                                ))
                            )}
                        </div>

                        {selectedUser && (
                            <div className={styles.userPermissions}>
                                <h3 style={{ margin: "1.5rem 0 1rem", color: "var(--azul)" }}>
                                    {selectedUser.username}
                                </h3>
                                <p><strong>Categoria:</strong> {selectedUser.category}</p>

                                <h4 style={{ margin: "1.5rem 0 0.8rem", fontSize: "1rem" }}>
                                    Permissões de Usuário:
                                </h4>

                                <div className={styles.permissionsGrid}>
                                    {Object.entries(PERMISSION_LABELS)
                                        .filter(([key]) => {
                                            if (key === "manage_users" || key === "manage_permissions") {
                                                return selectedUser.category === "Diretor";
                                            }
                                            return true;
                                        })
                                        .map(([key, label]) => {
                                            const rolePerm = rolePermissions[selectedUser.category]?.[key] ?? false;
                                            const userPerm = userSpecificPermissions[selectedUser.id]?.[key] ?? null;
                                            const finalValue = userPerm !== null ? userPerm : rolePerm;
                                            const isOverridden = userPerm !== null && userPerm !== rolePerm;

                                            return (
                                                <label
                                                    key={key}
                                                    className={styles.switchLabel}
                                                    style={{
                                                        opacity: selectedUser.category === "Diretor" && (key === "manage_users" || key === "manage_permissions") ? 0.7 : 1,
                                                        position: "relative"
                                                    }}
                                                >
                                                    <span>
                                                        {label}
                                                        {isOverridden && <span style={{ color: "var(--roxo)", fontSize: "0.75rem", marginLeft: "0.5rem" }}>★</span>}
                                                    </span>
                                                    <div
                                                        className={`${styles.switch} ${finalValue ? styles.on : styles.off} ${selectedUser.category === "Diretor" && (key === "manage_users" || key === "manage_permissions") ? styles.locked : ""
                                                            }`}
                                                        onClick={() => {
                                                            if (selectedUser.category === "Diretor" && (key === "manage_users" || key === "manage_permissions")) return;
                                                            toggleUserPermission(selectedUser.id, key);
                                                        }}
                                                        style={{
                                                            cursor: selectedUser.category === "Diretor" && (key === "manage_users" || key === "manage_permissions") ? "not-allowed" : "pointer"
                                                        }}
                                                    >
                                                        <div className={styles.slider} />
                                                    </div>
                                                </label>
                                            );
                                        })}
                                </div>

                                <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "1rem" }}>
                                    ★ = Permissão sobrescrita (diferente do cargo)
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== NOTIFICAÇÕES ==================== */}
                {activeTab === "notifications" && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Notificações Globais</h2>
                        <p className={styles.info}>Configure eventos que disparam notificações.</p>

                        <div className={styles.switchContainer}>
                            {NOTIFICATION_EVENTS.map((event) => (
                                <label key={event.id} className={styles.switchLabel}>
                                    <span>{event.label}</span>
                                    <div
                                        className={`${styles.switch} ${globalNotifications[event.id] ? styles.on : styles.off}`}
                                        onClick={() => toggleGlobalNotification(event.id)}
                                    >
                                        <div className={styles.slider} />
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <p><strong>Todas as alterações são salvas automaticamente.</strong></p>
            </div>
        </div>
    );
};

export default DirectorPanel;