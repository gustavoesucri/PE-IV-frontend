// src/pages/DirectorPanel/DirectorPanel.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./DirectorPanel.module.css";
import Menu from "../../components/Menu/Menu";
import { Shield, Bell, Users, Settings, ChevronRight, UserCog, User, Trash2, X } from "lucide-react";
import api from "../../api";

const NOTIFICATION_EVENTS = [
    { id: "new_student", label: "Novo aluno registrado" },
    { id: "new_evaluation", label: "Nova avaliação submetida" },
    { id: "new_observation", label: "Nova observação de acompanhamento" },
    { id: "user_created", label: "Novo usuário criado" },
];

// Permissões que aparecem para todos os cargos
const COMMON_PERMISSION_LABELS = {
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
};

// Permissões exclusivas do diretor
const DIRECTOR_EXCLUSIVE_PERMISSIONS = {
    manage_users: "Gerenciar usuários",
    manage_permissions: "Gerenciar permissões",
};

const DirectorPanel = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Protege acesso: somente diretor pode ver este painel
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
            console.error('Erro verificando usuário para DirectorPanel', err);
            navigate('/');
        }
    }, [navigate]);

    // Estados
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [rolePermissions, setRolePermissions] = useState({});
    const [userSpecificPermissions, setUserSpecificPermissions] = useState({});
    const [globalNotifications, setGlobalNotifications] = useState({});
    const [activeTab, setActiveTab] = useState("roles");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [hoveredRole, setHoveredRole] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, roleToDelete: null });

    // Função para obter as labels de permissão baseadas no cargo
    const getPermissionLabels = (role) => {
        if (role === "diretor") {
            return { ...COMMON_PERMISSION_LABELS, ...DIRECTOR_EXCLUSIVE_PERMISSIONS };
        }
        return COMMON_PERMISSION_LABELS;
    };

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

    // Função para deletar cargo
    const deleteRole = async (role) => {
        try {
            // Verificar se há usuários usando este cargo
            const usersWithRole = users.filter(user => user.role === role);
            
            if (usersWithRole.length > 0) {
                alert(`Não é possível deletar o cargo "${role}" pois existem ${usersWithRole.length} usuário(s) usando este cargo. Atribua outro cargo aos usuários antes de deletar.`);
                return;
            }

            // Buscar o ID da rolePermission para deletar
            const rolePermsResponse = await api.get('/api/rolePermissions');
            const roleToDelete = rolePermsResponse.data.find(rp => rp.role === role);
            
            if (roleToDelete) {
                await api.delete(`/api/rolePermissions/${roleToDelete.id}`);
                
                // Recarregar dados
                loadData();
                
                // Se o cargo deletado era o selecionado, selecionar o primeiro disponível
                if (selectedRole === role) {
                    const newCategories = categories.filter(cat => cat !== role);
                    if (newCategories.length > 0) {
                        setSelectedRole(newCategories[0]);
                    } else {
                        setSelectedRole("");
                    }
                }
                
                setDeleteModal({ isOpen: false, roleToDelete: null });
            }
        } catch (error) {
            console.error("Erro ao deletar cargo:", error);
            alert("Erro ao deletar cargo. Tente novamente.");
        }
    };

    // Função para abrir modal de confirmação
    const openDeleteModal = (role) => {
        // Impedir deletar o cargo "diretor"
        if (role === "diretor") {
            alert("O cargo 'diretor' não pode ser deletado.");
            return;
        }
        setDeleteModal({ isOpen: true, roleToDelete: role });
    };

    // Função para fechar modal
    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, roleToDelete: null });
    };

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
                    <User size={20} /> Criar Usuário
                    <ChevronRight size={18} />
                </button>
                <button className={styles.actionBtn} onClick={() => navigate("/users-list")}>
                    <Users size={20} /> Lista de Usuários
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
                                        onMouseEnter={() => setHoveredRole(role)}
                                        onMouseLeave={() => setHoveredRole(null)}
                                    >
                                        <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                                        {hoveredRole === role && role !== "diretor" && (
                                            <div 
                                                className={styles.deleteIcon}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteModal(role);
                                                }}
                                                title="Deletar cargo"
                                            >
                                                <Trash2 size={14} />
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        {selectedRole && (
                            <div className={styles.permissionsGrid}>
                                {rolePermissions[selectedRole] ? (
                                    Object.entries(getPermissionLabels(selectedRole)).map(([key, label]) => {
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
                                    {Object.entries(getPermissionLabels(selectedUser.role)).map(([key, label]) => {
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

            {/* Modal de Confirmação de Deleção */}
            {deleteModal.isOpen && (
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
                                Tem certeza que deseja deletar o cargo <strong>"{deleteModal.roleToDelete}"</strong>?
                            </p>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                onClick={() => deleteRole(deleteModal.roleToDelete)}
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

            <div className={styles.footer}>
                <p><strong>Todas as alterações são salvas automaticamente no servidor.</strong></p>
            </div>
        </div>
    );
};

export default DirectorPanel;