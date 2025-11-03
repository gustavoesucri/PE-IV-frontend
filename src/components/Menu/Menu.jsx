import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMenu, FiSettings, FiLogOut, FiBriefcase, FiUsers,
  FiCheckCircle, FiBarChart2, FiFileText, FiUserCheck, FiGrid, FiShield, FiArrowLeft, FiCheck
} from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import useMenu from "./useMenu";
import styles from "./Menu.module.css";

// NOTIFICAÇÕES COM DETALHES
const NOTIFICATIONS_DATA = [
  {
    id: 1,
    summary: "Novo aluno cadastrado: Maria Silva",
    title: "Novo Aluno Cadastrado",
    description: "Maria Silva foi cadastrada no sistema como estudante do 2º ano do Ensino Médio.",
    timestamp: "Há 2 minutos",
    read: false
  },
  {
    id: 2,
    summary: "Reunião de professores às 15h",
    title: "Reunião Agendada",
    description: "Reunião geral com todos os professores para alinhamento do semestre. Local: Sala 12.",
    timestamp: "Há 1 hora",
    read: false
  },
  {
    id: 3,
    summary: "Aluno João está doente",
    title: "Aviso de Saúde",
    description: "João informou que está com gripe e não comparecerá às aulas hoje e amanhã.",
    timestamp: "Há 3 horas",
    read: true
  }
];

const Menu = () => {
  const {
    sidebarOpen, notificationsOpen,
    toggleSidebar, toggleNotifications, closeSidebar
  } = useMenu();
  const navigate = useNavigate();

  const iconMap = {
    administration: FiGrid,
    settings: FiSettings,
    students: FiUsers,
    "director-panel": FiShield,
    companies: FiBriefcase,
    assessment: FiCheckCircle,
    control: FiBarChart2,
    "employment-placement": FiUserCheck,
    "follow-up": FiFileText,
  };

  const initialSidebarItems = [
    { id: "administration", label: "Administração", path: "/administration" },
    { id: "settings", label: "Configurações", path: "/settings" },
    {
      id: "students",
      label: "Estudantes",
      path: "/students",
      submenu: [{ label: "Lista de Estudantes", path: "/students-list" }]
    },
    {
      id: "director-panel",
      label: "Painel do Diretor",
      path: "/director-panel",
      submenu: [
        {
          label: "Usuários",
          path: "/users",
          submenu: [
            { label: "Lista de Usuários", path: "/users-list" }
          ]
        }
      ]
    },
    {
      id: "companies",
      label: "Empresas",
      path: "/companies",
      submenu: [{ label: "Lista de Empresas", path: "/companies-list" }]
    },
    {
      id: "employment-placement",
      label: "Encaminhados",
      path: "/employment-placement",
      submenu: [{ label: "Lista de Encaminhados", path: "/employment-placement-list" }]
    },
    {
      id: "assessment",
      label: "Avaliação",
      path: "/assessment",
      submenu: [{ label: "Lista de Avaliações", path: "/assessment-list" }]
    },
    { id: "control", label: "Controle Interno", path: "/control" },
    { id: "follow-up", label: "Acompanhamento", path: "/follow-up" },
  ];

  const [sidebarItems, setSidebarItems] = useState(() => {
    try {
      const savedOrder = localStorage.getItem("sidebarOrder");
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        return parsed
          .filter(item => initialSidebarItems.some(initial => initial.id === item.id))
          .map(item => {
            const original = initialSidebarItems.find(i => i.id === item.id);
            return {
              ...item,
              icon: iconMap[item.id] || FiGrid,
              submenu: original?.submenu || []
            };
          });
      }
      return initialSidebarItems.map(item => ({
        ...item,
        icon: iconMap[item.id] || FiGrid,
        submenu: item.submenu || []
      }));
    } catch (error) {
      return initialSidebarItems.map(item => ({
        ...item,
        icon: iconMap[item.id] || FiGrid,
        submenu: item.submenu || []
      }));
    }
  });

  // NOTIFICAÇÕES COM ESTADO
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : NOTIFICATIONS_DATA;
  });

  const [expandedNotification, setExpandedNotification] = useState(null);

  // Persistir notificações
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItems = Array.from(sidebarItems);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);
    setSidebarItems(reorderedItems);
    try {
      const itemsToSave = reorderedItems.map(({ id, label, path }) => ({ id, label, path }));
      localStorage.setItem("sidebarOrder", JSON.stringify(itemsToSave));
    } catch (error) {
      console.error("Failed to save sidebar order:", error);
    }
  };

  return (
    <>
      <div className={styles.topButtons}>
        <button onClick={toggleSidebar} className={styles.iconButton} aria-label="Menu">
          <FiMenu size={26} />
        </button>

        {/* ÍCONE COM BADGE */}
        <div className={styles.notificationWrapper}>
          <button
            onClick={toggleNotifications}
            className={`${styles.iconButton} ${styles.iconBlue}`}
            aria-label="Notificações"
          >
            <IoNotificationsOutline size={28} />
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>

          {/* DROPDOWN DE NOTIFICAÇÕES */}
          {notificationsOpen && !sidebarOpen && (
            <div className={styles.notificationsDropdown}>
              {expandedNotification ? (
                <>
                  <div className={styles.notificationHeader}>
                    <button
                      onClick={() => setExpandedNotification(null)}
                      className={styles.backButton}
                    >
                      <FiArrowLeft size={18} />
                    </button>
                    <h4>Detalhes da Notificação</h4>
                  </div>
                  <div className={styles.expandedNotification}>
                    <h5>{expandedNotification.title}</h5>
                    <p className={styles.timestamp}>{expandedNotification.timestamp}</p>
                    <p className={styles.description}>{expandedNotification.description}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.notificationHeader}>
                    <h4>Notificações</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className={styles.markAllRead}>
                        <FiCheck size={16} /> Marcar todas como lidas
                      </button>
                    )}
                  </div>
                  <ul className={styles.notificationList}>
                    {notifications.length === 0 ? (
                      <li className={styles.empty}>Nenhuma notificação</li>
                    ) : (
                      notifications.map((n) => (
                        <li
                          key={n.id}
                          className={`${styles.notificationItem} ${!n.read ? styles.unread : ""}`}
                          onClick={() => {
                            markAsRead(n.id);
                            setExpandedNotification(n);
                          }}
                        >
                          <div className={styles.summary}>
                            {!n.read && <span className={styles.unreadDot} />}
                            {n.summary}
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {sidebarOpen && <div className={styles.overlay} onClick={closeSidebar} />}

      <DragDropContext onDragEnd={onDragEnd}>
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
          {sidebarOpen && (
            <Droppable droppableId="sidebar">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={styles.droppableContainer}
                >
                  {sidebarItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${styles.menuGroup} ${snapshot.isDragging ? styles.dragging : ""}`}
                        >
                          <div
                            className={styles.mainItem}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.path) {
                                navigate(item.path);
                                closeSidebar();
                              }
                            }}
                            style={{ cursor: item.path ? "pointer" : "default" }}
                          >
                            {item.icon ? <item.icon size={20} /> : <FiGrid size={20} />}
                            <span>{item.label}</span>
                          </div>

                          {item.submenu?.length > 0 && (
                            <div className={styles.submenu}>
                              {item.submenu.map((sub1, i) => (
                                <div key={i}>
                                  <div
                                    className={styles.subItem}
                                    style={{ paddingLeft: "3.3rem" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (sub1.path) {
                                        navigate(sub1.path);
                                        closeSidebar();
                                      }
                                    }}
                                  >
                                    {sub1.label}
                                  </div>

                                  {sub1.submenu?.length > 0 && (
                                    <div className={styles.subSubmenu}>
                                      {sub1.submenu.map((sub2, j) => (
                                        <div
                                          key={j}
                                          className={styles.subSubItem}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(sub2.path);
                                            closeSidebar();
                                          }}
                                        >
                                          {sub2.label}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
          <div className={styles.logoutButton} onClick={() => navigate("/")}>
            <FiLogOut size={20} /> <span>Sair</span>
          </div>
        </aside>
      </DragDropContext>
    </>
  );
};

export default Menu;