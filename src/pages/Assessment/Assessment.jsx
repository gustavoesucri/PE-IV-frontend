import React, { useState, useEffect } from "react";
import styles from "./Assessment.module.css";
import { X } from "lucide-react";
import parse from 'html-react-parser';
import Menu from "../../components/Menu/Menu";
import api from "../../api";
import { usePermissions } from "../../hooks/usePermissions";

const Assessment = () => {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [defaultAssessmentDate, setDefaultAssessmentDate] = useState("");
  const [evaluationType, setEvaluationType] = useState("");
  const [hasConfirmedDate, setHasConfirmedDate] = useState(false);
  const [students, setStudents] = useState([]);
  const [existingAssessments, setExistingAssessments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const { permissions: userPermissions, loading: permissionsLoading } = usePermissions();

  // Estados para modais
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);

  // Questões carregadas da API
  const [questionsData, setQuestionsData] = useState([]);

  // Derivar arrays de exibição a partir dos dados da API
  const mcQuestions = questionsData.filter(q => q.type === 'multiple_choice');
  const textQuestions = questionsData.filter(q => q.type === 'text');
  const options = mcQuestions[0]?.options || [];

  const markerMap = {};
  textQuestions.forEach(tq => {
    if (tq.conditionalField) {
      const marker = tq.code === 'openQ2' ? '<b>*</b>' : '<b>**</b>';
      tq.conditionalField.split(',').forEach(field => {
        markerMap[field.trim()] = marker;
      });
    }
  });

  const questions = mcQuestions.map(q => {
    let label = `${q.displayOrder} - ${q.text}`;
    if (markerMap[q.code]) label += markerMap[q.code];
    return label;
  });

  const openQuestions = textQuestions.map(q => {
    const stars = q.conditionalField ? (q.code === 'openQ2' ? '<b>*</b>' : '<b>**</b> ') : '';
    const prefix = !q.conditionalField ? `${q.displayOrder}- ` : '';
    return `${stars}${prefix}${q.text}`;
  });

  // Carregar usuário atual e questões da API
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    const today = new Date().toISOString().split("T")[0];
    setAssessmentDate(today);
    setDefaultAssessmentDate(today);

    // Buscar questões do banco de dados
    const loadQuestions = async () => {
      try {
        const response = await api.get('/assessments/questions');
        setQuestionsData(response.data);
      } catch (error) {
        console.error("Erro ao carregar questões:", error);
      }
    };
    loadQuestions();
  }, []);

  // Carregar dados quando permissões estiverem prontas
  useEffect(() => {
    if (permissionsLoading) return;

    const loadData = async () => {
      try {
        if (userPermissions.create_assessments) {
          await loadStudents();
          await loadExistingAssessments();
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        showMessage("Erro ao carregar dados. Tente novamente.", "error");
      }
    };

    loadData();
  }, [permissionsLoading, userPermissions]);

  const loadStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error("Erro ao carregar estudantes:", error);
      throw error;
    }
  };

  const loadExistingAssessments = async () => {
    try {
      const response = await api.get('/assessments');
      setExistingAssessments(response.data);
    } catch (error) {
      console.error("Erro ao carregar avaliações existentes:", error);
      throw error;
    }
  };

  const showMessage = (message, type = "error") => {
    setModalMessage(message);
    setModalType(type);
    setIsMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setModalMessage("");
    setModalType("");
  };

  const validateDate = (dateStr, fieldName) => {
    const date = new Date(dateStr);
    const min = new Date("1960-01-01");
    const max = new Date();

    if (!dateStr) return `${fieldName} é obrigatória.`;
    if (date < min || date > max) {
      return `${fieldName} deve estar entre 1960 e hoje.`;
    }
    return null;
  };

  // Verificar se já existe avaliação do mesmo tipo para o estudante
  const checkExistingAssessment = (studentId, type) => {
    return existingAssessments.some(assessment => 
      assessment.studentId === parseInt(studentId) && 
      assessment.evaluationType === type
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verificar permissão
    if (!userPermissions.create_assessments) {
      setPermissionModalOpen(true);
      return;
    }

    const formData = new FormData(e.target);

    // Validações básicas
    if (!selectedStudentId) {
      document.querySelector("#studentSelect")?.focus();
      return showError("Selecione um usuário antes de enviar a avaliação!", "studentSelect");
    }

    if (!entryDate) {
      document.querySelector("#entryDate")?.focus();
      return showError("Selecione a data de entrada!", "entryDate");
    }

    const entryDateError = validateDate(entryDate, "Data de entrada");
    if (entryDateError) {
      showError(entryDateError);
      document.getElementById("entryDate").focus();
      return;
    }

    if (!evaluationType) {
      document.querySelector("#evaluationType")?.focus();
      return showError("Selecione se é a 1ª ou 2ª avaliação!", "evaluationType");
    }

    // Verificar se já existe avaliação do mesmo tipo
    if (checkExistingAssessment(selectedStudentId, evaluationType)) {
      const tipo = evaluationType === "primeira" ? "primeira" : "segunda";
      return showError(`Já existe uma ${tipo} avaliação para este estudante.`);
    }

    if (!assessmentDate) {
      document.querySelector("#assessmentDate")?.focus();
      return showError("Selecione a data da avaliação!", "assessmentDate");
    }

    const assessmentDateError = validateDate(assessmentDate, "Data da avaliação");
    if (assessmentDateError) {
      showError(assessmentDateError);
      document.getElementById("assessmentDate").focus();
      return;
    }

    // Confirma a data apenas uma vez
    if (assessmentDate === defaultAssessmentDate && !hasConfirmedDate) {
      setHasConfirmedDate(true);
      setModalType("confirm");
      setModalMessage("A data da avaliação está como a data atual. Deseja manter?");
      setIsMessageModalOpen(true);
      return;
    }

    // Validação das perguntas obrigatórias
    for (let i = 1; i <= questions.length; i++) {
      if (!formData.get(`q${i}`)) {
        const radios = document.getElementsByName(`q${i}`);
        if (radios.length) {
          const row = radios[0].closest("tr");
          row.classList.add(styles.focusRow);

          radios.forEach((radio) => {
            radio.addEventListener("change", () => {
              const isSelected = Array.from(radios).some(r => r.checked);
              if (isSelected) {
                row.classList.remove(styles.focusRow);
              }
            });
          });

          radios[radios.length - 1].focus();
        }
        return showError(`Preencha a questão ${i} antes de enviar a avaliação!`);
      }
    }

    // Questão 47 (perfil) obrigatória
    const open1 = formData.get("openQ1")?.trim();
    if (!open1) {
      return showError("Responda a questão 47: 'O usuário tem perfil para esta instituição?'");
    }

    // Questão 12 da qual a aberta 2 depende
    const q12 = formData.get("q12");
    const open2 = formData.get("openQ2")?.trim();
    if (q12 !== "nao" && !open2) {
      return showError("Descreva '*Em que situações demonstra irritações?'");
    }

    // Questões 27 e 28 das quais a aberta 3 depende
    const q27 = formData.get("q27");
    const q28 = formData.get("q28");
    const open3 = formData.get("openQ3")?.trim();
    if ((q27 !== "nao" || q28 !== "nao") && !open3) {
      return showError("Preencha '** Caso o aluno faça uso de medicação. Observações:'");
    }

    // Se tudo ok, enviar para o back-end
    saveAssessment(formData);
  };

  const saveAssessment = async (formData) => {
    try {
      const newAssessment = {
        studentId: parseInt(selectedStudentId),
        entryDate: entryDate,
        assessmentDate: assessmentDate,
        evaluationType: evaluationType,
        professorName: currentUser?.username || "Usuário",
        registeredBy: currentUser?.id || null
      };

      // Coletar respostas das questões de múltipla escolha (campos individuais)
      for (let i = 1; i <= mcQuestions.length; i++) {
        newAssessment[`q${i}`] = formData.get(`q${i}`);
      }

      // Coletar respostas abertas
      newAssessment.openQ1 = formData.get("openQ1")?.trim() || "";
      newAssessment.openQ2 = formData.get("openQ2")?.trim() || "";
      newAssessment.openQ3 = formData.get("openQ3")?.trim() || "";

      await api.post('/assessments', newAssessment);

      // Atualizar lista de avaliações existentes
      const updatedAssessments = await api.get('/assessments');
      setExistingAssessments(updatedAssessments.data);

      showSuccess(`Avaliação do estudante enviada com sucesso!`);
      
      // Limpar formulário
      setSelectedStudentId("");
      setEntryDate("");
      setEvaluationType("");
      setAssessmentDate(defaultAssessmentDate);
      setHasConfirmedDate(false);
      
      // Limpar todas as respostas do formulário
      const form = document.querySelector("form");
      if (form) form.reset();

    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      showError("Erro ao salvar avaliação. Tente novamente.");
    }
  };

  const showError = (msg, fieldId) => {
    showMessage(msg, "error");

    if (fieldId) {
      const el = document.querySelector(`#${fieldId}`);
      if (el) {
        el.classList.add(styles.errorField);
        el.focus();
      }
    }
  };

  const showSuccess = (msg) => {
    showMessage(msg, "success");
  };

  return (
    <div className={styles.container}>
      <Menu />

      <div className={styles.card}>
        <h2 className={styles.title}>
          Avaliação Usuário em período de Experiência
        </h2>

        {!userPermissions.create_assessments ? (
          <div className={styles.noPermissionMessage}>
            Não foi possível carregar a visualização devido a falta de permissões, se for um problema, consulte o diretor.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.topFields}>
              {/* Seleção do Nome */}
              <div className={styles.selectWrapper}>
                <label htmlFor="studentSelect">Nome:</label>
                <select
                  id="studentSelect"
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    e.target.classList.remove(styles.errorField);
                  }}
                  className={styles.select}
                >
                  <option value="">-- Escolha um usuário --</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data de Entrada */}
              <div className={styles.dateWrapper}>
                <label htmlFor="entryDate">Data de entrada:</label>
                <input
                  type="date"
                  id="entryDate"
                  value={entryDate}
                  onChange={(e) => {
                    setEntryDate(e.target.value);
                    e.target.classList.remove(styles.errorField);
                  }}
                  className={styles.dateInput}
                />
              </div>

              {/* Seletor de tipo de avaliação */}
              <div className={styles.selectWrapper}>
                <label htmlFor="evaluationType">Avaliação:</label>
                <select
                  id="evaluationType"
                  value={evaluationType}
                  onChange={(e) => {
                    setEvaluationType(e.target.value);
                    e.target.classList.remove(styles.errorField);
                  }}
                  className={styles.select}
                >
                  <option value="">-- Avaliação --</option>
                  <option value="primeira">1ª Avaliação</option>
                  <option value="segunda">2ª Avaliação</option>
                </select>
              </div>

              {/* Data da Avaliação */}
              <div className={styles.dateWrapper}>
                <label htmlFor="assessmentDate">Data da Avaliação:</label>
                <input
                  type="date"
                  id="assessmentDate"
                  value={assessmentDate}
                  onChange={(e) => {
                    setAssessmentDate(e.target.value);
                    e.target.classList.remove(styles.errorField);
                  }}
                  className={styles.dateInput}
                />
              </div>
            </div>

            {/* Tabela de perguntas */}
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Pergunta</th>
                    {options.map((opt) => (
                      <th key={opt.value}>{opt.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, index) => {
                    const questionId = `q${index + 1}`;
                    return (
                      <tr key={questionId}>
                        <td className={styles.questionCell}>{parse(question)}</td>
                        {options.map((option) => (
                          <td key={option.value} className={styles.optionCell}>
                            <input
                              type="radio"
                              id={`${questionId}-${option.value}`}
                              name={questionId}
                              value={option.value}
                              className={styles.radioInput}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Perguntas abertas */}
            <div className={styles.openQuestionsWrapper}>
              {openQuestions.map((question, index) => {
                const questionId = `openQ${index + 1}`;
                return (
                  <div key={questionId} className={styles.openQuestionField}>
                    <label htmlFor={questionId}>{parse(question)}</label>
                    <textarea
                      id={questionId}
                      name={questionId}
                      rows="4"
                      className={styles.textareaInput}
                    />
                  </div>
                );
              })}
            </div>

            <div className={styles.professorField}>
              <label>Nome do Professor:</label>
              <div className={styles.readonlyField}>
                {currentUser?.username || "Carregando..."}
              </div>
            </div>

            <div className={styles.submitWrapper}>
              <button type="submit" className={styles.submitButton}>
                Enviar avaliação
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Modal de Mensagem */}
      {isMessageModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={modalType === "success" ? styles.modalSuccessTitle : styles.modalErrorTitle}>
                {modalType === "success" ? "Sucesso" : "Aviso"}
              </h2>
              <button className={styles.modalClose} onClick={closeMessageModal}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>{modalMessage}</p>
            </div>
            <div className={styles.modalFooter}>
              {modalType === "confirm" ? (
                <div className={styles.modalButtons}>
                  <button
                    onClick={() => {
                      closeMessageModal();
                      const form = document.querySelector("form");
                      if (form) form.requestSubmit();
                    }}
                    className={styles.confirmButton}
                  >
                    Manter
                  </button>
                  <button
                    onClick={() => {
                      closeMessageModal();
                      setAssessmentDate("");
                      setTimeout(() => {
                        document.querySelector("#assessmentDate")?.focus();
                      }, 0);
                    }}
                    className={styles.cancelButton}
                  >
                    Alterar data
                  </button>
                </div>
              ) : (
                <button 
                  className={`${styles.modalButton} ${modalType === "success" ? styles.modalSuccessButton : styles.modalErrorButton}`}
                  onClick={closeMessageModal}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Permissão */}
      {permissionModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setPermissionModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalErrorTitle}>Acesso Negado</h2>
              <button className={styles.modalClose} onClick={() => setPermissionModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>Você não tem permissão para registrar avaliações.</p>
              <p>Se for necessário, consulte o diretor.</p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.modalErrorButton}
                onClick={() => setPermissionModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;