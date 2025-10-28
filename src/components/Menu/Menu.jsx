import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMenu, FiSettings, FiLogOut, FiBriefcase, FiUsers,
  FiUser, FiCheckCircle, FiBarChart2, FiFileText, FiUserCheck, FiGrid
} from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import useMenu from "./useMenu";
import styles from "./Menu.module.css";

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
    users: FiUser,
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
      id: "users",
      label: "Usuários",
      path: "/users",
      submenu: [{ label: "Lista de Usuários", path: "/users-list" }]
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
    { id: "assessment", label: "Avaliação", path: "/assessment" },
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

  const notifications = [
    "Novo aluno cadastrado: Maria",
    "Reunião de professores às 15h",
    "Aluno João está doente"
  ];

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
        <button
          onClick={toggleNotifications}
          className={`${styles.iconButton} ${styles.iconBlue}`}
          aria-label="Notificações"
        >
          <IoNotificationsOutline size={28} />
        </button>

        {notificationsOpen && !sidebarOpen && (
          <div className={styles.notificationsDropdown}>
            <h4>Notificações</h4>
            <ul>
              {notifications.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        )}
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
                          {/* Item Principal - SEMPRE clicável */}
                          <div
                            className={styles.mainItem}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(item.path);
                              closeSidebar();
                            }}
                          >
                            {item.icon ? <item.icon size={20} /> : <FiGrid size={20} />}
                            <span>{item.label}</span>
                          </div>

                          {/* Submenu */}
                          {item.submenu?.length > 0 && (
                            <div className={styles.submenu}>
                              {item.submenu.map((sub, i) => (
                                <div
                                  key={i}
                                  className={styles.subItem}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(sub.path);
                                    closeSidebar();
                                  }}
                                >
                                  {sub.label}
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