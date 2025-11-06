import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { Rnd } from "react-rnd";
import Menu from "../../components/Menu/Menu";
import styles from "./Administration.module.css";
import api from "../../api";

const Administration = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAddStudentDropdown, setShowAddStudentDropdown] = useState(false);
  const [showAddCompanyDropdown, setShowAddCompanyDropdown] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [allCompanies, setAllCompanies] = useState([]);

  // Estados que serão salvos no backend
  const [monitoredStudents, setMonitoredStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [notes, setNotes] = useState([]);
  const [widgetPositions, setWidgetPositions] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Dados de exemplo
  const availableStudents = [
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
    }
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

  // Carregar todas as empresas para o contador
  const loadAllCompanies = useCallback(async () => {
    try {
      const response = await api.get('/api/companies');
      setAllCompanies(response.data);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    }
  }, []);

  const createDefaultUserSettings = useCallback(async (userId) => {
    try {
      const defaultSettings = {
        userId: userId,
        widgetPositions: {
          studentsWidget: { x: 60, y: 60, width: 600, height: 300 },
          companiesWidget: { x: 690, y: 60, width: 600, height: 300 },
          counterWidget: { x: 60, y: 385, width: 300, height: 100 },
          statsWidget: { x: 690, y: 380, width: 400, height: 260 },
        },
        sidebarOrder: [
          "administration",
          "settings",
          "students",
          "director-panel",
          "companies",
          "employment-placement",
          "assessment",
          "control",
          "follow-up"
        ],
        notes: [{ id: Date.now(), content: "" }],
        monitoredStudents: [],
        companies: [],
        updatedAt: new Date().toISOString(),
        settings: {
          notifySystem: true,
          notifyEmail: false
        }
      };

      const response = await api.post('/api/userSettings', defaultSettings);
      return response.data;
      
    } catch (error) {
      console.error("Erro ao criar configurações padrão:", error);
      return {
        id: Date.now(),
        userId: userId,
        widgetPositions: {
          studentsWidget: { x: 60, y: 60, width: 600, height: 300 },
          companiesWidget: { x: 690, y: 60, width: 600, height: 300 },
          counterWidget: { x: 60, y: 385, width: 300, height: 100 },
          statsWidget: { x: 690, y: 380, width: 400, height: 260 },
        },
        notes: [{ id: Date.now(), content: "" }],
        monitoredStudents: [],
        companies: [],
        updatedAt: new Date().toISOString()
      };
    }
  }, []);

  const loadWidgetPositions = useCallback((settings) => {
    const defaultPositions = {
      studentsWidget: { x: 60, y: 60, width: 600, height: 300 },
      companiesWidget: { x: 690, y: 60, width: 600, height: 300 },
      counterWidget: { x: 60, y: 385, width: 300, height: 100 },
      statsWidget: { x: 690, y: 380, width: 400, height: 260 },
    };
    
    const savedPositions = settings.widgetPositions || {};
    const mergedPositions = { ...defaultPositions, ...savedPositions };
    
    // Garantir que todas as notas tenham posições
    const currentNotes = settings.notes && settings.notes.length > 0 ? settings.notes : [{ id: Date.now(), content: "" }];
    currentNotes.forEach((note, index) => {
      const noteKey = `noteWidget_${note.id}`;
      if (!mergedPositions[noteKey]) {
        mergedPositions[noteKey] = {
          x: 380 + index * 50,
          y: 380 + index * 20,
          width: 300,
          height: 150,
        };
      }
    });
    
    setWidgetPositions(mergedPositions);
  }, []);

  // Carregar configurações do usuário do backend
  const loadUserSettings = useCallback(async (userId, permissions) => {
    try {
      // Buscar userSettings do backend
      const response = await api.get(`/api/userSettings?userId=${userId}`);
      
      let settings;
      
      if (response.data.length > 0) {
        // Pega o PRIMEIRO userSettings (evita duplicatas)
        settings = response.data[0];
        setUserSettings(settings);
        
        console.log("Settings carregados:", settings);
        
        // Carregar dados do backend baseado nas permissões
        if (permissions.view_students) {
          setMonitoredStudents(settings.monitoredStudents || []);
        }
        
        if (permissions.view_companies) {
          setCompanies(settings.companies || []);
        }
        
        setNotes(settings.notes && settings.notes.length > 0 ? settings.notes : [{ id: Date.now(), content: "" }]);
        
      } else {
        // SE NÃO EXISTIR CONFIGURAÇÕES, CRIAR NOVAS
        console.log("Criando novas configurações para usuário:", userId);
        const newSettings = await createDefaultUserSettings(userId);
        settings = newSettings;
        setUserSettings(newSettings);
        
        // Inicializar com dados padrão baseado nas permissões
        if (permissions.view_students) {
          setMonitoredStudents([]);
        }
        
        if (permissions.view_companies) {
          setCompanies([]);
        }
        
        setNotes([{ id: Date.now(), content: "" }]);
      }
      
      // Carregar posições dos widgets
      loadWidgetPositions(settings);
      
    } catch (error) {
      console.error("Erro ao carregar configurações do usuário:", error);
      // Fallback para dados padrão em caso de erro
      setNotes([{ id: Date.now(), content: "" }]);
      setWidgetPositions({
        studentsWidget: { x: 60, y: 60, width: 600, height: 300 },
        companiesWidget: { x: 690, y: 60, width: 600, height: 300 },
        counterWidget: { x: 60, y: 385, width: 300, height: 100 },
        statsWidget: { x: 690, y: 380, width: 400, height: 260 },
      });
    }
  }, [createDefaultUserSettings, loadWidgetPositions]);

  // Carregar permissões do usuário
  const loadUserPermissions = useCallback(async (userData) => {
    try {
      // Buscar permissões da role
      const roleResponse = await api.get(`/api/rolePermissions?role=${userData.role}`);
      const rolePermissions = roleResponse.data[0]?.permissions || {};

      // Buscar permissões específicas do usuário
      const userSpecificResponse = await api.get(`/api/userSpecificPermissions?userId=${userData.id}`);
      const userSpecificPermissions = userSpecificResponse.data[0]?.permissions || {};

      // Combinar permissões
      const combinedPermissions = {
        ...rolePermissions,
        ...userSpecificPermissions
      };

      setUserPermissions(combinedPermissions);
      console.log("Permissões carregadas:", combinedPermissions);

      return combinedPermissions;

    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
      const defaultPermissions = {
        view_students: false,
        view_companies: false,
        create_companies: false
      };
      setUserPermissions(defaultPermissions);
      return defaultPermissions;
    }
  }, []);

  // Carregar usuário e permissões - CORRIGIDO sem dependências problemáticas
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) {
          setIsInitialized(true);
          return;
        }

        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);

        // 1. Primeiro carrega permissões
        const permissions = await loadUserPermissions(userData);

        // 2. Depois carrega empresas (se tiver permissão)
        if (permissions.view_companies) {
          await loadAllCompanies();
        }

        // 3. Finalmente carrega configurações com as permissões
        await loadUserSettings(userData.id, permissions);
        
        setIsInitialized(true);
        
      } catch (error) {
        console.error("Erro ao inicializar dados do usuário:", error);
        setIsInitialized(true);
      }
    };

    initializeUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependências removidas - função é executada apenas uma vez

  // Salvar configurações no backend
  const saveUserSettings = useCallback(async (updates) => {
    if (!currentUser || !userSettings) {
      console.log("Não foi possível salvar: usuário ou configurações não disponíveis");
      return;
    }

    try {
      const updatedSettings = {
        ...userSettings,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      console.log("Salvando configurações:", updates);
      await api.patch(`/api/userSettings/${userSettings.id}`, updatedSettings);
      setUserSettings(updatedSettings);
      
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
  }, [currentUser, userSettings]);

  // Salvar alunos monitorados (apenas se tiver permissão)
  useEffect(() => {
    if (isInitialized && userSettings && userPermissions.view_students) {
      saveUserSettings({ monitoredStudents });
    }
  }, [monitoredStudents, saveUserSettings, userSettings, userPermissions.view_students, isInitialized]);

  // Salvar empresas (apenas se tiver permissão)
  useEffect(() => {
    if (isInitialized && userSettings && userPermissions.view_companies) {
      saveUserSettings({ companies });
    }
  }, [companies, saveUserSettings, userSettings, userPermissions.view_companies, isInitialized]);

  // Salvar notas
  useEffect(() => {
    if (isInitialized && userSettings && notes.length > 0) {
      saveUserSettings({ notes });
    }
  }, [notes, saveUserSettings, userSettings, isInitialized]);

  // Salvar posições dos widgets
  const saveWidgetPosition = useCallback(async (widgetId, x, y, width, height) => {
    if (!isInitialized || !userSettings) return;
    
    const newPositions = { ...widgetPositions, [widgetId]: { x, y, width, height } };
    setWidgetPositions(newPositions);
    
    await saveUserSettings({ widgetPositions: newPositions });
  }, [widgetPositions, userSettings, saveUserSettings, isInitialized]);

  // Funções de estudantes
  const openStudentProfile = (student) => {
    setSelectedStudent(student);
  };

  const closeStudentProfile = () => setSelectedStudent(null);

  const toggleAddStudentDropdown = () => setShowAddStudentDropdown((v) => !v);

  const addStudent = (student) => {
    if (userPermissions.view_students) {
      setMonitoredStudents((prev) => [...prev, student]);
      setShowAddStudentDropdown(false);
    }
  };

  const removeStudent = (studentId) => {
    if (userPermissions.view_students) {
      setMonitoredStudents((prev) => prev.filter(student => student.id !== studentId));
    }
  };

  // Funções de empresas
  const openCompanyProfile = (company) => {
    setSelectedCompany(company);
  };
  
  const closeCompanyProfile = () => setSelectedCompany(null);

  const toggleAddCompanyDropdown = () => setShowAddCompanyDropdown((v) => !v);

  const addCompany = (company) => {
    if (userPermissions.view_companies) {
      setCompanies((prev) => [...prev, company]);
      setShowAddCompanyDropdown(false);
    }
  };

  const removeCompany = (companyId) => {
    if (userPermissions.view_companies) {
      setCompanies((prev) => prev.filter(company => company.id !== companyId));
    }
  };

  // Funções de notas
  const addNewNote = () => {
    const newNote = { id: Date.now(), content: "" };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    
    const newPositions = { ...widgetPositions };
    const index = notes.length;
    newPositions[`noteWidget_${newNote.id}`] = {
      x: 325 + index * 50,
      y: 380 + index * 20,
      width: 300,
      height: 150,
    };
    setWidgetPositions(newPositions);
    
    if (userSettings) {
      saveUserSettings({ 
        notes: updatedNotes,
        widgetPositions: newPositions 
      });
    }
  };

  const removeNote = (noteId) => {
    if (notes.length <= 1) {
      setNotes([{ id: Date.now(), content: "" }]);
      return;
    }
    
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    
    const newPositions = { ...widgetPositions };
    delete newPositions[`noteWidget_${noteId}`];
    setWidgetPositions(newPositions);
    
    if (userSettings) {
      saveUserSettings({ 
        notes: updatedNotes,
        widgetPositions: newPositions 
      });
    }
  };

  const updateNote = (id, newContent) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, content: newContent } : note)));
  };

  // Cleanup
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        closeStudentProfile();
        closeCompanyProfile();
        setShowAddStudentDropdown(false);
        setShowAddCompanyDropdown(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Se não inicializou ainda, não renderiza nada
  if (!isInitialized) {
    return (
      <div className={styles.container}>
        <Menu />
        <div className={styles.loading}>Carregando dashboard...</div>
      </div>
    );
  }

  // VERIFICAÇÃO FINAL antes de renderizar
  const shouldRenderWidgets = Object.keys(widgetPositions).length > 0 && userSettings;

  return (
    <div className={styles.container}>
      <Menu />

      <main className={styles.mainContent}>
        {/* VERIFICAÇÃO: Só renderiza widgets se tudo estiver carregado */}
        {shouldRenderWidgets && (
          <>
            {/* Widget: Alunos em Acompanhamento - APENAS SE TIVER PERMISSÃO */}
            {userPermissions.view_students && widgetPositions.studentsWidget && (
              <Rnd
                default={widgetPositions.studentsWidget}
                position={widgetPositions.studentsWidget}
                size={{ width: widgetPositions.studentsWidget.width, height: widgetPositions.studentsWidget.height }}
                minWidth={300}
                minHeight={200}
                maxWidth={1000}
                maxHeight={600}
                dragHandleClassName={styles.studentsContainerHeader}
                className={styles.studentsContainer}
                cancel={`.${styles.studentsBox}, .${styles.addStudentWrapper}, .${styles.removeButton}`}
                onDragStop={(e, d) => saveWidgetPosition("studentsWidget", d.x, d.y, widgetPositions.studentsWidget.width, widgetPositions.studentsWidget.height)}
                onResizeStop={(e, direction, ref, delta, position) => {
                  saveWidgetPosition("studentsWidget", position.x, position.y, ref.offsetWidth, ref.offsetHeight);
                }}
              >
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                              .filter((student) => !monitoredStudents.some((monitored) => monitored.id === student.id))
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
                  <div className={`${styles.studentsBox} ${styles.scrollable}`}>
                    {monitoredStudents.length === 0 ? (
                      <div className={styles.emptyMessage}>Nenhum aluno em acompanhamento</div>
                    ) : (
                      monitoredStudents.map((aluno) => (
                        <div key={aluno.id} className={styles.studentRow}>
                          <div 
                            className={styles.studentInfo}
                            role="button" 
                            tabIndex={0}
                            onClick={() => openStudentProfile(aluno)}
                          >
                            <div className={styles.studentName}>{aluno.nome}</div>
                            <div className={styles.studentObs}>{aluno.observacaoBreve}</div>
                          </div>
                          <button 
                            className={styles.removeButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeStudent(aluno.id);
                            }}
                            title="Remover aluno"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Rnd>
            )}

            {/* Widget: Empresas - APENAS SE TIVER PERMISSÃO */}
            {userPermissions.view_companies && widgetPositions.companiesWidget && (
              <Rnd
                default={widgetPositions.companiesWidget}
                position={widgetPositions.companiesWidget}
                size={{ width: widgetPositions.companiesWidget.width, height: widgetPositions.companiesWidget.height }}
                minWidth={300}
                minHeight={200}
                maxWidth={1000}
                maxHeight={600}
                dragHandleClassName={styles.studentsContainerHeader}
                className={styles.studentsContainer}
                cancel={`.${styles.studentsBox}, .${styles.addStudentWrapper}, .${styles.removeButton}`}
                onDragStop={(e, d) => saveWidgetPosition("companiesWidget", d.x, d.y, widgetPositions.companiesWidget.width, widgetPositions.companiesWidget.height)}
                onResizeStop={(e, direction, ref, delta, position) => {
                  saveWidgetPosition("companiesWidget", position.x, position.y, ref.offsetWidth, ref.offsetHeight);
                }}
              >
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                              .filter((company) => !companies.some((comp) => comp.id === company.id))
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
                  <div className={`${styles.studentsBox} ${styles.scrollable}`}>
                    {companies.length === 0 ? (
                      <div className={styles.emptyMessage}>Nenhuma empresa</div>
                    ) : (
                      companies.map((empresa) => (
                        <div key={empresa.id} className={styles.studentRow}>
                          <div
                            className={styles.studentInfo}
                            role="button"
                            tabIndex={0}
                            onClick={() => openCompanyProfile(empresa)}
                          >
                            <div className={styles.studentName}>{empresa.nome}</div>
                            <div className={styles.studentObs}>{empresa.cnpj}</div>
                          </div>
                          <button 
                            className={styles.removeButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCompany(empresa.id);
                            }}
                            title="Remover empresa"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Rnd>
            )}

            {/* Widget: Contador de Empresas - APENAS SE TIVER PERMISSÃO */}
            {userPermissions.view_companies && widgetPositions.counterWidget && (
              <Rnd
                default={widgetPositions.counterWidget}
                position={widgetPositions.counterWidget}
                size={{ width: widgetPositions.counterWidget.width, height: widgetPositions.counterWidget.height }}
                minWidth={150}
                minHeight={50}
                maxWidth={500}
                maxHeight={200}
                className={styles.counterContainer}
                onDragStop={(e, d) => saveWidgetPosition("counterWidget", d.x, d.y, widgetPositions.counterWidget.width, widgetPositions.counterWidget.height)}
                onResizeStop={(e, direction, ref, delta, position) => {
                  saveWidgetPosition("counterWidget", position.x, position.y, ref.offsetWidth, ref.offsetHeight);
                }}
              >
                <div className={styles.counterText}>
                  <span className={styles.counterNumber}>{allCompanies.length}</span> Empresas cadastradas
                </div>
              </Rnd>
            )}

            {/* Widget: Estatísticas de Alunos - APENAS SE TIVER PERMISSÃO */}
            {userPermissions.view_students && widgetPositions.statsWidget && (
              <Rnd
                default={widgetPositions.statsWidget}
                position={widgetPositions.statsWidget}
                size={{ width: widgetPositions.statsWidget.width, height: widgetPositions.statsWidget.height }}
                minWidth={300}
                minHeight={200}
                maxWidth={800}
                maxHeight={500}
                className={styles.statsContainer}
                onDragStop={(e, d) => saveWidgetPosition("statsWidget", d.x, d.y, widgetPositions.statsWidget.width, widgetPositions.statsWidget.height)}
                onResizeStop={(e, direction, ref, delta, position) => {
                  saveWidgetPosition("statsWidget", position.x, position.y, ref.offsetWidth, ref.offsetHeight);
                }}
              >
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
              </Rnd>
            )}

            {/* Widgets: Blocos de Notas - SEMPRE DISPONÍVEL */}
            {notes.map((note, index) => {
              const notePosition = widgetPositions[`noteWidget_${note.id}`] || { 
                x: 380 + index * 50, 
                y: 380 + index * 20, 
                width: 300, 
                height: 150 
              };
              
              return (
                <Rnd
                  key={note.id}
                  default={notePosition}
                  position={notePosition}
                  size={{ width: notePosition.width, height: notePosition.height }}
                  minWidth={200}
                  minHeight={150}
                  maxWidth={600}
                  maxHeight={400}
                  className={styles.notesContainer}
                  cancel={`.${styles.notesTextarea}, .${styles.addNoteButton}, .${styles.removeNoteButton}`}
                  onDragStop={(e, d) => saveWidgetPosition(`noteWidget_${note.id}`, d.x, d.y, notePosition.width, notePosition.height)}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    saveWidgetPosition(`noteWidget_${note.id}`, position.x, position.y, ref.offsetWidth, ref.offsetHeight);
                  }}
                >
                  <div className={styles.notesHeader}>
                    <button 
                      className={styles.removeNoteButton}
                      onClick={() => removeNote(note.id)}
                      title="Remover nota"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                  <div className={styles.notesContent}>
                    <textarea
                      className={styles.notesTextarea}
                      value={note.content}
                      onChange={(e) => updateNote(note.id, e.target.value)}
                      placeholder="Escreva sua nota aqui..."
                    />
                  </div>
                  <div className={styles.notesFooter}>
                    <button className={styles.addNoteButton} onClick={addNewNote}>
                      <FiPlus size={16} />
                    </button>
                  </div>
                </Rnd>
              );
            })}
          </>
        )}
      </main>

      {/* Modal do Aluno */}
      {selectedStudent && (
        <div className={styles.modalOverlay} onClick={closeStudentProfile}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={closeStudentProfile}>×</button>
            <h2>Perfil do Aluno</h2>
            <div className={styles.infoGroup}>
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
        </div>
      )}

      {/* Modal da Empresa */}
      {selectedCompany && (
        <div className={styles.modalOverlay} onClick={closeCompanyProfile}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={closeCompanyProfile}>×</button>
            <h2>Perfil da Empresa</h2>
            <div className={styles.infoGroup}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Nome:</span>
                <span className={styles.value}>{selectedCompany.nome}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>CNPJ:</span>
                <span className={styles.value}>{selectedCompany.cnpj}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administration;