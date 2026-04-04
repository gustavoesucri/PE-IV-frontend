import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./Assessment-list.module.css";
import parse from 'html-react-parser';
import Menu from "../../../components/Menu/Menu";
import jsPDF from 'jspdf';
import logoPdf from '../../../assets/logo-pdf.png';
import infoPdf from '../../../assets/info-pdf.png';
import api from "../../../api";
import { usePermissions } from "../../../hooks/usePermissions";

const AssessmentList = () => {
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [students, setStudents] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const { permissions: userPermissions, loading: permissionsLoading } = usePermissions();
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("");

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

    // Carregar questões da API
    useEffect(() => {
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
                if (userPermissions.view_assessments) {
                    await loadStudents();
                    await loadAssessments();
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

    const loadAssessments = async () => {
        try {
            const response = await api.get('/assessments');
            setAssessments(response.data);
        } catch (error) {
            console.error("Erro ao carregar avaliações:", error);
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

    // Obter nome do estudante
    const getStudentName = (studentId) => {
        const student = students.find(s => s.id === studentId);
        return student ? student.nome : "N/A";
    };

    const handleView = (type) => {
        if (!userPermissions.view_assessments) {
            showMessage("Você não tem permissão para visualizar avaliações. Consulte o diretor.");
            return;
        }

        const assessment = assessments.find(a => 
            a.studentId === parseInt(selectedStudentId) && 
            a.evaluationType === type
        );
        
        if (assessment) {
            setSelectedAssessment(assessment);
            setShowModal(true);
        }
    };

    const hasAssessment = (type) => {
        return assessments.some(a => 
            a.studentId === parseInt(selectedStudentId) && 
            a.evaluationType === type
        );
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
            logoImg.src = logoPdf; 
            doc.addImage(logoImg, 'PNG', pageWidth / 2 - 25, y, 50, 30);
            y += 35;
        } catch (e) {
            console.warn("Logo não encontrada, continuando sem ela.");
        }

        // === CABEÇALHO ===
        addLine(`Avaliação do Usuário: ${getStudentName(selectedAssessment.studentId)}`, 14, true);
        addLine(`Data de Entrada: ${selectedAssessment.entryDate}`);
        addLine(`Data da Avaliação: ${selectedAssessment.assessmentDate}`);
        addLine(`Tipo: ${selectedAssessment.evaluationType === "primeira" ? "1ª Avaliação" : "2ª Avaliação"}`);
        addEmptyLine();

        // === PERGUNTAS FECHADAS ===
        questions.forEach((q, index) => {
            const answer = options.find(opt => opt.value === selectedAssessment[`q${index + 1}`])?.label || "Não respondido";
            let cleanQ = q.replace(/<[^>]+>/g, '').trim();
            cleanQ = cleanQ.replace(/^\d+\s*-\s*/, '');
            const line = `${index + 1} - ${cleanQ}: ${answer}`;
            const splitLines = doc.splitTextToSize(line, 180);
            splitLines.forEach(l => addLine(l));
            addEmptyLine();
        });

        // === PERGUNTAS ABERTAS ===
        openQuestions.forEach((q, index) => {
            const answer = selectedAssessment[textQuestions[index]?.code] || "Não respondido";
            let cleanQ = q.replace(/<[^>]+>/g, '').trim();
            cleanQ = cleanQ.replace(/^\d+\s*-\s*/, '').replace(/^\*\*/, '').replace(/^\*/, '');
            addLine(`${cleanQ}`, 12, true);
            const splitAnswer = doc.splitTextToSize(answer, 180);
            splitAnswer.forEach(line => addLine(line, 11));
            addEmptyLine();
        });

        // === RODAPÉ COM PROFESSOR ===
        addLine(`Nome do professor (a): ${selectedAssessment.professorName}`, 12, true);
        addLine("Assinatura: _______________________________");
        addEmptyLine();

        // === 2. IMAGEM INFO NO FINAL ===
        try {
            const infoImg = new Image();
            infoImg.src = infoPdf;
            const imgHeight = 30;
            const imgY = pageHeight - imgHeight - 10;
            doc.addImage(infoImg, 'PNG', pageWidth / 2 - 40, imgY, 80, imgHeight);
        } catch (e) {
            console.warn("Imagem info não encontrada, continuando sem ela.");
        }

        // === SALVAR ===
        const studentName = getStudentName(selectedAssessment.studentId).replace(/\s+/g, '_');
        doc.save(`avaliacao_${studentName}_${selectedAssessment.evaluationType}.pdf`);
    };

    return (
        <div className={styles.container}>
            <Menu />
            <h1 className={styles.title}>Lista de Avaliações</h1>

            <div className={styles.tableWrapper}>
                {userPermissions.view_assessments ? (
                    <>
                        <div className={styles.formGroup}>
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className={styles.input}
                            >
                                <option value="">-- Selecione um aluno(a)...</option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>{student.nome}</option>
                                ))}
                            </select>
                        </div>

                        {selectedStudentId && (
                            <div className={styles.studentInfo}>
                                <h2>Aluno: {getStudentName(parseInt(selectedStudentId))}</h2>
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
                    </>
                ) : (
                    <div className={styles.noPermissionMessage}>
                        Não foi possível carregar a visualização devido a falta de permissões, se for um problema, consulte o diretor.
                    </div>
                )}
            </div>

            {/* === MODAL DE VISUALIZAÇÃO === */}
            {showModal && selectedAssessment && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Visualização da Avaliação</h2>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.readonlyForm}>
                            <div className={styles.topFields}>
                                <div>
                                    <label>Nome:</label>
                                    <div className={styles.readonlyField}>{getStudentName(selectedAssessment.studentId)}</div>
                                </div>
                                <div>
                                    <label>Data de Entrada:</label>
                                    <div className={styles.readonlyField}>{selectedAssessment.entryDate}</div>
                                </div>
                                <div>
                                    <label>Avaliação:</label>
                                    <div className={styles.readonlyField}>
                                        {selectedAssessment.evaluationType === "primeira" ? "1ª Avaliação" : "2ª Avaliação"}
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
                                            const selectedValue = selectedAssessment[questionId];
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
                                                {selectedAssessment[questionId] || "Não respondido"}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* === RODAPÉ DO MODAL === */}
                            <div className={styles.footerSection}>
                                <div className={styles.professorField}>
                                    <label>Nome do professor (a):</label>
                                    <div className={styles.readonlyField}>{selectedAssessment.professorName}</div>
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
                            <button 
                                className={`${styles.modalButton} ${modalType === "success" ? styles.modalSuccessButton : styles.modalErrorButton}`}
                                onClick={closeMessageModal}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessmentList;