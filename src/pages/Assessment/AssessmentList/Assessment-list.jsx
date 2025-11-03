// src/pages/Assessment/AssessmentList/Assessment-list.jsx
import { useState } from "react";
import { X } from "lucide-react";
import styles from "./Assessment-list.module.css";
import parse from 'html-react-parser';
import Menu from "../../../components/Menu/Menu";
import jsPDF from 'jspdf';

const students = [
    "João Silva",
    "Maria Oliveira",
    "Pedro Souza",
    "Ana Costa",
    "Lucas Pereira",
];

const questions = [
    "1 - Atende as regras.", "2 - Socializa com o grupo.", "3 - Isola-se do grupo", "4 - Possui tolerância a frustração.",
    "5 - Respeita colega e professores.", "6 - Faz relatos fantasiosos.", "7 - Concentra-se nas atividades.",
    "8 - Tem iniciativa.", "9 - Sonolência durante as atividades em sala de aula.", "10 - Alterações intensas de humor.",
    "11 - Indica oscilação repentina de humor.", "12 - Irrita-se com facilidade.<b>*</b>", "13 - Ansiedade.",
    "14 - Escuta quando seus colegas falam.", "15 - Escuta e segue orientação dos professores.",
    "16 - Mantem-se em sala de aula.", "17 - Desloca-se muito na sala.", "18 - Fala demasiadamente.",
    "19 - É pontual.", "20 - É assíduo.", "21 - Demonstra desejo de trabalhar.",
    "22 - Apropria-se indevidamente daquilo que não é seu.", "23 - Indica hábito de banho diário.",
    "24 - Indica habito de escovação e qualidade na escovação.", "25 - Indica cuidado com a aparência e limpeza do uniforme.",
    "26 - Indica autonomia quanto a estes hábitos (23, 24, 25).",
    "27 - Indica falta do uso de medicação com oscilações de comportamento.<b>**</b>",
    "28 - Tem meio articulado de conseguir receitas e aquisições das medicações.<b>**</b>",
    "29 - Traz seus materiais organizados.", "30 - Usa transporte coletivo.",
    "31 - Tem iniciativa diante das atividades propostas.", "32 - Localiza-se no espaço da Instituição.",
    "33 - Situa-se nas trocas de sala e atividades.", "34 - Interage par a par.", "35 - Interage em grupo.",
    "36 - Cria conflitos e intrigas.", "37 - Promove a harmonia.", "38 - Faz intrigas entre colegas x professores.",
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

// === MOCK DE AVALIAÇÕES ===
const assessmentsMock = [
    {
        student: "João Silva",
        entryDate: "2024-01-01",
        assessmentDate: "2024-02-01",
        type: "primeira",
        answers: questions.reduce((acc, _, i) => ({ ...acc, [`q${i + 1}`]: i % 4 === 0 ? "sim" : i % 4 === 1 ? "maioria" : i % 4 === 2 ? "raras" : "nao" }), {}),
        openAnswers: {
            openQ1: "Sim, demonstra engajamento e respeito às normas da instituição.",
            openQ2: "Em situações de alta pressão ou quando não consegue completar uma tarefa.",
            openQ3: "Não utiliza medicação. Sem observações adicionais."
        },
        professor: "Prof. Ana Costa"
    },
    {
        student: "João Silva",
        entryDate: "2024-01-01",
        assessmentDate: "2024-05-01",
        type: "segunda",
        answers: questions.reduce((acc, _, i) => ({ ...acc, [`q${i + 1}`]: "maioria" }), {}),
        openAnswers: {
            openQ1: "Sim, evoluiu bastante desde a primeira avaliação.",
            openQ2: "Raramente. Melhorou o controle emocional.",
            openQ3: "Continuou sem medicação. Comportamento estável."
        },
        professor: "Prof. Ana Costa"
    },
    {
        student: "Maria Oliveira",
        entryDate: "2024-02-01",
        assessmentDate: "2024-03-01",
        type: "primeira",
        answers: questions.reduce((acc, _, i) => ({ ...acc, [`q${i + 1}`]: "raras" }), {}),
        openAnswers: {
            openQ1: "Perfil em desenvolvimento. Precisa de mais apoio para socialização.",
            openQ2: "Quando há conflitos com colegas ou mudanças de rotina.",
            openQ3: "Uso de medicação controlada. Familia acompanha."
        },
        professor: "Prof. Carlos Lima"
    },
];

// Simula usuário logado (futuro back-end)

const AssessmentList = () => {
    const [selectedStudent, setSelectedStudent] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);

    const handleView = (type) => {
        const assessment = assessmentsMock.find(a => a.student === selectedStudent && a.type === type);
        if (assessment) {
            setSelectedAssessment(assessment);
            setShowModal(true);
        }
    };

    const hasAssessment = (type) => {
        return assessmentsMock.some(a => a.student === selectedStudent && a.type === type);
    };

    // === EXPORTAÇÃO COM MÚLTIPLAS PÁGINAS ===
    const handleExportPDF = () => {
  if (!selectedAssessment) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;

  const addLine = (text, fontSize = 12, isBold = false) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(fontSize);
    if (isBold) doc.setFont(undefined, 'bold');
    doc.text(text, 15, y);
    if (isBold) doc.setFont(undefined, 'normal');
    y += 7;
  };

  const addEmptyLine = () => {
    y += 5;
  };

  // === 1. LOGO NO TOPO ===
  try {
    const logoImg = new Image();
    logoImg.src = '../logo-pdf.png'; // Caminho relativo ao src
    doc.addImage(logoImg, 'PNG', pageWidth / 2 - 25, y, 50, 30); // centro, 50x30mm
    y += 35;
  } catch (e) {
    console.warn("Logo não encontrada, continuando sem ela.");
  }

  // === CABEÇALHO ===
  addLine(`Avaliação do Usuário: ${selectedAssessment.student}`, 14, true);
  addLine(`Data de Entrada: ${selectedAssessment.entryDate}`);
  addLine(`Data da Avaliação: ${selectedAssessment.assessmentDate}`);
  addLine(`Tipo: ${selectedAssessment.type === "primeira" ? "1ª Avaliação" : "2ª Avaliação"}`);
  addEmptyLine();

  // === PERGUNTAS FECHADAS ===
  questions.forEach((q, index) => {
    const answer = options.find(opt => opt.value === selectedAssessment.answers[`q${index + 1}`])?.label || "Não respondido";
    let cleanQ = q.replace(/<[^>]+>/g, '').trim();
    cleanQ = cleanQ.replace(/^\d+\s*-\s*/, '');
    const line = `${index + 1} - ${cleanQ}: ${answer}`;
    const splitLines = doc.splitTextToSize(line, 180);
    splitLines.forEach(l => addLine(l));
    addEmptyLine();
  });

  // === PERGUNTAS ABERTAS ===
  openQuestions.forEach((q, index) => {
    const answer = selectedAssessment.openAnswers[`openQ${index + 1}`] || "Não respondido";
    let cleanQ = q.replace(/<[^>]+>/g, '').trim();
    cleanQ = cleanQ.replace(/^\d+\s*-\s*/, '').replace(/^\*\*/, '').replace(/^\*/, '');
    addLine(`${cleanQ}`, 12, true);
    const splitAnswer = doc.splitTextToSize(answer, 180);
    splitAnswer.forEach(line => addLine(line, 11));
    addEmptyLine();
  });

  // === RODAPÉ COM PROFESSOR ===
  addLine(`Nome do professor (a): ${selectedAssessment.professor}`, 12, true);
  addLine("Assinatura: _______________________________");
  addEmptyLine();

  // === 2. IMAGEM INFO NO FINAL ===
  try {
    const infoImg = new Image();
    infoImg.src = '../info-pdf.png';
    const imgHeight = 30;
    const imgY = pageHeight - imgHeight - 10;
    doc.addImage(infoImg, 'PNG', pageWidth / 2 - 40, imgY, 80, imgHeight); // centro, 80x30mm
  } catch (e) {
    console.warn("Imagem info não encontrada, continuando sem ela.");
  }

  // === SALVAR ===
  doc.save(`avaliacao_${selectedAssessment.student.replace(/\s+/g, '_')}_${selectedAssessment.type}.pdf`);
};

    return (
        <div className={styles.container}>
            <Menu />
            <h1 className={styles.title}>Lista de Avaliações</h1>

            <div className={styles.formGroup}>
                <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className={styles.input}
                >
                    <option value="">-- Selecione um aluno(a)...</option>
                    {students.map((student, index) => (
                        <option key={index} value={student}>{student}</option>
                    ))}
                </select>
            </div>

            {selectedStudent && (
                <div className={styles.studentInfo}>
                    <h2>Aluno: {selectedStudent}</h2>
                    <div className={styles.assessmentItem}>
                        <span>Avaliação 1: {hasAssessment("primeira") ? "Feito" : "Pendente"}</span>
                        {hasAssessment("primeira") && (
                            <button className={styles.viewButton} onClick={() => handleView("primeira")}>
                                Visualizar
                            </button>
                        )}
                    </div>
                    <div className={styles.assessmentItem}>
                        <span>Avaliação 2: {hasAssessment("segunda") ? "Feito" : "Pendente"}</span>
                        {hasAssessment("segunda") && (
                            <button className={styles.viewButton} onClick={() => handleView("segunda")}>
                                Visualizar
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* === MODAL DE VISUALIZAÇÃO === */}
            {showModal && selectedAssessment && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                            <X size={20} />
                        </button>
                        <h2 className={styles.modalTitle}>Visualização da Avaliação</h2>

                        <div className={styles.readonlyForm}>
                            <div className={styles.topFields}>
                                <div>
                                    <label>Nome:</label>
                                    <div className={styles.readonlyField}>{selectedAssessment.student}</div>
                                </div>
                                <div>
                                    <label>Data de Entrada:</label>
                                    <div className={styles.readonlyField}>{selectedAssessment.entryDate}</div>
                                </div>
                                <div>
                                    <label>Avaliação:</label>
                                    <div className={styles.readonlyField}>
                                        {selectedAssessment.type === "primeira" ? "1ª Avaliação" : "2ª Avaliação"}
                                    </div>
                                </div>
                                <div>
                                    <label>Data da Avaliação:</label>
                                    <div className={styles.readonlyField}>{selectedAssessment.assessmentDate}</div>
                                </div>
                            </div>

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
                                            const selectedValue = selectedAssessment.answers[questionId];
                                            return (
                                                <tr key={questionId}>
                                                    <td className={styles.questionCell}>{parse(question)}</td>
                                                    {options.map((option) => (
                                                        <td key={option.value} className={styles.optionCell}>
                                                            {option.value === selectedValue ? "✓" : ""}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.openQuestionsWrapper}>
                                {openQuestions.map((question, index) => {
                                    const questionId = `openQ${index + 1}`;
                                    return (
                                        <div key={questionId} className={styles.openQuestionField}>
                                            <label>{parse(question)}</label>
                                            <div className={styles.readonlyField}>
                                                {selectedAssessment.openAnswers[questionId] || "Não respondido"}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* === RODAPÉ DO MODAL === */}
                            <div className={styles.footerSection}>
                                <div className={styles.professorField}>
                                    <label>Nome do professor (a):</label>
                                    <div className={styles.readonlyField}>{selectedAssessment.professor}</div>
                                </div>
                                <div className={styles.signatureField}>
                                    <label>Assinatura:</label>
                                    <div className={styles.readonlyField}>_____________________________</div>
                                </div>
                            </div>

                            <button className={styles.exportButton} onClick={handleExportPDF}>
                                Exportar como PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessmentList;