import React, { useState } from "react";
import styles from "./Assessment.module.css";
import BackButton from "../../components/BackButton/BackButton";
import { X } from "lucide-react";
import parse from 'html-react-parser';

const Assessment = () => {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [assesmentDate, setAssesmentDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // "success" ou "error"

  const students = [
    "João Silva",
    "Maria Oliveira",
    "Pedro Souza",
    "Ana Costa",
    "Lucas Pereira",
  ];

  const questions = ["1 - Atende as regras.", "2 - Socializa com o grupo.", "3 - Isola-se do grupo", "4 - Possui tolerância a frustração.", "5 - Respeita colega e professores.", "6 - Faz relatos fantasiosos.", "7 - Concentra-se nas atividades.", "8 - Tem iniciativa.", "9 - Sonolência durante as atividades em sala de aula.", "10 - Alterações intensas de humor.", "11 - Indica oscilação repentina de humor.", "12 - Irrita-se com facilidade.<b>*</b>", "13 - Ansiedade.", "14 - Escuta quando seus colegas falam.", "15 - Escuta e segue orientação dos professores.", "16 - Mantem-se em sala de aula.", "17 - Desloca-se muito na sala.", "18 - Fala demasiadamente.", "19 - É pontual.", "20 - É assíduo.", "21 - Demonstra desejo de trabalhar.", "22 - Apropria-se indevidamente daquilo que não é seu.", "23 - Indica hábito de banho diário.", "24 - Indica habito de escovação e qualidade na escovação.", "25 - Indica cuidado com a aparência e limpeza do uniforme.", "26 - Indica autonomia quanto a estes hábitos (23, 24, 25).", "27 - Indica falta do uso de medicação com oscilações de comportamento.", "28 - Tem meio articulado de conseguir receitas e aquisições das medicações.", "29 - Traz seus materiais organizados.", "30 - Usa transporte coletivo.", "31 - Tem iniciativa diante das atividades propostas.", "32 - Localiza-se no espaço da Instituição.", "33 - Situa-se nas trocas de sala e atividades.", "34 - Interage par a par.", "35 - Interage em grupo.", "36 - Cria conflitos e intrigas.", "37 - Promove a harmonia.", "38 - Faz intrigas entre colegas x professores.", "39 - Demonstra interesse em participar das atividades extraclasses.", "40 - Você percebe que existe interação/participação da família em apoio ao usuário na Instituição.", "41 - Você percebe superproteção por parte da família quanto a autonomia do usuário.", "42 - Usuário traz relatos negativos da família (de forma geral).", "43 - Usuário traz relatos positivos da família (de forma geral).", "44 - Você percebe incentivo quanto a busca de autonomia para o usuário por parte da família.", "45 - Você percebe incentivo quanto a inserção do usuário no mercado de trabalho por parte da família.", "46 - Traz os documentos enviados pela Instituição assinado.",];

  const options = [
    { value: "sim", label: "Sim" },
    { value: "nao", label: "Não" },
    { value: "maioria", label: "Maioria das vezes" },
    { value: "raras", label: "Raras vezes" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let allAnswered = true;

    if (!selectedStudent) {
      setModalType("error");
      setModalMessage("Selecione um usuário antes de enviar a avaliação!");
      setShowModal(true);
      return;
    }

    if (!entryDate) {
      setModalType("error");
      setModalMessage("Selecione a data de entrada da avaliação!");
      setShowModal(true);
      return;
    }

    for (let i = 1; i <= questions.length; i++) {
      if (!formData.get(`q${i}`)) {
        allAnswered = false;
        break;
      }
    }

    if (!allAnswered) {
      setModalType("error");
      setModalMessage("Preencha todas as opções antes de enviar a avaliação!");
      setShowModal(true);
      return;
    }

    setModalType("success");
    setModalMessage(
      `Avaliação do usuário ${selectedStudent} enviada com sucesso!`
    );
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <BackButton />
      {/* <h1 className={styles.pageTitle}>Sistema de Gestão de Alunos</h1> */}

      <div className={styles.card}>
        <h2 className={styles.title}>
          Avaliação Usuário em período de Experiência
        </h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.topFields}>
            {/* Seleção do Nome */}
            <div className={styles.selectWrapper}>
              <label htmlFor="studentSelect">Nome:</label>
              <select
                id="studentSelect"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className={styles.select}
              >
                <option value="">-- Escolha um usuário --</option>
                {students.map((student, index) => (
                  <option key={index} value={student}>
                    {student}
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
                onChange={(e) => setEntryDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>

            {/* Seletor de tipo de avaliação */}
            <div className={styles.selectWrapper}>
              <label htmlFor="evaluationType">Avaliação:</label>
              <select
                id="evaluationType"
                value={modalType}
                onChange={(e) => setModalType(e.target.value)} // ou crie um estado específico
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
                value={assesmentDate}
                onChange={(e) => setAssesmentDate(e.target.value)}
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

          <div className={styles.submitWrapper}>
            <button type="submit" className={styles.submitButton}>
              Enviar avaliação
            </button>
          </div>
        </form>
      </div>

      {/* Modal de feedback */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              className={styles.closeBtn}
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>
            <p
              className={
                modalType === "success"
                  ? styles.modalMessageSuccess
                  : styles.modalMessageError
              }
            >
              {modalMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
