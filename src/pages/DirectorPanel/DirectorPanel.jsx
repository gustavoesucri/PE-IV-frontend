// src/pages/DirectorPanel/DirectorPanel.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./DirectorPanel.module.css";
import Menu from "../../components/Menu/Menu";
import { Shield, Bell, Users, Settings, ChevronRight, UserCog } from "lucide-react";
import api from "../../api";

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

const DirectorPanel = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Estados
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [rolePermissions, setRolePermissions] = useState({});
    const [userSpecificPermissions, setUserSpecificPermissions] = useState({});
    const [globalNotifications, setGlobalNotifications] = useState({});
    const [activeTab, setActiveTab] = useState("roles");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Função para carregar dados
    const loadData = useCallback(async () => {
        try {
            // Carregar permissões de cargo - esta é agora a fonte única das categorias
            const rolePermsResponse = await api.get('/api/rolePermissions');
            
            // Extrair categorias únicas do rolePermissions
            const rolesFromPermissions = rolePermsResponse.data.map(rp => rp.role);
            const sortedCategories = rolesFromPermissions.sort((a, b) => a.localeCompare(b));
            
            setCategories(sortedCategories);
            
            // Seleciona a primeira categoria se nenhuma estiver selecionada
            if (sortedCategories.length > 0 && !selectedRole) {
                setSelectedRole(sortedCategories[0]);
            }

            // Carregar usuários
            const usersResponse = await api.get('/api/users');
            setUsers(usersResponse.data);

            // Mapear permissões de cargo
            const rolePermsMap = {};
            rolePermsResponse.data.forEach(rp => {
                rolePermsMap[rp.role] = rp.permissions;
            });
            setRolePermissions(rolePermsMap);

            // Carregar permissões específicas de usuário
            const userPermsResponse = await api.get('/api/userSpecificPermissions');
            const userPermsMap = {};
            userPermsResponse.data.forEach(up => {
                userPermsMap[up.userId] = up.permissions;
            });
            setUserSpecificPermissions(userPermsMap);

            // Carregar notificações globais
            const notifResponse = await api.get('/api/globalNotifications');
            if (notifResponse.data.length > 0) {
                setGlobalNotifications(notifResponse.data[0].notifications);
            }

            console.log("Dados carregados com sucesso. Categorias do rolePermissions:", sortedCategories);
        } catch (error) {
            console.error("Erro ao carregar dados do painel:", error);
        }
    }, [selectedRole]);

    // Carregar dados quando o componente montar
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Recarregar dados sempre que a rota mudar (quando voltar de outras páginas)
    useEffect(() => {
        loadData();
    }, [location.pathname, loadData]);

    // Recarregar quando mudar para a tab de roles
    useEffect(() => {
        if (activeTab === "roles") {
            loadData();
        }
    }, [activeTab, loadData]);

    // Funções para atualizar back-end
    const updateRolePermissions = async (role, permissions) => {
        try {
            const existing = await api.get(`/api/rolePermissions?role=${role}`);
            
            if (existing.data.length > 0) {
                // Atualizar existente
                await api.patch(`/api/rolePermissions/${existing.data[0].id}`, { permissions });
            } else {
                // Criar novo
                await api.post('/api/rolePermissions', { role, permissions });
            }
        } catch (error) {
            console.error("Erro ao atualizar permissões de cargo:", error);
        }
    };

    const updateUserSpecificPermissions = async (userId, permissions) => {
        try {
            const existing = await api.get(`/api/userSpecificPermissions?userId=${userId}`);
            
            if (existing.data.length > 0) {
                // Atualizar existente
                await api.patch(`/api/userSpecificPermissions/${existing.data[0].id}`, { permissions });
            } else {
                // Criar novo
                await api.post('/api/userSpecificPermissions', { userId, permissions });
            }
        } catch (error) {
            console.error("Erro ao atualizar permissões de usuário:", error);
        }
    };

    const updateGlobalNotifications = async (notifications) => {
        try {
            await api.patch('/api/globalNotifications/1', { notifications });
        } catch (error) {
            console.error("Erro ao atualizar notificações:", error);
        }
    };

    // Handlers
    const togglePermission = async (role, perm) => {
        // Impede qualquer alteração nas permissões do diretor
        if (role === "diretor") return;

        const newPermissions = {
            ...(rolePermissions[role] || {}),
            [perm]: !rolePermissions[role]?.[perm]
        };

        setRolePermissions(prev => ({
            ...prev,
            [role]: newPermissions
        }));

        await updateRolePermissions(role, newPermissions);
    };

    const toggleUserPermission = async (userId, perm) => {
        const user = users.find(u => u.id === userId);
        
        // Impede qualquer alteração de permissões para usuários diretor
        if (user && user.role === "diretor") {
            return;
        }

        const currentUserPerms = userSpecificPermissions[userId] || {};
        const newPermissions = {
            ...currentUserPerms,
            [perm]: !currentUserPerms[perm]
        };

        setUserSpecificPermissions(prev => ({
            ...prev,
            [userId]: newPermissions
        }));

        await updateUserSpecificPermissions(userId, newPermissions);
    };

    const toggleGlobalNotification = async (id) => {
        const newNotifications = {
            ...globalNotifications,
            [id]: !globalNotifications[id]
        };

        setGlobalNotifications(newNotifications);
        await updateGlobalNotifications(newNotifications);
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
                            {categories.length === 0 ? (
                                <p className={styles.info}>Nenhum cargo cadastrado.</p>
                            ) : (
                                categories.map((role) => (
                                    <button
                                        key={role}
                                        className={`${styles.roleBtn} ${selectedRole === role ? styles.selected : ""}`}
                                        onClick={() => setSelectedRole(role)}
                                    >
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </button>
                                ))
                            )}
                        </div>

                        {selectedRole && (
                            <div className={styles.permissionsGrid}>
                                {rolePermissions[selectedRole] ? (
                                    Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                                        const value = rolePermissions[selectedRole][key] ?? false;
                                        const isLocked = selectedRole === "diretor";

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
                                                {isLocked && (
                                                    <span style={{ 
                                                        fontSize: '0.7rem', 
                                                        color: '#666', 
                                                        marginLeft: '0.5rem',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        (máximo)
                                                    </span>
                                                )}
                                            </label>
                                        );
                                    })
                                ) : (
                                    <p className={styles.info}>Nenhuma permissão definida para este cargo.</p>
                                )}
                            </div>
                        )}

                        {selectedRole === "diretor" && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                backgroundColor: '#e8f5e8',
                                border: '1px solid #4CAF50',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                color: '#2e7d32'
                            }}>
                                <strong>💡 Informação:</strong> O cargo Diretor possui todas as permissões máximas por padrão. 
                                Para criar cargos com permissões restritas, crie uma nova categoria.
                            </div>
                        )}

                        {categories.length === 0 && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                backgroundColor: '#fff3cd',
                                border: '1px solid #ffc107',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                color: '#856404'
                            }}>
                                <strong>⚠️ Aviso:</strong> Nenhum cargo encontrado. Vá para "Gerenciar Usuários" para criar o primeiro cargo.
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== USUÁRIOS ==================== */}
                {activeTab === "users" && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Permissões por Usuário</h2>

                        <p className={styles.info} style={{ marginBottom: "1.5rem", fontSize: "0.9rem", color: "#555" }}>
                            <strong>Atenção:</strong> As permissões aqui <strong>sobrepõem</strong> as do cargo.</p>

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
                                        <strong>{user.username}</strong> <small>({user.role})</small>
                                    </button>
                                ))
                            )}
                        </div>

                        {selectedUser && (
                            <div className={styles.userPermissions}>
                                <h3 style={{ margin: "1.5rem 0 1rem", color: "var(--azul)" }}>
                                    {selectedUser.username}
                                </h3>
                                <p><strong>Cargo:</strong> {selectedUser.role}</p>

                                <h4 style={{ margin: "1.5rem 0 0.8rem", fontSize: "1rem" }}>
                                    Permissões de Usuário:
                                </h4>

                                <div className={styles.permissionsGrid}>
                                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                                        const rolePerm = rolePermissions[selectedUser.role]?.[key] ?? false;
                                        const userPerm = userSpecificPermissions[selectedUser.id]?.[key] ?? null;
                                        const finalValue = userPerm !== null ? userPerm : rolePerm;
                                        const isOverridden = userPerm !== null && userPerm !== rolePerm;
                                        
                                        // Para diretor, todas as permissões são travadas
                                        const isLocked = selectedUser.role === "diretor";

                                        return (
                                            <label
                                                key={key}
                                                className={styles.switchLabel}
                                                style={{
                                                    opacity: isLocked ? 0.7 : 1,
                                                    position: "relative"
                                                }}
                                            >
                                                <span>
                                                    {label}
                                                    {isOverridden && !isLocked && (
                                                        <span style={{ color: "var(--roxo)", fontSize: "0.75rem", marginLeft: "0.5rem" }}>★</span>
                                                    )}
                                                </span>
                                                <div
                                                    className={`${styles.switch} ${finalValue ? styles.on : styles.off} ${isLocked ? styles.locked : ""}`}
                                                    onClick={() => {
                                                        if (isLocked) return;
                                                        toggleUserPermission(selectedUser.id, key);
                                                    }}
                                                    style={{
                                                        cursor: isLocked ? "not-allowed" : "pointer"
                                                    }}
                                                >
                                                    <div className={styles.slider} />
                                                </div>
                                                {isLocked && (
                                                    <span style={{ 
                                                        fontSize: '0.7rem', 
                                                        color: '#666', 
                                                        marginLeft: '0.5rem',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        (máximo)
                                                    </span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>

                                <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "1rem" }}>
                                    ★ = Permissão sobrescrita (diferente do cargo)
                                </p>

                                {selectedUser.role === "diretor" && (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '0.75rem',
                                        backgroundColor: '#e8f5e8',
                                        border: '1px solid #4CAF50',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        color: '#2e7d32'
                                    }}>
                                        <strong>💡 Informação:</strong> Usuários com cargo Diretor possuem todas as permissões máximas 
                                        e não podem ter suas permissões personalizadas alteradas.
                                    </div>
                                )}
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
                <p><strong>Todas as alterações são salvas automaticamente no servidor.</strong></p>
            </div>
        </div>
    );
};

export default DirectorPanel;