import React, { useState, useEffect, useRef } from "react";
import { FiMenu, FiSettings, FiLogOut, FiBriefcase, FiUsers, FiUser, FiCheckCircle, FiPlus, FiBarChart2, FiFileText, FiUserCheck, FiGrid } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ReactDraggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import styles from "./Administration.module.css";
import "react-resizable/css/styles.css";

const Administration = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAddStudentDropdown, setShowAddStudentDropdown] = useState(false);
  const [showAddCompanyDropdown, setShowAddCompanyDropdown] = useState(false);
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
        resultado: "Aprovado",
      },
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
        resultado: "Não Aprovado",
      },
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
        resultado: "Em Experiência",
      },
    },
  ]);
  const [companies, setCompanies] = useState([]);
  const [notes, setNotes] = useState([{ id: 1, content: "" }]);

  // Single useRef to store all note refs, keyed by note ID
  const notesRefs = useRef({});

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
    { id: "students", label: "Estudantes", path: "/students" },
    { id: "users", label: "Usuários", path: "/users" },
    { id: "companies", label: "Empresas", path: "/companies" },
    { id: "assessment", label: "Avaliação", path: "/assessment" },
    { id: "control", label: "Controle Interno", path: "/control" },
    { id: "employment-placement", label: "Encaminhados", path: "/employment-placement" },
    { id: "follow-up", label: "Acompanhamento", path: "/follow-up" },
  ];

  const [sidebarItems, setSidebarItems] = useState(() => {
    try {
      const savedOrder = localStorage.getItem("sidebarOrder");
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        return parsed
          .filter((item) => initialSidebarItems.some((initial) => initial.id === item.id))
          .map((item) => ({ ...item, icon: iconMap[item.id] || FiGrid }));
      }
      return initialSidebarItems.map((item) => ({ ...item, icon: iconMap[item.id] }));
    } catch (error) {
      console.error("Failed to load sidebar order from localStorage:", error);
      return initialSidebarItems.map((item) => ({ ...item, icon: iconMap[item.id] }));
    }
  });

  const draggableRef = useRef(null);
  const companyDraggableRef = useRef(null);
  const counterRef = useRef(null);
  const statsRef = useRef(null);

  const availableStudents = [
    {
      id: 4,
      nome: "Ana Pereira",
      observacaoBreve: "Boa participação",
      observacaoDetalhada: "Demonstra interesse nas atividades, mas precisa melhorar prazos.",
      dataNascimento: "2001-07-10",
    },
    {
      id: 5,
      nome: "Carlos Oliveira",
      observacaoBreve: "Falta engajamento",
      observacaoDetalhada: "Precisa se envolver mais nas tarefas em grupo.",
      dataNascimento: "1997-03-25",
    },
    {
      id: 6,
      nome: "Fernanda Costa",
      observacaoBreve: "Excelente liderança",
      observacaoDetalhada: "Mostra habilidades de liderança e organização.",
      dataNascimento: "2000-09-12",
    },
  ];

  const availableCompanies = [
    {
      id: 1,
      nome: "Empresa XYZ",
      cnpj: "12345678901234",
      rua: "Rua Exemplo",
      numero: 123,
      bairro: "Bairro Centro",
      estado: "SP",
      cep: "01234-567",
    },
    {
      id: 2,
      nome: "Corp ABC",
      cnpj: "98765432109876",
      rua: "Avenida Principal",
      numero: 456,
      bairro: "Bairro Norte",
      estado: "RJ",
      cep: "20000-000",
    },
  ];

  const navigate = useNavigate();
  const notifications = ["Novo aluno cadastrado: Maria", "Reunião de professores às 15h", "Aluno João está doente"];

  const openSidebar = () => setShowSidebar(true);
  const closeSidebar = () => setShowSidebar(false);
  const handleLogout = () => navigate("/");
  const openStudentProfile = (student) => setSelectedStudent(student);
  const closeStudentProfile = () => setSelectedStudent(null);
  const openCompanyProfile = (company) => setSelectedCompany(company);
  const closeCompanyProfile = () => setSelectedCompany(null);
  const toggleAddStudentDropdown = () => setShowAddStudentDropdown((v) => !v);
  const toggleAddCompanyDropdown = () => setShowAddCompanyDropdown((v) => !v);

  const addStudent = (student) => {
    setMonitoredStudents([...monitoredStudents, { ...student, id: monitoredStudents.length + 1 }]);
    setShowAddStudentDropdown(false);
  };

  const addCompany = (company) => {
    setCompanies([...companies, { ...company, id: companies.length + 1 }]);
    setShowAddCompanyDropdown(false);
  };

  const addNewNote = () => {
    setNotes([...notes, { id: Date.now(), content: "" }]);
  };

  const updateNote = (id, newContent) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, content: newContent } : note)));
  };

  const onDragStart = () => {
    console.log("Drag started in Administration.jsx");
  };

  const onDragEnd = (result) => {
    console.log("Drag ended in Administration.jsx:", result);
    if (!result.destination) return;
    const reorderedItems = Array.from(sidebarItems);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);
    setSidebarItems(reorderedItems);
    try {
      const itemsToSave = reorderedItems.map(({ id, label, path }) => ({ id, label, path }));
      localStorage.setItem("sidebarOrder", JSON.stringify(itemsToSave));
    } catch (error) {
      console.error("Failed to save sidebar order to localStorage:", error);
    }
  };

  useEffect(() => {
    console.log("Sidebar items in Administration.jsx:", sidebarItems.map((item) => item.id));
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        closeSidebar();
        setSelectedStudent(null);
        setSelectedCompany(null);
        setShowAddStudentDropdown(false);
        setShowAddCompanyDropdown(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarItems]);

  // Ensure refs are created/updated for each note
  useEffect(() => {
    notes.forEach((note) => {
      if (!notesRefs.current[note.id]) {
        notesRefs.current[note.id] = React.createRef();
      }
    });
    // Clean up refs for notes that no longer exist
    Object.keys(notesRefs.current).forEach((key) => {
      if (!notes.some((note) => note.id === parseInt(key))) {
        delete notesRefs.current[key];
      }
    });
  }, [notes]);

  return (
    <div className={styles.container}>
      <div className={styles.topButtons}>
        <button className={styles.iconButton} aria-label="Abrir menu" onClick={openSidebar}>
          <FiMenu size={26} />
        </button>
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

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <aside className={`${styles.sidebar} ${showSidebar ? styles.sidebarOpen : ""}`}>
          {showSidebar && (
            <Droppable droppableId="sidebar">
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className={styles.droppableContainer}>
                  {sidebarItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${styles.sidebarItem} ${snapshot.isDragging ? styles.dragging : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(item.path);
                          }}
                        >
                          {item.icon ? <item.icon size={20} /> : <FiGrid size={20} />}
                          <span>{item.label}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
          <div className={styles.logoutButton} onClick={handleLogout}>
            <FiLogOut size={20} />
            <span>Sair</span>
          </div>
        </aside>
      </DragDropContext>

      <main className={styles.mainContent}>
        {/* Widget: Alunos em Acompanhamento */}
        <ReactDraggable nodeRef={draggableRef} handle={`.${styles.studentsContainerHeader}`} defaultPosition={{ x: 100, y: 100 }}>
          <div ref={draggableRef}>
            <ResizableBox width={800} height={400} minConstraints={[300, 200]} maxConstraints={[1000, 600]} className={styles.studentsContainer}>
              <div>
                <div className={styles.studentsContainerHeader}>
                  <h2>Alunos em Acompanhamento</h2>
                  <div className={styles.addStudentWrapper}>
                    <button className={styles.iconAdd} aria-label="Adicionar aluno" onClick={toggleAddStudentDropdown}>
                      <FiPlus size={20} />
                    </button>
                    {showAddStudentDropdown && (
                      <div className={styles.addStudentDropdown}>
                        <h4>Adicionar Aluno</h4>
                        <ul>
                          {availableStudents
                            .filter((student) => !monitoredStudents.some((monitored) => monitored.nome === student.nome))
                            .map((student, i) => (
                              <li key={i} onClick={() => addStudent(student)} role="button" tabIndex={0}>
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
              </div>
            </ResizableBox>
          </div>
        </ReactDraggable>

        {/* Widget: Empresas */}
        <ReactDraggable nodeRef={companyDraggableRef} handle={`.${styles.studentsContainerHeader}`} defaultPosition={{ x: 200, y: 200 }}>
          <div ref={companyDraggableRef}>
            <ResizableBox width={800} height={400} minConstraints={[300, 200]} maxConstraints={[1000, 600]} className={styles.studentsContainer}>
              <div>
                <div className={styles.studentsContainerHeader}>
                  <h2>Empresas</h2>
                  <div className={styles.addStudentWrapper}>
                    <button className={styles.iconAdd} aria-label="Adicionar empresa" onClick={toggleAddCompanyDropdown}>
                      <FiPlus size={20} />
                    </button>
                    {showAddCompanyDropdown && (
                      <div className={styles.addStudentDropdown}>
                        <h4>Adicionar Empresa</h4>
                        <ul>
                          {availableCompanies
                            .filter((company) => !companies.some((comp) => comp.nome === company.nome))
                            .map((company, i) => (
                              <li key={i} onClick={() => addCompany(company)} role="button" tabIndex={0}>
                                {company.nome}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.studentsBox}>
                  {companies.map((empresa) => (
                    <div
                      key={empresa.id}
                      className={styles.studentRow}
                      role="button"
                      tabIndex={0}
                      onClick={() => openCompanyProfile(empresa)}
                    >
                      <span className={styles.studentName}>{empresa.nome}</span>
                      <span className={styles.studentObs}>{empresa.cnpj}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ResizableBox>
          </div>
        </ReactDraggable>

        {/* Widget: Contador de Empresas Cadastradas */}
        <ReactDraggable nodeRef={counterRef} defaultPosition={{ x: 300, y: 300 }}>
          <div ref={counterRef}>
            <ResizableBox width={300} height={100} minConstraints={[150, 50]} maxConstraints={[500, 200]} className={styles.counterContainer}>
              <div className={styles.counterText}>
                <span className={styles.counterNumber}>{companies.length}</span> Empresas cadastradas
              </div>
            </ResizableBox>
          </div>
        </ReactDraggable>

        {/* Widget: Estatísticas de Alunos */}
        <ReactDraggable nodeRef={statsRef} defaultPosition={{ x: 400, y: 400 }}>
          <div ref={statsRef}>
            <ResizableBox width={500} height={300} minConstraints={[300, 200]} maxConstraints={[800, 500]} className={styles.statsContainer}>
              <div className={styles.statsContent}>
                <div className={styles.statItem}>31 Alunos Registrados</div>
                <div className={styles.statItem}>
                  25 Alunos no Mercado de Trabalho
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar} style={{ width: `${(25 / 31) * 100}%` }}></div>
                  </div>
                  <span className={styles.percentage}>{Math.round((25 / 31) * 100)}%</span>
                </div>
                <div className={styles.statItem}>
                  4 Aprovados
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar} style={{ width: `${(4 / 31) * 100}%` }}></div>
                  </div>
                  <span className={styles.percentage}>{Math.round((4 / 31) * 100)}%</span>
                </div>
                <div className={styles.statItem}>
                  2 Reprovados
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar} style={{ width: `${(2 / 31) * 100}%` }}></div>
                  </div>
                  <span className={styles.percentage}>{Math.round((2 / 31) * 100)}%</span>
                </div>
              </div>
            </ResizableBox>
          </div>
        </ReactDraggable>

        {/* Widgets: Blocos de Notas */}
        {notes.map((note, index) => (
          <ReactDraggable
            key={note.id}
            nodeRef={notesRefs.current[note.id]}
            defaultPosition={{ x: 500 + index * 50, y: 500 + index * 50 }}
          >
            <div ref={notesRefs.current[note.id]}>
              <ResizableBox width={400} height={300} minConstraints={[200, 150]} maxConstraints={[600, 400]} className={styles.notesContainer}>
                <div className={styles.notesContent}>
                  <textarea
                    className={styles.notesTextarea}
                    value={note.content}
                    onChange={(e) => updateNote(note.id, e.target.value)}
                    placeholder="Escreva sua nota aqui..."
                  />
                  <button className={styles.addNoteButton} onClick={addNewNote}>
                    <FiPlus size={16} />
                  </button>
                </div>
              </ResizableBox>
            </div>
          </ReactDraggable>
        ))}
      </main>

      {selectedStudent && (
        <div className={styles.modalOverlay} onClick={closeStudentProfile}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={closeStudentProfile}>
              ×
            </button>
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
              <span className={styles.value}>{selectedStudent.acompanhamento?.dataEntrada}</span>
            </div>
            <div className={styles.infoGroup}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Av1:</span>
                <span
                  className={`${styles.value} ${styles.iconStatus} ${
                    selectedStudent.acompanhamento?.av1 ? styles.iconGreen : styles.iconRed
                  }`}
                >
                  {selectedStudent.acompanhamento?.av1 ? "✔" : "X"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Av2:</span>
                <span
                  className={`${styles.value} ${styles.iconStatus} ${
                    selectedStudent.acompanhamento?.av2 ? styles.iconGreen : styles.iconRed
                  }`}
                >
                  {selectedStudent.acompanhamento?.av2 ? "✔" : "X"}
                </span>
              </div>
            </div>
            <div className={styles.infoGroup}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Entrevista Pais:</span>
                <span
                  className={`${styles.value} ${styles.iconStatus} ${
                    selectedStudent.acompanhamento?.entrevista1 ? styles.iconGreen : styles.iconRed
                  }`}
                >
                  {selectedStudent.acompanhamento?.entrevista1 ? "✔" : "X"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Entrevista Pais 2:</span>
                <span
                  className={`${styles.value} ${styles.iconStatus} ${
                    selectedStudent.acompanhamento?.entrevista2 ? styles.iconGreen : styles.iconRed
                  }`}
                >
                  {selectedStudent.acompanhamento?.entrevista2 ? "✔" : "X"}
                </span>
              </div>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Resultado:</span>
              <span className={styles.value}>{selectedStudent.acompanhamento?.resultado}</span>
            </div>
          </div>
        </div>
      )}

      {selectedCompany && (
        <div className={styles.modalOverlay} onClick={closeCompanyProfile}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={closeCompanyProfile}>
              ×
            </button>
            <h2>Perfil da Empresa</h2>
            <div className={styles.infoRow}>
              <span className={styles.label}>Nome:</span>
              <span className={styles.value}>{selectedCompany.nome}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>CNPJ:</span>
              <span className={styles.value}>{selectedCompany.cnpj}</span>
            </div>
            <div className={styles.infoGroup}>
              <h3>Endereço</h3>
              <div className={styles.infoRow}>
                <span className={styles.label}>Rua:</span>
                <span className={styles.value}>{selectedCompany.rua}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Número:</span>
                <span className={styles.value}>{selectedCompany.numero}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Bairro:</span>
                <span className={styles.value}>{selectedCompany.bairro}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Estado:</span>
                <span className={styles.value}>{selectedCompany.estado}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>CEP:</span>
                <span className={styles.value}>{selectedCompany.cep}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administration;