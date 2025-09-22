import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMenu, FiSettings, FiLogOut, FiBriefcase, FiUsers,
  FiUser, FiCheckCircle, FiBarChart2, FiFileText, FiUserCheck, FiGrid
} from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import useMenu from "./useMenu";
import styles from "./Menu.module.css";

// Exportação padrão correta
const Menu = () => {
  const {
    sidebarOpen, notificationsOpen,
    toggleSidebar, toggleNotifications, closeSidebar
  } = useMenu();
  const navigate = useNavigate();

  const notifications = [
    "Novo aluno cadastrado: Maria",
    "Reunião de professores às 15h",
    "Aluno João está doente"
  ];

  return (
    <>
      {/* Top buttons */}
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

      {/* Overlay */}
      {sidebarOpen && <div className={styles.overlay} onClick={closeSidebar} />}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarItem} onClick={() => navigate("/administration")}>
          <FiGrid size={20} /> <span>Administração</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/settings")}>
          <FiSettings size={20} /> <span>Configurações</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/students")}>
          <FiUsers size={20} /> <span>Estudantes</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/users")}>
          <FiUser size={20} /> <span>Usuários</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/companies")}>
          <FiBriefcase size={20} /> <span>Empresas</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/assessment")}>
          <FiCheckCircle size={20} /> <span>Avaliação</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/control")}>
          <FiBarChart2 size={20} /> <span>Controle Interno</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/employment-placement")}>
          <FiUserCheck size={20} /> <span>Encaminhados</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/follow-up")}>
          <FiFileText size={20} /> <span>Acompanhamento</span>
        </div>

        <div className={styles.logoutButton} onClick={() => navigate("/")}>
          <FiLogOut size={20} /> <span>Sair</span>
        </div>
      </aside>
    </>
  );
};

// Exportação padrão
export default Menu;