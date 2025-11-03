import React, { useState, useEffect } from "react";
import InputMask from "react-input-mask";
import styles from "./Students.module.css";
import { useNavigate } from "react-router-dom";
import Menu from "../../components/Menu/Menu";
import api from "../../api";
import { X } from "lucide-react";

const Students = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    dataIngresso: "",
    observacao: "",
    observacoesDetalhadas: "",
  });
  const [userPermissions, setUserPermissions] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // "error" ou "success"

  // Carregar permissões
  useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);

          // Carregar permissões do cargo
          const rolePermsResponse = await api.get(`/api/rolePermissions?role=${user.role}`);
          let rolePermissions = {};
          if (rolePermsResponse.data.length > 0) {
            rolePermissions = rolePermsResponse.data[0].permissions;
          }

          // Carregar permissões específicas do usuário
          const userPermsResponse = await api.get(`/api/userSpecificPermissions?userId=${user.id}`);
          let userSpecificPermissions = {};
          if (userPermsResponse.data.length > 0) {
            userSpecificPermissions = userPermsResponse.data[0].permissions;
          }

          // Combinar permissões (usuário sobrepõe cargo)
          const finalPermissions = { ...rolePermissions };
          Object.keys(userSpecificPermissions).forEach(perm => {
            if (userSpecificPermissions[perm] !== null) {
              finalPermissions[perm] = userSpecificPermissions[perm];
            }
          });

          setUserPermissions(finalPermissions);
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
      }
    };

    loadUserPermissions();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar permissão para criar estudantes
    if (!userPermissions.create_students) {
      showModal("Você não tem as permissões para criar estudante. Se algo estiver errado consulte o Diretor.");
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
      await api.post('/api/students', studentData);

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
      if (error.response && error.response.status === 403) {
        showModal("Acesso negado. Você não tem permissão para esta ação.");
      } else {
        showModal("Erro ao cadastrar aluno. Tente novamente.");
      }
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

          <button className={styles.button} type="submit">
            Cadastrar
          </button>
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