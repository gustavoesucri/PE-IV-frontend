import React, { useState } from "react";
import styles from "./StudentsList.module.css";
import Menu from "../../../components/Menu/Menu";
import { X } from "lucide-react";

const studentsData = [
  {
    id: 1,
    nome: "Ana Maria Silva Souza",
    dataNascimento: "2003-05-12",
    dataIngresso: "2021-02-15",
    dataDesligamento: "",
    status: "Ativo",
    observacao: "Boa aluna.",
    observacoesDetalhadas: "Muito dedicada, sempre entrega as atividades antes do prazo.",
  },
  {
    id: 2,
    nome: "Bruno Henrique Costa Lima",
    dataNascimento: "2001-08-22",
    dataIngresso: "2020-01-10",
    dataDesligamento: "2024-03-10",
    status: "Inativo",
    observacao: "Participa bastante.",
    observacoesDetalhadas: "Mostra interesse em debates, precisa melhorar entrega de tarefas.",
  },
  {
    id: 3,
    nome: "Carlos Eduardo Ferreira Santos",
    dataNascimento: "2004-02-10",
    dataIngresso: "2022-08-01",
    dataDesligamento: "",
    status: "Ativo",
    observacao: "Frequência baixa.",
    observacoesDetalhadas: "Frequência abaixo de 70%, já foi notificado.",
  },
  {
    id: 4,
    nome: "Diana Beatriz Oliveira Rocha",
    dataNascimento: "2002-11-30",
    dataIngresso: "2021-09-20",
    dataDesligamento: "",
    status: "Ativo",
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
  const [dateFilterType, setDateFilterType] = useState("dataIngresso");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // 'error', 'success', etc


  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    dataIngresso: "",
    dataDesligamento: "",
    status: "Ativo",
    observacao: "",
    observacoesDetalhadas: "",
  });

  const handleFilter = () => {
    if (!validateDates()) return;

    let results = students.filter((s) =>
      s.nome.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter !== "Status") {
      results = results.filter((s) => s.status === statusFilter);
    }

    if (dateFrom || dateTo) {
      results = results.filter((s) => {
        const dateValue = s[dateFilterType] ? new Date(s[dateFilterType]) : null;
        if (!dateValue) return false;

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
      dataIngresso: "",
      dataDesligamento: "",
      status: "Ativo",
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
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const validateDates = () => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      setModalType("error");
      setModalMessage("A data inicial não pode ser maior que a data final.");
      setShowModal(true);
      return false;
    }
    return true;
  };

  const handleClear = () => {
  setSearch("");
  setDateFilterType("dataIngresso"); // reseta para Ingresso
  setDateFrom("");
  setDateTo("");
  setStatusFilter("Status");
  // setFilteredStudents(students);
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

        {/* 🔹 Seletor tipo de data */}
        <select
          value={dateFilterType}
          onChange={(e) => setDateFilterType(e.target.value)}
          className={styles.input}
        >
          <option value="dataIngresso">Data de Ingresso</option>
          <option value="dataDesligamento">Data de Desligamento</option>
        </select>

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

        {/* 🔹 Seletor de status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.input}
        >
          <option value="Status">Status</option>
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>

        <button onClick={handleFilter} className={styles.filterButton}>
          Filtrar
        </button>
        <button onClick={handleClear} className={styles.clearButton}>
          Limpar
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              {/* <th>Data de Nascimento</th> */}
              <th>Data de Ingresso</th>
              {dateFilterType === "dataDesligamento" && <th>Data de Desligamento</th>}
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.nome}</td>
                  {/* <td>{formatDate(student.dataNascimento)}</td> */}
                  <td>{formatDate(student.dataIngresso)}</td>
                  {dateFilterType === "dataDesligamento" && (
                    <td>{formatDate(student.dataDesligamento)}</td>
                  )}
                  <td>{student.status}</td>
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
                <td colSpan="5" className={styles.noData}>
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
              <label htmlFor="nome">Nome:</label>
              <input
                id="nome"
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={styles.input}
              />

              <label htmlFor="dataNascimento">Data de Nascimento:</label>
              <input
                id="dataNascimento"
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                className={styles.input}
              />

              <label htmlFor="dataIngresso">Data de Ingresso:</label>
              <input
                id="dataIngresso"
                type="date"
                name="dataIngresso"
                value={formData.dataIngresso}
                onChange={handleChange}
                className={styles.input}
              />

              <label htmlFor="status">Status:</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>

              <label htmlFor="dataDesligamento">Data de Desligamento:</label>
              <input
                id="dataDesligamento"
                type="date"
                name="dataDesligamento"
                value={formData.dataDesligamento}
                onChange={handleChange}
                className={styles.input}
              />

              <label htmlFor="observacoesDetalhadas">Observações detalhadas:</label>
              <textarea
                id="observacoesDetalhadas"
                name="observacoesDetalhadas"
                value={formData.observacoesDetalhadas}
                onChange={handleChange}
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
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>

            <p
              className={
                modalType === "success"
                  ? styles.modalMessageSuccess
                  : modalType === "error"
                    ? styles.modalMessageError
                    : ""
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

export default StudentsList;
