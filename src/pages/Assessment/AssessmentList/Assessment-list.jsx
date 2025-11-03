import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./Assessment-list.module.css";
import parse from 'html-react-parser';
import Menu from "../../../components/Menu/Menu";
import jsPDF from 'jspdf';
import logoPdf from '../../../assets/logo-pdf.png';
import infoPdf from '../../../assets/info-pdf.png';
import api from "../../../api";

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

const AssessmentList = () => {
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [students, setStudents] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [userPermissions, setUserPermissions] = useState({});
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("");

    // Carregar dados e permissões
    useEffect(() => {
        const loadDataAndPermissions = async () => {
            try {
                const savedUser = localStorage.getItem("user");
                if (savedUser) {
                    const user = JSON.parse(savedUser);

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

                    // Carregar dados apenas se tiver permissão para visualizar
                    if (finalPermissions.view_evaluations) {
                        await loadStudents();
                        await loadAssessments();
                    }
                }
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

    const loadAssessments = async () => {
        try {
            const response = await api.get('/api/assessments');
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
        if (!userPermissions.view_evaluations) {
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
            const answer = options.find(opt => opt.value === selectedAssessment.responses[`q${index + 1}`])?.label || "Não respondido";
            let cleanQ = q.replace(/<[^>]+>/g, '').trim();
            cleanQ = cleanQ.replace(/^\d+\s*-\s*/, '');
            const line = `${index + 1} - ${cleanQ}: ${answer}`;
            const splitLines = doc.splitTextToSize(line, 180);
            splitLines.forEach(l => addLine(l));
            addEmptyLine();
        });

        // === PERGUNTAS ABERTAS ===
        openQuestions.forEach((q, index) => {
            const answer = selectedAssessment.responses[`openQ${index + 1}`] || "Não respondido";
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
                {userPermissions.view_evaluations ? (
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
                                            const selectedValue = selectedAssessment.responses[questionId];
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
                                                {selectedAssessment.responses[questionId] || "Não respondido"}
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