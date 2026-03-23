import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./StudentsList.module.css";
import Menu from "../../../components/Menu/Menu";
import { 
  X, Edit, Trash2, Search, Filter, Download, Upload, 
  ChevronLeft, ChevronRight, Eye, UserPlus, AlertCircle,
  CheckCircle, FileText, RefreshCw, Printer, Mail, Phone,
  MapPin, Calendar, BookOpen, Users, GraduationCap
} from "lucide-react";
import api from "../../../api";

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [cursoFilter, setCursoFilter] = useState("");
  const [turmaFilter, setTurmaFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateFilterType, setDateFilterType] = useState("dataIngresso");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [hasViewPermission, setHasViewPermission] = useState(false);
  const [hasDeletePermission, setHasDeletePermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [messageModal, setMessageModal] = useState({ show: false, message: "", type: "" });
  const [cursos, setCursos] = useState([]);
  const [turmas, setTurmas] = useState([]);

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    dataIngresso: "",
    dataDesligamento: "",
    status: "Ativo",
    observacaoBreve: "",
    observacaoDetalhada: "",
    endereco: "",
    telefone: "",
    email: "",
    curso: "",
    turma: "",
    nomeMae: "",
    nomePai: "",
  });

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          const canView = user.role === 'diretor' || user.role === 'professor' || user.role === 'psicologo';
          const canEdit = user.role === 'diretor' || user.role === 'professor';
          const canDelete = user.role === 'diretor';
          setHasViewPermission(canView);
          setHasEditPermission(canEdit);
          setHasDeletePermission(canDelete);
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
      } finally {
        setLoading(false);
      }
    };
    checkPermissions();
  }, []);

  const loadStudents = useCallback(async () => {
    if (!hasViewPermission) return;
    try {
      setIsLoading(true);
      const response = await api.get('/students/all');
      const studentsData = response.data;
      setStudents(studentsData);
      setFilteredStudents(studentsData);
      
      const uniqueCursos = [...new Set(studentsData.map(s => s.curso).filter(Boolean))];
      const uniqueTurmas = [...new Set(studentsData.map(s => s.turma).filter(Boolean))];
      setCursos(uniqueCursos);
      setTurmas(uniqueTurmas);
    } catch (error) {
      console.error("Erro ao carregar estudantes:", error);
      showMessage("Erro ao carregar lista de estudantes.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [hasViewPermission]);

  useEffect(() => {
    if (!loading && hasViewPermission) loadStudents();
  }, [loading, hasViewPermission, loadStudents]);

  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, statusFilter, cursoFilter, turmaFilter, dateFrom, dateTo, dateFilterType, sortField, sortDirection]);

  const applyFilters = () => {
    let results = [...students];

    if (searchTerm) {
      results = results.filter(s => 
        s.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cpf?.includes(searchTerm) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "todos") {
      results = results.filter(s => s.status === statusFilter);
    }

    if (cursoFilter) {
      results = results.filter(s => s.curso === cursoFilter);
    }

    if (turmaFilter) {
      results = results.filter(s => s.turma === turmaFilter);
    }

    if (dateFrom && dateTo) {
      results = results.filter(s => {
        const dateValue = s[dateFilterType] ? new Date(s[dateFilterType]) : null;
        if (!dateValue) return false;
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        return dateValue >= from && dateValue <= to;
      });
    }

    results.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'dataIngresso' || sortField === 'dataNascimento') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredStudents(results);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const showMessage = (message, type = "error") => {
    setMessageModal({ show: true, message, type });
    setTimeout(() => setMessageModal({ show: false, message: "", type: "" }), 3000);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("todos");
    setCursoFilter("");
    setTurmaFilter("");
    setDateFrom("");
    setDateTo("");
    setDateFilterType("dataIngresso");
    setSortField("id");
    setSortDirection("desc");
  };

  const handleEditClick = (student) => {
    if (!hasEditPermission) {
      showMessage("Você não tem permissão para editar estudantes.", "error");
      return;
    }
    setEditingStudent(student);
    setFormData({
      nome: student.nome || "",
      dataNascimento: student.dataNascimento || "",
      dataIngresso: student.dataIngresso || "",
      dataDesligamento: student.dataDesligamento || "",
      status: student.status || "Ativo",
      observacaoBreve: student.observacaoBreve || "",
      observacaoDetalhada: student.observacaoDetalhada || "",
      endereco: student.endereco || "",
      telefone: student.telefone || "",
      email: student.email || "",
      curso: student.curso || "",
      turma: student.turma || "",
      nomeMae: student.nomeMae || "",
      nomePai: student.nomePai || "",
      cpf: student.cpf || ""
    });
    setIsEditModalOpen(true);
  };

  const handleViewClick = (student) => {
    setViewingStudent(student);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (student) => {
    if (!hasDeletePermission) {
      showMessage("Você não tem permissão para deletar estudantes.", "error");
      return;
    }
    setDeletingStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedStudents.map(s => s.id));
    }
  };

  const handleSelectStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(i => i !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedStudents.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setIsLoading(true);
      await api.delete('/students/bulk', { data: selectedStudents });
      await loadStudents();
      setSelectedStudents([]);
      showMessage(`${selectedStudents.length} alunos deletados com sucesso!`, "success");
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      console.error("Erro ao deletar alunos:", error);
      showMessage("Erro ao deletar alunos.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await api.patch(`/students/${editingStudent.id}`, {
        nome: formData.nome,
        dataNascimento: formData.dataNascimento,
        dataIngresso: formData.dataIngresso,
        dataDesligamento: formData.dataDesligamento || null,
        status: formData.status,
        observacaoBreve: formData.observacaoBreve,
        observacaoDetalhada: formData.observacaoDetalhada,
        endereco: formData.endereco,
        telefone: formData.telefone,
        email: formData.email,
        curso: formData.curso,
        turma: formData.turma,
        nomeMae: formData.nomeMae,
        nomePai: formData.nomePai,
      });
      await loadStudents();
      showMessage("Aluno atualizado com sucesso!", "success");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      if (error.response?.status === 409) {
        showMessage(error.response?.data?.message || "CPF ou nome já cadastrado.", "error");
      } else {
        showMessage("Erro ao atualizar aluno.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await api.delete(`/students/${deletingStudent.id}`);
      await loadStudents();
      showMessage("Aluno deletado com sucesso!", "success");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Erro ao deletar:", error);
      showMessage("Erro ao deletar aluno.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nome', 'CPF', 'Data Nascimento', 'Data Ingresso', 'Status', 'Curso', 'Turma', 'Telefone', 'Email', 'Endereço'];
    const rows = filteredStudents.map(s => [
      s.id, s.nome, s.cpf, s.dataNascimento, s.dataIngresso, s.status,
      s.curso || '', s.turma || '', s.telefone || '', s.email || '', s.endereco || ''
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alunos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Ativo': { class: styles.statusActive, label: 'Ativo' },
      'Inativo': { class: styles.statusInactive, label: 'Inativo' },
      'Trancado': { class: styles.statusSuspended, label: 'Trancado' },
      'Concluído': { class: styles.statusCompleted, label: 'Concluído' },
      'Desistente': { class: styles.statusDropped, label: 'Desistente' }
    };
    const config = statusConfig[status] || { class: styles.statusDefault, label: status };
    return <span className={`${styles.statusBadge} ${config.class}`}>{config.label}</span>;
  };

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  if (loading) {
    return (
      <div className={styles.container}>
        <Menu />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className={styles.container}>
        <Menu />
        <div className={styles.noPermissionContainer}>
          <AlertCircle size={64} />
          <h2>Sem Permissão</h2>
          <p>Você não tem permissão para visualizar alunos.</p>
          <p>Entre em contato com o diretor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Menu />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <GraduationCap size={28} />
              Lista de Alunos
            </h1>
            <div className={styles.stats}>
              <span className={styles.statBadge}>Total: {filteredStudents.length}</span>
              <span className={styles.statActive}>Ativos: {filteredStudents.filter(s => s.status === 'Ativo').length}</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.exportButton} onClick={exportToCSV}>
              <Download size={18} />
              Exportar CSV
            </button>
            <button className={styles.refreshButton} onClick={loadStudents}>
              <RefreshCw size={18} />
              Atualizar
            </button>
          </div>
        </div>

        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
            Filtros
          </button>
          {selectedStudents.length > 0 && (
            <button className={styles.bulkDeleteButton} onClick={handleBulkDelete}>
              <Trash2 size={18} />
              Deletar ({selectedStudents.length})
            </button>
          )}
        </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filtersGrid}>
              <div className={styles.filterGroup}>
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
                  <option value="todos">Todos</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Trancado">Trancado</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Desistente">Desistente</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Curso</label>
                <select value={cursoFilter} onChange={(e) => setCursoFilter(e.target.value)} className={styles.filterSelect}>
                  <option value="">Todos</option>
                  {cursos.map(curso => <option key={curso} value={curso}>{curso}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Turma</label>
                <select value={turmaFilter} onChange={(e) => setTurmaFilter(e.target.value)} className={styles.filterSelect}>
                  <option value="">Todas</option>
                  {turmas.map(turma => <option key={turma} value={turma}>{turma}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Tipo de Data</label>
                <select value={dateFilterType} onChange={(e) => setDateFilterType(e.target.value)} className={styles.filterSelect}>
                  <option value="dataIngresso">Data de Ingresso</option>
                  <option value="dataDesligamento">Data de Desligamento</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Data Início</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={styles.filterInput} />
              </div>
              <div className={styles.filterGroup}>
                <label>Data Fim</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={styles.filterInput} />
              </div>
            </div>
            <div className={styles.filterActions}>
              <button className={styles.clearFiltersButton} onClick={clearFilters}>Limpar Filtros</button>
            </div>
          </div>
        )}

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <input type="checkbox" checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0} onChange={handleSelectAll} />
                </th>
                <th className={styles.sortable} onClick={() => handleSort('id')}>ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                <th className={styles.sortable} onClick={() => handleSort('nome')}>Nome {sortField === 'nome' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                <th>CPF</th>
                <th className={styles.sortable} onClick={() => handleSort('dataIngresso')}>Data Ingresso {sortField === 'dataIngresso' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                <th>Status</th>
                <th>Curso</th>
                <th>Turma</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map(student => (
                  <tr key={student.id} className={selectedStudents.includes(student.id) ? styles.selectedRow : ''}>
                    <td className={styles.checkboxCell}>
                      <input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => handleSelectStudent(student.id)} />
                    </td>
                    <td>{student.id}</td>
                    <td className={styles.studentName}>
                      <div className={styles.nameCell}>
                        <span className={styles.nameText}>{student.nome}</span>
                        {student.email && <span className={styles.emailHint}>{student.email}</span>}
                      </div>
                    </td>
                    <td>{student.cpf ? student.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '—'}</td>
                    <td>{formatDate(student.dataIngresso)}</td>
                    <td>{getStatusBadge(student.status)}</td>
                    <td>{student.curso || '—'}</td>
                    <td>{student.turma || '—'}</td>
                    <td className={styles.actionsCell}>
                      <button className={styles.viewButton} onClick={() => handleViewClick(student)} title="Visualizar">
                        <Eye size={16} />
                      </button>
                      {hasEditPermission && (
                        <button className={styles.editButton} onClick={() => handleEditClick(student)} title="Editar">
                          <Edit size={16} />
                        </button>
                      )}
                      {hasDeletePermission && (
                        <button className={styles.deleteButton} onClick={() => handleDeleteClick(student)} title="Deletar">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className={styles.emptyState}>
                    <AlertCircle size={48} />
                    <p>Nenhum aluno encontrado</p>
                    <button className={styles.clearFiltersBtn} onClick={clearFilters}>Limpar Filtros</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredStudents.length > 0 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredStudents.length)} de {filteredStudents.length} alunos
            </div>
            <div className={styles.paginationControls}>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className={styles.perPageSelect}>
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className={styles.pageButton}>
                <ChevronLeft size={16} /> Primeiro
              </button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={styles.pageButton}>
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={styles.pageButton}>
                Próximo <ChevronRight size={16} />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className={styles.pageButton}>
                Último <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Visualização */}
      {isViewModalOpen && viewingStudent && (
        <div className={styles.modalOverlay} onClick={() => setIsViewModalOpen(false)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalhes do Aluno</h2>
              <button className={styles.modalClose} onClick={() => setIsViewModalOpen(false)}><X size={20} /></button>
            </div>
            <div className={styles.viewContent}>
              <div className={styles.viewSection}>
                <h3><UserPlus size={18} /> Dados Pessoais</h3>
                <div className={styles.viewGrid}>
                  <div><strong>Nome:</strong> {viewingStudent.nome}</div>
                  <div><strong>CPF:</strong> {viewingStudent.cpf ? viewingStudent.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '—'}</div>
                  <div><strong>Data Nascimento:</strong> {formatDate(viewingStudent.dataNascimento)}</div>
                  <div><strong>Idade:</strong> {viewingStudent.dataNascimento ? new Date().getFullYear() - new Date(viewingStudent.dataNascimento).getFullYear() : '—'} anos</div>
                </div>
              </div>
              <div className={styles.viewSection}>
                <h3><MapPin size={18} /> Contato</h3>
                <div className={styles.viewGrid}>
                  <div><strong>Endereço:</strong> {viewingStudent.endereco || '—'}</div>
                  <div><strong>Telefone:</strong> {viewingStudent.telefone || '—'}</div>
                  <div><strong>E-mail:</strong> {viewingStudent.email || '—'}</div>
                </div>
              </div>
              <div className={styles.viewSection}>
                <h3><BookOpen size={18} /> Acadêmico</h3>
                <div className={styles.viewGrid}>
                  <div><strong>Data Ingresso:</strong> {formatDate(viewingStudent.dataIngresso)}</div>
                  <div><strong>Status:</strong> {getStatusBadge(viewingStudent.status)}</div>
                  <div><strong>Curso:</strong> {viewingStudent.curso || '—'}</div>
                  <div><strong>Turma:</strong> {viewingStudent.turma || '—'}</div>
                  {viewingStudent.dataDesligamento && <div><strong>Data Desligamento:</strong> {formatDate(viewingStudent.dataDesligamento)}</div>}
                </div>
              </div>
              <div className={styles.viewSection}>
                <h3><Users size={18} /> Família</h3>
                <div className={styles.viewGrid}>
                  <div><strong>Nome da Mãe:</strong> {viewingStudent.nomeMae || '—'}</div>
                  <div><strong>Nome do Pai:</strong> {viewingStudent.nomePai || '—'}</div>
                </div>
              </div>
              {viewingStudent.observacaoBreve && (
                <div className={styles.viewSection}>
                  <h3><FileText size={18} /> Observações</h3>
                  <div><strong>Breve:</strong> {viewingStudent.observacaoBreve}</div>
                  {viewingStudent.observacaoDetalhada && <div><strong>Detalhada:</strong> {viewingStudent.observacaoDetalhada}</div>}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setIsViewModalOpen(false)} className={styles.closeButton}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edição */}
      {isEditModalOpen && editingStudent && (
        <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Editar Aluno</h2>
              <button className={styles.modalClose} onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            </div>
            <div className={styles.editContent}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Nome <span className={styles.required}>*</span></label>
                  <input name="nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>CPF</label>
                  <input name="cpf" value={formData.cpf} className={styles.input} disabled readOnly style={{ background: '#f5f5f5' }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Data Nascimento</label>
                  <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>Data Ingresso</label>
                  <input type="date" name="dataIngresso" value={formData.dataIngresso} onChange={(e) => setFormData({...formData, dataIngresso: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className={styles.select}>
                    <option>Ativo</option><option>Inativo</option><option>Trancado</option><option>Concluído</option><option>Desistente</option>
                  </select>
                </div>
                {formData.status === "Inativo" && (
                  <div className={styles.formGroup}>
                    <label>Data Desligamento</label>
                    <input type="date" name="dataDesligamento" value={formData.dataDesligamento} onChange={(e) => setFormData({...formData, dataDesligamento: e.target.value})} className={styles.input} />
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label>Telefone</label>
                  <input name="telefone" value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>E-mail</label>
                  <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>Curso</label>
                  <input name="curso" value={formData.curso} onChange={(e) => setFormData({...formData, curso: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>Turma</label>
                  <input name="turma" value={formData.turma} onChange={(e) => setFormData({...formData, turma: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroupFull}>
                  <label>Observação Breve</label>
                  <input name="observacaoBreve" value={formData.observacaoBreve} onChange={(e) => setFormData({...formData, observacaoBreve: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroupFull}>
                  <label>Observações Detalhadas</label>
                  <textarea name="observacaoDetalhada" value={formData.observacaoDetalhada} onChange={(e) => setFormData({...formData, observacaoDetalhada: e.target.value})} rows={4} className={styles.textarea} />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={handleSave} className={styles.saveButton} disabled={isLoading}>Salvar</button>
              <button onClick={() => setIsEditModalOpen(false)} className={styles.cancelButton}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Deleção Única */}
      {isDeleteModalOpen && deletingStudent && (
        <div className={styles.modalOverlay} onClick={() => setIsDeleteModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#dc3545' }}>Confirmar Deleção</h2>
              <button className={styles.modalClose} onClick={() => setIsDeleteModalOpen(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalContent}>
              <AlertCircle size={48} color="#dc3545" />
              <p>Tem certeza que deseja deletar o aluno <strong>"{deletingStudent.nome}"</strong>?</p>
              <p className={styles.warningText}>Esta ação não pode ser desfeita.</p>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={handleDelete} className={styles.deleteConfirmButton} disabled={isLoading}>Sim, Deletar</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className={styles.cancelButton}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Deleção em Massa */}
      {isBulkDeleteModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsBulkDeleteModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#dc3545' }}>Confirmar Deleção em Massa</h2>
              <button className={styles.modalClose} onClick={() => setIsBulkDeleteModalOpen(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalContent}>
              <AlertCircle size={48} color="#dc3545" />
              <p>Tem certeza que deseja deletar <strong>{selectedStudents.length} alunos</strong>?</p>
              <p className={styles.warningText}>Esta ação não pode ser desfeita.</p>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={confirmBulkDelete} className={styles.deleteConfirmButton} disabled={isLoading}>Sim, Deletar Todos</button>
              <button onClick={() => setIsBulkDeleteModalOpen(false)} className={styles.cancelButton}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {messageModal.show && (
        <div className={`${styles.toast} ${messageModal.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {messageModal.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{messageModal.message}</span>
        </div>
      )}
    </div>
  );
};

export default StudentsList;