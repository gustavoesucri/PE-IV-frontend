import React, { useState } from "react";
import { NotebookPen, X } from "lucide-react";
import styles from "./StudentsList.module.css";
import BackButton from "../../components/BackButton/BackButton";

const studentsData = [
  { nome: "Ana Maria Silva Souza", dataNascimento: "2003-05-12", observacao: "Boa aluna, dedicada." },
  { nome: "Bruno Henrique Costa Lima", dataNascimento: "2001-08-22", observacao: "Participa bastante em sala." },
  { nome: "Carlos Eduardo Ferreira Santos", dataNascimento: "2004-02-10", observacao: "Precisa melhorar frequência." },
  { nome: "Diana Beatriz Oliveira Rocha", dataNascimento: "2002-11-30", observacao: "Exemplo para os colegas." },
];

const StudentsList = () => {
  const [students, setStudents] = useState(studentsData);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({ nome: "", dataNascimento: "", observacao: "" });
  const [expanded, setExpanded] = useState(null); // guarda índice do expandido

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormData({ ...student });
  };

  const handleCloseModal = () => {
    setEditingStudent(null);
    setFormData({ nome: "", dataNascimento: "", observacao: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setStudents((prev) =>
      prev.map((s) => (s === editingStudent ? { ...formData } : s))
    );
    handleCloseModal();
  };

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h1 className={styles.title}>Lista de Alunos</h1>

      {students.map((student, index) => (
        <div key={index} className={styles.alumn}>
          <div className={styles.alumnHeader} onClick={() => toggleExpand(index)}>
            <strong>{student.nome}</strong>
          </div>

          {expanded === index && (
            <div className={styles.alumnDetails}>
              <p><strong>Data de Nascimento:</strong> {formatDate(student.dataNascimento)}</p>
              <p><strong>Observação:</strong> {student.observacao}</p>
            </div>
          )}

          <button
            onClick={() => handleEditClick(student)}
            className={styles.editIcon}
            title={`Editar ${student.nome}`}
          >
            <NotebookPen size={18} />
          </button>
        </div>
      ))}

      {editingStudent && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={handleCloseModal}>
              <X size={20} />
            </button>
            <h2 className={styles.modalTitle}>Editar Aluno</h2>

            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome"
              className={styles.modalInput}
            />
            <input
              type="date"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
              className={styles.modalInput}
            />
            <textarea
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              placeholder="Observação"
              rows={4}
              className={styles.modalTextarea}
            />

            <button onClick={handleSave} className={styles.saveBtn}>
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;
