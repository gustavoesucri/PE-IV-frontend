import React, { useState, useEffect } from "react";
import styles from "./EmploymentPlacement.module.css";
import { useNavigate } from "react-router-dom";
import Menu from "../../components/Menu/Menu";
import api from "../../api";
import { usePermissions } from "../../hooks/usePermissions";

const EmploymentPlacement = () => {
  const navigate = useNavigate();
  const { permissions: userPermissions, loading: permissionsLoading } = usePermissions();

  // Estados do formulário
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [admissao, setAdmissao] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [funcao, setFuncao] = useState("");
  const [contatoRh, setContatoRh] = useState("");
  const [dataDesligamento, setDataDesligamento] = useState("");
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  // Estados para dados
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Estados de UI
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  // Carregar dados
  useEffect(() => {
    if (permissionsLoading) return;

    const loadData = async () => {
      try {
        // Carregar estudantes ativos
        const studentsResponse = await api.get('/students');
        const activeStudents = studentsResponse.data.filter(student => student.status === "Ativo");
        setStudents(activeStudents);

        // Carregar empresas
        const companiesResponse = await api.get('/companies');
        setCompanies(companiesResponse.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Erro ao carregar dados. Tente novamente.");
      }
    };

    loadData();
  }, [permissionsLoading]);

  const handleSave = async () => {
    // Verificar permissão apenas quando tentar salvar
    if (!userPermissions.create_placements) {
      setPermissionModalOpen(true);
      return;
    }

    // Validações
    if (!selectedStudentId || !admissao || !empresaId || !funcao || !contatoRh || !dataDesligamento) {
      setError("Preencha todos os campos.");
      return;
    }

    // Validar datas
    const admissionDate = new Date(admissao);
    const dischargeDate = new Date(dataDesligamento);

    if (admissionDate >= dischargeDate) {
      setError("A data de desligamento deve ser posterior à data de admissão.");
      return;
    }

    setError("");

    try {
      // VERIFICAÇÃO DE ENCAMINHAMENTO DUPLICADO
      const placementsResponse = await api.get('/placements');
      const existingPlacement = placementsResponse.data.find(
        placement =>
          placement.studentId === parseInt(selectedStudentId) &&
          placement.empresaId === parseInt(empresaId) &&
          placement.status === "Ativo"
      );

      if (existingPlacement) {
        setError("Este estudante já possui um encaminhamento ativo para esta empresa.");
        return;
      }

      const savedUser = localStorage.getItem("user");
      const user = savedUser ? JSON.parse(savedUser) : null;

      const newPlacement = {
        studentId: parseInt(selectedStudentId),
        empresaId: parseInt(empresaId),
        dataAdmissao: admissao,
        funcao: funcao.trim(),
        contatoRh: contatoRh.trim(),
        dataDesligamento: dataDesligamento,
        status: "Ativo",
        createdAt: new Date().toISOString(),
        createdBy: user ? user.id : null
      };

      await api.post('/placements', newPlacement);

      // Limpar formulário
      setSelectedStudentId("");
      setAdmissao("");
      setEmpresaId("");
      setFuncao("");
      setContatoRh("");
      setDataDesligamento("");

      setSuccessModal(true);

    } catch (error) {
      console.error("Erro ao salvar encaminhamento:", error);
      setError("Erro ao salvar encaminhamento. Tente novamente.");
    }
  };

  const closeModal = () => {
    setSuccessModal(false);
  };

  const handleNavigate = () => {
    navigate("/employment-placement-list");
  };

  return (
    <div className={styles.container}>
      <Menu />

      <h1 className={styles.pageTitle}>Cadastro de Estudantes Encaminhados</h1>

      <div className={styles.card}>
        <form className={styles.form}>
          {/* Nome do Estudante */}
          <label className={styles.label}>Nome do Estudante:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className={styles.input}
          >
            <option value="">Selecione um estudante...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.nome}
              </option>
            ))}
          </select>

          {/* Data de Admissão */}
          <label className={styles.label}>Data de Admissão:</label>
          <input
            type="date"
            value={admissao}
            onChange={(e) => setAdmissao(e.target.value)}
            className={styles.input}
          />

          {/* Empresa */}
          <label className={styles.label}>Empresa:</label>
          <select
            value={empresaId}
            onChange={(e) => setEmpresaId(e.target.value)}
            className={styles.input}
          >
            <option value="">Selecione uma empresa...</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.nome}
              </option>
            ))}
          </select>

          {/* Função */}
          <label className={styles.label}>Função/Cargo:</label>
          <input
            type="text"
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            className={styles.input}
            placeholder="Digite a função/cargo"
          />

          {/* Contato RH */}
          <label className={styles.label}>Contato do RH:</label>
          <input
            type="text"
            value={contatoRh}
            onChange={(e) => setContatoRh(e.target.value)}
            className={styles.input}
            placeholder="Ex: Ana Pereira - (11) 99999-9999"
          />

          {/* Data de Desligamento Prevista */}
          <label className={styles.label}>Data de Desligamento Prevista do IEEDF:</label>
          <input
            type="date"
            value={dataDesligamento}
            onChange={(e) => setDataDesligamento(e.target.value)}
            className={styles.input}
          />

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.button} type="button" onClick={handleSave}>
            Salvar Encaminhamento
          </button>
        </form>

        <button className={styles.secondaryButton} onClick={handleNavigate}>
          Ver Lista de Encaminhados
        </button>
      </div>

      {/* Modal de Sucesso */}
      {successModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Sucesso!</h3>
            <p>Encaminhamento cadastrado com sucesso!</p>
            <div className={styles.modalButtons}>
              <button className={styles.modalButton} onClick={closeModal}>
                Continuar Cadastrando
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => navigate("/employment-placement-list")}
              >
                Ver Lista
              </button>
            </div>
          </div>
        </div>
      )}
      {permissionModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setPermissionModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Acesso Negado</h3>
            <p>Você não tem permissão para cadastrar estudantes encaminhados.</p>
            <p>Se for necessário, consulte o diretor.</p>
            <button
              className={styles.modalButton}
              onClick={() => setPermissionModalOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmploymentPlacement;