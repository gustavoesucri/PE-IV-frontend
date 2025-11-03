import React, { useState, useEffect } from "react";
import styles from "./Assessment.module.css";
import { X } from "lucide-react";
import parse from 'html-react-parser';
import Menu from "../../components/Menu/Menu";
import api from "../../api";

const Assessment = () => {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [defaultAssessmentDate, setDefaultAssessmentDate] = useState("");
  const [evaluationType, setEvaluationType] = useState("");
  const [hasConfirmedDate, setHasConfirmedDate] = useState(false);
  const [students, setStudents] = useState([]);
  const [existingAssessments, setExistingAssessments] = useState([]);
  const [userPermissions, setUserPermissions] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Estados para modais
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);

  const questions = [
    "1 - Atende as regras.", "2 - Socializa com o grupo.", "3 - Isola-se do grupo", 
    "4 - Possui tolerância a frustração.", "5 - Respeita colega e professores.", 
    "6 - Faz relatos fantasiosos.", "7 - Concentra-se nas atividades.", "8 - Tem iniciativa.", 
    "9 - Sonolência durante as atividades em sala de aula.", "10 - Alterações intensas de humor.", 
    "11 - Indica oscilação repentina de humor.", "12 - Irrita-se com facilidade.<b>*</b>", 
    "13 - Ansiedade.", "14 - Escuta quando seus colegas falam.", "15 - Escuta e segue orientação dos professores.", 
    "16 - Mantem-se em sala de aula.", "17 - Desloca-se muito na sala.", "18 - Fala demasiadamente.", 
    "19 - É pontual.", "20 - É assíduo.", "21 - Demonstra desejo de trabalhar.", 
    "22 - Apropria-se indevidamente daquilo que não é seu.", "23 - Indica hábito de banho diário.", 
    "24 - Indica habito de escovação e qualidade na escovação.", "25 - Indica cuidado com a aparência e limpeza do uniforme.", 
    "26 - Indica autonomia quanto a estes hábitos (23, 24, 25).", "27 - Indica falta do uso de medicação com oscilações de comportamento.<b>**</b>", 
    "28 - Tem meio articulado de conseguir receitas e aquisições das medicações.<b>**</b>", "29 - Traz seus materiais organizados.", 
    "30 - Usa transporte coletivo.", "31 - Tem iniciativa diante das atividades propostas.", 
    "32 - Localiza-se no espaço da Instituição.", "33 - Situa-se nas trocas de sala e atividades.", 
    "34 - Interage par a par.", "35 - Interage em grupo.", "36 - Cria conflitos e intrigas.", 
    "37 - Promove a harmonia.", "38 - Faz intrigas entre colegas x professores.", 
    "39 - Demonstra interesse em participar das atividades extraclasses.", 
    "40 - Você percebe que existe interação/participação da família em apoio ao usuário na Instituição.", 
    "41 - Você percebe superproteção por parte da família quanto a autonomia do usuário.", 
    "42 - Usuário traz relatos negativos da família (de forma geral).", 
    "43 - Usuário traz relatos positivos da família (de forma geral).", 
    "44 - Você percebe incentivo quanto a busca de autonomia para o usuário por parte da família.", 
    "45 - Você percebe incentivo quanto a inserção do usuário no mercado de trabalho por parte da família.", 
    "46 - Traz os documentos enviados pela Instituição assinado.",
  ];

  const openQuestions = [
    "47- Em sua opinião o usuário tem perfil para esta instituição? Por quê?", 
    "<b>*</b>Em que situações demonstra irritações?", 
    "<b>**</b> Caso o aluno faça uso de medicação.<br><strong><u>Observações</u>:</strong>"
  ];

  const options = [
    { value: "sim", label: "Sim" },
    { value: "maioria", label: "Maioria das vezes" },
    { value: "raras", label: "Raras vezes" },
    { value: "nao", label: "Não" },
  ];

  // Carregar dados e permissões
  useEffect(() => {
    const loadDataAndPermissions = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);

          // Carregar permissões
          const rolePermsResponse = await api.get(`/api/rolePermissions?role=${user.role}`);
          let rolePermissions = {};
          if (rolePermsResponse.data.length > 0) {
            rolePermissions = rolePermsResponse.data[0].permissions;
          }

          const userPermsResponse = await api.get(`/api/userSpecificPermissions?userId=${user.id}`);
          let userSpecificPermissions = {};
          if (userPermsResponse.data.length > 0) {
            userSpecificPermissions = userPermsResponse.data[0].permissions;
          }

          const finalPermissions = { ...rolePermissions };
          Object.keys(userSpecificPermissions).forEach(perm => {
            if (userSpecificPermissions[perm] !== null) {
              finalPermissions[perm] = userSpecificPermissions[perm];
            }
          });

          setUserPermissions(finalPermissions);

          // Carregar dados apenas se tiver permissão
          if (finalPermissions.create_evaluations) {
            await loadStudents();
            await loadExistingAssessments();
          }
        }

        // Preencher data atual
        const today = new Date().toISOString().split("T")[0];
        setAssessmentDate(today);
        setDefaultAssessmentDate(today);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        showMessage("Erro ao carregar dados. Tente novamente.", "error");
      }
    };

    loadDataAndPermissions();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await api.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error("Erro ao carregar estudantes:", error);
      throw error;
    }
  };

  const loadExistingAssessments = async () => {
    try {
      const response = await api.get('/api/assessments');
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
    if (!userPermissions.create_evaluations) {
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
      // Coletar todas as respostas
      const responses = {};
      for (let i = 1; i <= questions.length; i++) {
        responses[`q${i}`] = formData.get(`q${i}`);
      }

      // Coletar respostas abertas
      responses.openQ1 = formData.get("openQ1")?.trim() || "";
      responses.openQ2 = formData.get("openQ2")?.trim() || "";
      responses.openQ3 = formData.get("openQ3")?.trim() || "";

      const newAssessment = {
        studentId: parseInt(selectedStudentId),
        entryDate: entryDate,
        assessmentDate: assessmentDate,
        evaluationType: evaluationType,
        professorName: currentUser?.username || "Usuário",
        responses: responses,
        registeredBy: currentUser?.id || null
      };

      await api.post('/api/assessments', newAssessment);

      // Atualizar lista de avaliações existentes
      const updatedAssessments = await api.get('/api/assessments');
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

        {!userPermissions.create_evaluations ? (
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