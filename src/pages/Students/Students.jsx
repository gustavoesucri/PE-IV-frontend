import React, { useState, useEffect } from "react";
import InputMask from "react-input-mask";
import styles from "./Students.module.css";
import { useNavigate } from "react-router-dom";
import Menu from "../../components/Menu/Menu";
import api from "../../api";
import { X, Save, UserPlus, List, AlertCircle, CheckCircle } from "lucide-react";

const Students = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    dataIngresso: "",
    observacao: "",
    observacoesDetalhadas: "",
    endereco: "",
    telefone: "",
    email: "",
    curso: "",
    turma: "",
    nomeMae: "",
    nomePai: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          const canCreate = user.role === 'diretor' || user.role === 'professor';
          setHasPermission(canCreate);
        }
      } catch (error) {
        console.error('Erro ao verificar permissão:', error);
      } finally {
        setLoading(false);
      }
    };
    checkPermission();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showModal = (message, type = "error") => {
    setModalMessage(message);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
    setModalType("");
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      showModal("Nome é obrigatório");
      return false;
    }
    if (!formData.cpf.replace(/\D/g, '') || formData.cpf.replace(/\D/g, '').length !== 11) {
      showModal("CPF inválido");
      return false;
    }
    if (!formData.dataNascimento) {
      showModal("Data de nascimento é obrigatória");
      return false;
    }
    if (!formData.dataIngresso) {
      showModal("Data de ingresso é obrigatória");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasPermission) {
      showModal("Você não tem permissão para criar estudante.");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const studentData = {
        nome: formData.nome.trim(),
        cpf: formData.cpf.replace(/\D/g, ''),
        dataNascimento: formData.dataNascimento,
        dataIngresso: formData.dataIngresso,
        observacaoBreve: formData.observacao.trim(),
        observacaoDetalhada: formData.observacoesDetalhadas.trim(),
        endereco: formData.endereco,
        telefone: formData.telefone,
        email: formData.email,
        curso: formData.curso,
        turma: formData.turma,
        nomeMae: formData.nomeMae,
        nomePai: formData.nomePai,
        status: "Ativo",
        acompanhamento: {
          av1: false,
          av2: false,
          entrevista1: false,
          entrevista2: false,
          resultado: "Pendente"
        }
      };

      await api.post('/students', studentData);
      showModal("Aluno cadastrado com sucesso!", "success");
      
      setFormData({
        nome: "",
        cpf: "",
        dataNascimento: "",
        dataIngresso: "",
        observacao: "",
        observacoesDetalhadas: "",
        endereco: "",
        telefone: "",
        email: "",
        curso: "",
        turma: "",
        nomeMae: "",
        nomePai: "",
      });

      setTimeout(() => navigate("/students-list"), 2000);
    } catch (error) {
      if (error.response?.status === 409) {
        showModal(error.response?.data?.message || "CPF ou nome já cadastrado.");
      } else {
        showModal("Erro ao cadastrar aluno. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Menu />
        <div className={styles.card}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Menu />
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <UserPlus size={24} />
            Cadastro de Alunos
          </h2>
          <div className={styles.headerActions}>
            <button className={styles.listButton} onClick={() => navigate("/students-list")}>
              <List size={18} />
              Listar Alunos
            </button>
          </div>
        </div>

        {!hasPermission ? (
          <div className={styles.noPermissionMessage}>
            <AlertCircle size={48} />
            <p>Você não tem permissão para cadastrar alunos.</p>
            <p>Entre em contato com o diretor.</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.tabs}>
              <button 
                type="button"
                className={`${styles.tab} ${activeTab === 'basic' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                Dados Básicos
              </button>
              <button 
                type="button"
                className={`${styles.tab} ${activeTab === 'contact' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                Contato
              </button>
              <button 
                type="button"
                className={`${styles.tab} ${activeTab === 'academic' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('academic')}
              >
                Acadêmico
              </button>
              <button 
                type="button"
                className={`${styles.tab} ${activeTab === 'family' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('family')}
              >
                Família
              </button>
            </div>

            {activeTab === 'basic' && (
              <div className={styles.tabContent}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nome do aluno(a): <span className={styles.required}>*</span></label>
                  <input
                    className={styles.input}
                    name="nome"
                    type="text"
                    placeholder="Digite o nome completo"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>CPF: <span className={styles.required}>*</span></label>
                    <InputMask
                      mask="999.999.999-99"
                      className={styles.input}
                      name="cpf"
                      placeholder="Digite o CPF"
                      value={formData.cpf}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Data de Nascimento: <span className={styles.required}>*</span></label>
                    <input
                      className={styles.input}
                      name="dataNascimento"
                      type="date"
                      value={formData.dataNascimento}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Observação (curta):</label>
                  <input
                    className={styles.input}
                    name="observacao"
                    type="text"
                    placeholder="Digite uma observação breve"
                    value={formData.observacao}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Observações detalhadas:</label>
                  <textarea
                    className={styles.textarea}
                    name="observacoesDetalhadas"
                    placeholder="Digite observações detalhadas sobre o aluno..."
                    rows="4"
                    value={formData.observacoesDetalhadas}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className={styles.tabContent}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Endereço:</label>
                  <input
                    className={styles.input}
                    name="endereco"
                    type="text"
                    placeholder="Rua, número, bairro, cidade"
                    value={formData.endereco}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Telefone:</label>
                    <InputMask
                      mask="(99) 99999-9999"
                      className={styles.input}
                      name="telefone"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>E-mail:</label>
                    <input
                      className={styles.input}
                      name="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className={styles.tabContent}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Data de Ingresso: <span className={styles.required}>*</span></label>
                    <input
                      className={styles.input}
                      name="dataIngresso"
                      type="date"
                      value={formData.dataIngresso}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Curso:</label>
                    <input
                      className={styles.input}
                      name="curso"
                      type="text"
                      placeholder="Nome do curso"
                      value={formData.curso}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Turma:</label>
                  <input
                    className={styles.input}
                    name="turma"
                    type="text"
                    placeholder="Turma/Grupo"
                    value={formData.turma}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {activeTab === 'family' && (
              <div className={styles.tabContent}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nome da Mãe:</label>
                    <input
                      className={styles.input}
                      name="nomeMae"
                      type="text"
                      placeholder="Nome completo da mãe"
                      value={formData.nomeMae}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nome do Pai:</label>
                    <input
                      className={styles.input}
                      name="nomePai"
                      type="text"
                      placeholder="Nome completo do pai"
                      value={formData.nomePai}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
                <Save size={18} />
                {isSubmitting ? "Cadastrando..." : "Cadastrar Aluno"}
              </button>
              <button 
                type="button" 
                className={styles.cancelButton} 
                onClick={() => navigate("/students-list")}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              {modalType === "success" ? <CheckCircle size={24} color="#28a745" /> : <AlertCircle size={24} color="#dc3545" />}
              <h2 className={modalType === "success" ? styles.modalSuccessTitle : styles.modalErrorTitle}>
                {modalType === "success" ? "Sucesso" : "Aviso"}
              </h2>
              <button className={styles.modalClose} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>{modalMessage}</p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={`${styles.modalButton} ${modalType === "success" ? styles.modalSuccessButton : styles.modalErrorButton}`}
                onClick={closeModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;