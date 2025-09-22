import React, { useState, useEffect, useRef } from "react";
import {
  FiMenu, FiSettings, FiLogOut,
  FiBriefcase, FiUsers, FiUser, FiCheckCircle, FiPlus, FiBarChart2, FiFileText, FiUserCheck,
  FiGrid
} from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import styles from "./Administration.module.css";
import "react-resizable/css/styles.css";

const Administration = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddStudentDropdown, setShowAddStudentDropdown] = useState(false);
  const [monitoredStudents, setMonitoredStudents] = useState([
    {
      id: 1,
      nome: "Rodrigo Martins",
      observacaoBreve: "Faltando muito no trabalho",
      observacaoDetalhada: "Faltou às últimas 3 reuniões e precisa melhorar a pontualidade.",
      dataNascimento: "1998-05-15",
      acompanhamento: {
        dataEntrada: "2023-04-01",
        av1: true,
        av2: true,
        entrevista1: true,
        entrevista2: true,
        resultado: "Aprovado"
      }
    },
    {
      id: 2,
      nome: "Maria Silva",
      observacaoBreve: "Ótimo desempenho",
      observacaoDetalhada: "Aluno demonstra excelente adaptação ao ambiente de trabalho e habilidades técnicas avançadas.",
      dataNascimento: "2000-11-22",
      acompanhamento: {
        dataEntrada: "2023-05-15",
        av1: true,
        av2: true,
        entrevista1: true,
        entrevista2: false,
        resultado: "Não Aprovado"
      }
    },
    {
      id: 3,
      nome: "João Souza",
      observacaoBreve: "Precisa melhorar foco",
      observacaoDetalhada: "Necessita acompanhamento constante para manter atenção nas tarefas.",
      dataNascimento: "1999-04-03",
      acompanhamento: {
        dataEntrada: "2023-06-10",
        av1: true,
        av2: false,
        entrevista1: false,
        entrevista2: false,
        resultado: "Em Experiência"
      }
    }
  ]);

  const draggableRef = useRef(null);

  // Simulated list of available students (as if pulled from another source)
  const availableStudents = [
    { id: 4, nome: "Ana Pereira", observacaoBreve: "Boa participação", observacaoDetalhada: "Demonstra interesse nas atividades, mas precisa melhorar prazos.", dataNascimento: "2001-07-10" },
    { id: 5, nome: "Carlos Oliveira", observacaoBreve: "Falta engajamento", observacaoDetalhada: "Precisa se envolver mais nas tarefas em grupo.", dataNascimento: "1997-03-25" },
    { id: 6, nome: "Fernanda Costa", observacaoBreve: "Excelente liderança", observacaoDetalhada: "Mostra habilidades de liderança e organização.", dataNascimento: "2000-09-12" },
  ];

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

  const toggleAddStudentDropdown = () => setShowAddStudentDropdown(v => !v);

  const addStudent = (student) => {
    setMonitoredStudents([...monitoredStudents, { ...student, id: monitoredStudents.length + 1 }]);
    setShowAddStudentDropdown(false);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        closeSidebar();
        setSelectedStudent(null);
        setShowAddStudentDropdown(false);
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
        <div className={styles.sidebarItem} onClick={() => navigate("/administration")}>
          <FiGrid size={20} /> <span>Administração</span>
        </div>
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
        <div className={styles.sidebarItem} onClick={() => navigate("/control")}>
          <FiBarChart2 size={20} /><span>Controle Interno</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/employment-placement")}>
          <FiUserCheck size={20} /><span>Encaminhados</span>
        </div>
        <div className={styles.sidebarItem} onClick={() => navigate("/follow-up")}>
          <FiFileText size={20} /><span>Acompanhamento</span>
        </div>
        <div className={styles.logoutButton} onClick={handleLogout}>
          <FiLogOut size={20} /><span>Sair</span>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className={styles.mainContent}>
        <Draggable nodeRef={draggableRef} handle={`.${styles.studentsContainerHeader}`}>
          <div ref={draggableRef}>
            <ResizableBox
              width={800}
              height={400}
              minConstraints={[300, 200]}
              maxConstraints={[1000, 600]}
              className={styles.studentsContainer}
            >
              <div className={styles.studentsContainerHeader}>
                <h2>Alunos em Acompanhamento</h2>
                <div className={styles.addStudentWrapper}>
                  <button
                    className={`${styles.iconAdd}`}
                    aria-label="Adicionar aluno"
                    onClick={toggleAddStudentDropdown}
                  >
                    <FiPlus size={20} />
                  </button>
                  {showAddStudentDropdown && (
                    <div className={styles.addStudentDropdown}>
                      <h4>Adicionar Aluno</h4>
                      <ul>
                        {availableStudents
                          .filter(student => !monitoredStudents.some(monitored => monitored.nome === student.nome))
                          .map((student, i) => (
                            <li
                              key={i}
                              onClick={() => addStudent(student)}
                              role="button"
                              tabIndex={0}
                            >
                              {student.nome}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
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
            </ResizableBox>
          </div>
        </Draggable>
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
            <div className={styles.infoRow}>
              <span className={styles.label}>Data de Entrada:</span>
              <span className={styles.value}>
                {selectedStudent.acompanhamento?.dataEntrada}
              </span>
            </div>

            {/* AV1 + AV2 lado a lado */}
            <div className={styles.infoGroup}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Av1:</span>
                <span className={`${styles.value} ${styles.iconStatus} ${selectedStudent.acompanhamento?.av1 ? styles.iconGreen : styles.iconRed}`}>
                  {selectedStudent.acompanhamento?.av1 ? "✔" : "X"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Av2:</span>
                <span className={`${styles.value} ${styles.iconStatus} ${selectedStudent.acompanhamento?.av2 ? styles.iconGreen : styles.iconRed}`}>
                  {selectedStudent.acompanhamento?.av2 ? "✔" : "X"}
                </span>
              </div>
            </div>

            {/* Entrevista Pais 1 + 2 lado a lado */}
            <div className={styles.infoGroup}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Entrevista Pais:</span>
                <span className={`${styles.value} ${styles.iconStatus} ${selectedStudent.acompanhamento?.entrevista1 ? styles.iconGreen : styles.iconRed}`}>
                  {selectedStudent.acompanhamento?.entrevista1 ? "✔" : "X"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Entrevista Pais 2:</span>
                <span className={`${styles.value} ${styles.iconStatus} ${selectedStudent.acompanhamento?.entrevista2 ? styles.iconGreen : styles.iconRed}`}>
                  {selectedStudent.acompanhamento?.entrevista2 ? "✔" : "X"}
                </span>
              </div>
            </div>

            {/* Resultado final (linha única) */}
            <div className={styles.infoRow}>
              <span className={styles.label}>Resultado:</span>
              <span className={styles.value}>
                {selectedStudent.acompanhamento?.resultado}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administration;