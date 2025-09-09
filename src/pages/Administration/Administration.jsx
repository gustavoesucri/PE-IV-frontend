// src/pages/Administration/Administration.jsx
import React, { useState, useEffect } from "react";
import {
  FiMenu, FiSettings, FiLogOut,
  FiBriefcase, FiUsers, FiUser, FiCheckCircle
} from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import styles from "./Administration.module.css";

const Administration = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [monitoredStudents, setMonitoredStudents] = useState([
    { id: 1, nome: "Rodrigo Martins", observacaoBreve: "Faltando muito no trabalho", observacaoDetalhada: "Faltou às últimas 3 reuniões e precisa melhorar a pontualidade.", dataNascimento: "1998-05-15" },
    { id: 2, nome: "Maria Silva", observacaoBreve: "Ótimo desempenho", observacaoDetalhada: "Aluno demonstra excelente adaptação ao ambiente de trabalho e habilidades técnicas avançadas.", dataNascimento: "2000-11-22" },
    { id: 3, nome: "João Souza", observacaoBreve: "Precisa melhorar foco", observacaoDetalhada: "Necessita acompanhamento constante para manter atenção nas tarefas.", dataNascimento: "1999-04-03" },
  ]);

  const navigate = useNavigate();

  const notifications = [
    "Novo aluno cadastrado: Maria",
    "Reunião de professores às 15h",
    "Aluno João está doente"
  ];

  const openSidebar = () => setShowSidebar(true);
  const closeSidebar = () => setShowSidebar(false);
  const handleLogout = () => navigate("/");

  const openStudentProfile = (student) => setSelectedStudent(student);
  const closeStudentProfile = () => setSelectedStudent(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        closeSidebar();
        setSelectedStudent(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={styles.container}>
      {/* Botão de Menu e Notificações */}
      <div className={styles.topButtons}>
        <button
          className={styles.iconButton}
          aria-label="Abrir menu"
          onClick={openSidebar}
        >
          <FiMenu size={26} />
        </button>
        <div className={styles.notificationWrapper}>
          <button
            className={`${styles.iconButton} ${styles.iconBlue}`}
            aria-label="Abrir notificações"
            onClick={() => setShowNotifications(v => !v)}
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

      {/* Overlay do Menu */}
      {showSidebar && <div className={styles.overlay} onClick={closeSidebar} />}

      {/* Menu Lateral */}
      <aside className={`${styles.sidebar} ${showSidebar ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarItem} onClick={() => navigate("/settings")}>
          <FiSettings size={20} /><span>Configurações</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/students")}>
          <FiUsers size={20} /><span>Estudantes</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/users")}>
          <FiUser size={20} /><span>Usuários</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/companies")}>
          <FiBriefcase size={20} /><span>Empresas</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/assessment")}>
          <FiCheckCircle size={20} /><span>Avaliação</span>
        </div>
        <div className={styles.logoutButton} onClick={handleLogout}>
          <FiLogOut size={20} /><span>Sair</span>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className={styles.mainContent}>
        <div className={styles.studentsContainer}>
          <h2>Alunos Cadastrados</h2>
          <div className={styles.studentsBox}>
            {monitoredStudents.map((aluno) => (
              <div
                key={aluno.id}
                className={styles.studentRow}
                role="button"
                tabIndex={0}
                onClick={() => openStudentProfile(aluno)}
              >
                <span className={styles.studentName}>{aluno.nome}</span>
                <span className={styles.studentObs}>{aluno.observacaoBreve}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal do Perfil do Aluno */}
      {selectedStudent && (
        <div className={styles.modalOverlay} onClick={closeStudentProfile}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={closeStudentProfile}>×</button>
            <h2>Perfil do Aluno</h2>
            <div className={styles.infoRow}>
              <span className={styles.label}>Nome Completo:</span>
              <span className={styles.value}>{selectedStudent.nome}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Data de Nascimento:</span>
              <span className={styles.value}>{selectedStudent.dataNascimento}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Observação Breve:</span>
              <span className={styles.value}>{selectedStudent.observacaoBreve}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Observação Detalhada:</span>
              <span className={styles.value}>{selectedStudent.observacaoDetalhada}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administration;
