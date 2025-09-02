import React, { useState, useEffect } from "react";
import {
  FiMenu, FiSettings, FiLogOut,
  FiBriefcase,
  FiUsers,
  FiUser,
  FiCheckCircle
} from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import styles from "./Administration.module.css";

const Administration = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    "Novo aluno cadastrado: Maria",
    "Reunião de professores às 15h",
    "Aluno João está doente"
  ];

  const students = [
    { nome: "Rodrigo", observacao: "Faltando muito no trabalho" },
    { nome: "Maria", observacao: "Ótimo desempenho" },
    { nome: "João", observacao: "Precisa melhorar no foco durante o trabalho" }
  ];

  const openSidebar = () => {
    setShowNotifications(false);
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const handleLogout = () => {
    navigate("/");
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.topButtons}>
        {!showSidebar && (
          <button
            className={styles.iconButton}
            aria-label="Abrir menu"
            onClick={openSidebar}
          >
            <FiMenu size={26} />
          </button>
        )}
        <div className={styles.notificationWrapper}>
          <button
            className={`${styles.iconButton} ${styles.iconBlue}`}
            aria-label="Abrir notificações"
            onClick={() => setShowNotifications((v) => !v)}
          >
            <IoNotificationsOutline size={28} />
          </button>
          {showNotifications && !showSidebar && (
            <div className={styles.notificationsDropdown}>
              <h4>Notificações</h4>
              <ul>
                {notifications.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {showSidebar && <div className={styles.overlay} onClick={closeSidebar} />}

      <aside
        className={`${styles.sidebar} ${showSidebar ? styles.sidebarOpen : ""}`}
        aria-hidden={!showSidebar}
      >
        <div className={styles.sidebarItem} onClick={() => navigate("/settings")}>
          <FiSettings size={20} />
          <span>Configurações</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/students")}>
          <FiUsers size={20} />
          <span>Estudantes</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/users")}>
          <FiUser size={20} />
          <span>Usuários</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/companies")}>
          <FiBriefcase size={20} />
          <span>Empresas</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/assessment")}>
          <FiCheckCircle  size={20} />
          <span>Avaliação</span>
        </div>
        <div className={styles.logoutButton} onClick={handleLogout}>
          <FiLogOut size={20} />
          <span>Sair</span>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <h2>Alunos Cadastrados</h2>
        <div className={styles.studentsBox}>
          {students.map((aluno, i) => (
            <div
              key={i}
              className={styles.studentRow}
              role="button"
              tabIndex={0}
              onClick={() => alert(`Abrir perfil de ${aluno.nome}`)}
            >
              <span className={styles.studentName}>{aluno.nome}</span>
              <span className={styles.studentObs}>{aluno.observacao}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Administration;
