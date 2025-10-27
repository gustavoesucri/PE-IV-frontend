import React, { useState } from "react";
import styles from "./StudentsList.module.css";
import Menu from "../../../components/Menu/Menu";

const studentsData = [
  {
    id: 1, // Added ID for unique key
    nome: "Ana Maria Silva Souza",
    dataNascimento: "2003-05-12",
    observacao: "Boa aluna.",
    observacoesDetalhadas: "Muito dedicada, sempre entrega as atividades antes do prazo.",
  },
  {
    id: 2,
    nome: "Bruno Henrique Costa Lima",
    dataNascimento: "2001-08-22",
    observacao: "Participa bastante.",
    observacoesDetalhadas: "Mostra interesse em debates, precisa melhorar entrega de tarefas.",
  },
  {
    id: 3,
    nome: "Carlos Eduardo Ferreira Santos",
    dataNascimento: "2004-02-10",
    observacao: "Frequência baixa.",
    observacoesDetalhadas: "Frequência abaixo de 70%, já foi notificado.",
  },
  {
    id: 4,
    nome: "Diana Beatriz Oliveira Rocha",
    dataNascimento: "2002-11-30",
    observacao: "Exemplar.",
    observacoesDetalhadas: "Ajuda colegas com dificuldades, excelente rendimento.",
  },
];

const StudentsList = () => {
  const [students, setStudents] = useState(studentsData);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filteredStudents, setFilteredStudents] = useState(studentsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    observacao: "",
    observacoesDetalhadas: "",
  });

  const handleFilter = () => {
    let results = students.filter((s) =>
      s.nome.toLowerCase().includes(search.toLowerCase())
    );

    if (dateFrom || dateTo) {
      results = results.filter((s) => {
        const dateValue = new Date(s.dataNascimento);
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;

        if (from && dateValue < from) return false;
        if (to && dateValue > to) return false;
        return true;
      });
    }

    setFilteredStudents(results);
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({
      nome: "",
      dataNascimento: "",
      observacao: "",
      observacoesDetalhadas: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setStudents((prev) =>
      prev.map((s) => (s.id === editingStudent.id ? { ...formData, id: s.id } : s))
    );
    setFilteredStudents((prev) =>
      prev.map((s) => (s.id === editingStudent.id ? { ...formData, id: s.id } : s))
    );
    handleCloseModal();
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={styles.container}>
      <Menu />
      <h1 className={styles.title}>Lista de Alunos</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input}
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={styles.input}
        />
        <span className={styles.rangeSeparator}>até</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleFilter} className={styles.filterButton}>
          Filtrar
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Data de Nascimento</th>
              <th>Observação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.nome}</td>
                  <td>{formatDate(student.dataNascimento)}</td>
                  <td>{student.observacao}</td>
                  <td>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditClick(student)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noData}>
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingStudent && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Editar Aluno</h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <div className={styles.modalContent}>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome"
                className={styles.input}
              />
              <input
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                type="text"
                name="observacao"
                value={formData.observacao}
                onChange={handleChange}
                placeholder="Observação (curta)"
                maxLength={100}
                className={styles.input}
              />
              <textarea
                name="observacoesDetalhadas"
                value={formData.observacoesDetalhadas}
                onChange={handleChange}
                placeholder="Observações detalhadas"
                rows={5}
                className={styles.textarea}
              />
            </div>
            <div className={styles.modalFooter}>
              <button onClick={handleSave} className={styles.filterButton}>
                Salvar
              </button>
              <button onClick={handleCloseModal} className={styles.filterButton}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;