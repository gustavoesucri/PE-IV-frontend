import React, { useState, useEffect } from "react";
import styles from "./Administration.module.css";
import { FiMenu, FiSettings } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";

const Administration = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const notifications = [
    "Novo aluno cadastrado: Maria",
    "Reunião de professores às 15h",
    "Aluno João esta Doente",
  ];

  const students = [
    { nome: "Rodrigo", observacao: "Faltando muito no trabalho" },
    { nome: "Maria", observacao: "Ótimo desempenho" },
    { nome: "João", observacao: "Precisa melhorar no foco durante o trabalho" },
  ];

  const openSidebar = () => {
    setShowNotifications(false); // garante que dropdown não fique aberto
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  // Fecha menu com ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={styles.container}>
      {/* Botões flutuantes (fixos) */}
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
                {notifications.map((n, index) => (
                  <li key={index}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Overlay (impede clique e oculta ícones por baixo) */}
      {showSidebar && <div className={styles.overlay} onClick={closeSidebar} />}

      {/* Menu Lateral */}
      <aside
        className={`${styles.sidebar} ${showSidebar ? styles.sidebarOpen : ""}`}
        aria-hidden={!showSidebar}
      >

        <div className={styles.sidebarItem} role="button" tabIndex={0}>
          <FiSettings size={20} />
          <span>Configurações</span>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className={styles.mainContent}>
        <h2>Alunos Cadastrados</h2>
        <div className={styles.studentsBox}>
          {students.map((aluno, index) => (
            <div
              key={index}
              className={styles.studentRow}
              onClick={() => alert(`Abrir perfil de ${aluno.nome}`)}
              role="button"
              tabIndex={0}
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
