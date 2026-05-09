import React, { useState } from "react";
import InputMask from "react-input-mask";
import styles from "./Students.module.css";
import { useNavigate } from "react-router-dom";
import Menu from "../../components/Menu/Menu";
import api from "../../api";
import { usePermissions } from "../../hooks/usePermissions";
import { X } from "lucide-react";

const Students = () => {
  const navigate = useNavigate();
  const { permissions: userPermissions } = usePermissions();
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    dataIngresso: "",
    observacao: "",
    observacoesDetalhadas: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // "error" ou "success"

const handleChange = (e) => {
  const { name, value } = e.target;

  // Limite de 50 caracteres para observacao
  if (name === "observacao" && value.length > 50) {
    showModal("A observação breve não pode ter mais de 50 caracteres.");
    return; // não atualiza o estado com valor maior
  }

    // Limite de 50 caracteres para observacao
  if (name === "observacoesDetalhadas" && value.length > 500) {
    showModal("A observação detalhada não pode ter mais de 500 caracteres.");
    return; // não atualiza o estado com valor maior
  }

  setFormData((prev) => ({ ...prev, [name]: value }));
};
const validateAge = (dataNascimento, dataIngresso) => {
  // Criar datas usando apenas ano, mês e dia, ignorando horas (por causa de problema de TimeZone)
  const [anoIngresso, mesIngresso, diaIngresso] = dataIngresso.split('-').map(Number);
  const dataIngresoo = new Date(anoIngresso, mesIngresso - 1, diaIngresso); // mês começa do 0
  console.log("DataIngresso:", dataIngresoo);

  const [anoNasc, mesNasc, diaNasc] = dataNascimento.split('-').map(Number);
  const birthDate = new Date(anoNasc, mesNasc - 1, diaNasc);
  console.log("Data de nascimento:", birthDate);

  let age = dataIngresoo.getFullYear() - birthDate.getFullYear();
  const m = dataIngresoo.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && dataIngresoo.getDate() < birthDate.getDate())) {
    age--;
  }

  console.log("Idade:", age);
  return age >= 14;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar permissão para criar estudantes
    if (!userPermissions.create_students) {
      showModal("Você não tem as permissões para criar estudante. Se algo estiver errado consulte o Diretor.");
      return;
    }

    // Validação de campos obrigatórios
    if (!formData.nome.trim()) {
      showModal("O nome do aluno é obrigatório.");
      return;
    }
    if (!formData.cpf || formData.cpf.replace(/\D/g, '').length !== 11) {
      showModal("CPF inválido. Informe os 11 dígitos.");
      return;
    }
    if (!formData.dataNascimento) {
      showModal("A data de nascimento é obrigatória.");
      return;
    }
    if (!formData.dataIngresso) {
      showModal("A data de ingresso é obrigatória.");
      return;
    }

      // Validação da idade
  const age = validateAge(formData.dataNascimento, formData.dataIngresso);
  if (!age) {
    showModal("A idade mínima para ingresso no instituto é de 14 anos.");
    return;
  }

  // Proibição de ingresso em data futura.
  if (formData.dataIngresso > new Date().toISOString().split('T')[0]) {
    showModal("A data de ingresso não pode ser uma data futura.");
    return;
  }

  if (formData.observacao.trim().length > 50){
    showModal("A observação breve não pode ter mais de 50 caracteres.");
    return;
  }

  if (formData.observacoesDetalhadas.trim().length > 500) {
    showModal("A observação detalhada não pode ter mais de 500 caracteres.");
    return;
  } 

    try {
      // Preparar dados para envio
      const studentData = {
        nome: formData.nome.trim(),
        cpf: formData.cpf.replace(/\D/g, ''), // Remover formatação do CPF
        dataNascimento: formData.dataNascimento,
        dataIngresso: formData.dataIngresso,
        observacaoBreve: formData.observacao.trim(),
        observacaoDetalhada: formData.observacoesDetalhadas.trim(),
        acompanhamento: {
          av1: false,
          av2: false,
          entrevista1: false,
          entrevista2: false,
          resultado: "Pendente"
        }
      };

      // Enviar para o back-end
      await api.post('/students', studentData);

      showModal("Aluno cadastrado com sucesso!", "success");

      // Limpar formulário
      setFormData({
        nome: "",
        cpf: "",
        dataNascimento: "",
        dataIngresso: "",
        observacao: "",
        observacoesDetalhadas: "",
      });

    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);
      showModal(error.message || "Erro ao cadastrar aluno. Tente novamente.");
    }
  };

  const handleNavigate = () => {
    // Verificar permissão para ver lista de estudantes
    if (!userPermissions.view_students) {
      showModal("Você não tem permissão para visualizar a lista de estudantes. Se algo estiver errado consulte o Diretor.");
      return;
    }
    navigate("/students-list");
  };

  return (
    <div className={styles.container}>
      <Menu />
      <div className={styles.card}>
        <h2 className={styles.title}>Cadastro de Alunos</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Nome */}
          <label className={styles.label} htmlFor="nome">
            Nome do aluno(a):
          </label>
          <input
            className={styles.input}
            id="nome"
            name="nome"
            type="text"
            placeholder="Digite o nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />

          {/* CPF */}
          <label className={styles.label} htmlFor="cpf">
            CPF:
          </label>
          <InputMask
            mask="999.999.999-99"
            className={styles.input}
            id="cpf"
            name="cpf"
            placeholder="Digite o CPF"
            value={formData.cpf}
            onChange={handleChange}
            required
          />

          {/* Data de Nascimento */}
          <label className={styles.label} htmlFor="dataNascimento">
            Data de Nascimento:
          </label>
          <input
            className={styles.input}
            id="dataNascimento"
            name="dataNascimento"
            type="date"
            value={formData.dataNascimento}
            onChange={handleChange}
            required
          />

          {/* Data de Ingresso */}
          <label className={styles.label} htmlFor="dataIngresso">
            Data de Ingresso no Instituto:
          </label>
          <input
            className={styles.input}
            id="dataIngresso"
            name="dataIngresso"
            type="date"
            value={formData.dataIngresso}
            onChange={handleChange}
            required
          />

          {/* Observação curta */}
          <label className={styles.label} htmlFor="observacao">
            Observação (curta):
          </label>
          <input
            className={styles.input}
            id="observacao"
            name="observacao"
            type="text"
            placeholder="Digite uma observação breve"
            value={formData.observacao}
            onChange={handleChange}
            maxLength={50}
          />

          {/* Observações detalhadas */}
          <label className={styles.label} htmlFor="observacoesDetalhadas">
            Observações detalhadas:
          </label>
          <textarea
            className={styles.textarea}
            id="observacoesDetalhadas"
            name="observacoesDetalhadas"
            placeholder="Digite observações detalhadas sobre o aluno..."
            rows="4"
            value={formData.observacoesDetalhadas}
            onChange={handleChange}
          />

          {userPermissions.create_students && (
            <button className={styles.button} type="submit">
              Cadastrar
            </button>
          )}
        </form>

        <button className={styles.secondaryButton} onClick={handleNavigate}>
          Listar alunos cadastrados
        </button>
      </div>

      {/* Modal para mensagens */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
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