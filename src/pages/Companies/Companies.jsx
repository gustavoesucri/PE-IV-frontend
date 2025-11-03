import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import styles from "./Companies.module.css";
import Menu from "../../components/Menu/Menu";
import api from "../../api";
import { X } from "lucide-react";

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const validateCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14) return false;
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
};

const Companies = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    rua: "",
    numero: "",
    bairro: "",
    estado: "",
    cep: "",
  });
  const [userPermissions, setUserPermissions] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

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
        showMessage("Erro ao carregar permissões do usuário.", "error");
      }
    };

    loadUserPermissions();
  }, []);

  const showMessage = (message, type = "error") => {
    setModalMessage(message);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
    setModalType("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "numero") {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Verificar permissão para criar empresas
  if (!userPermissions.create_companies) {
    showMessage("Você não tem permissão para cadastrar empresas. Se algo estiver errado consulte o Diretor.");
    return;
  }

  if (!formData.nome || !formData.cnpj) {
    showMessage("Por favor, preencha os campos obrigatórios (Nome e CNPJ).");
    return;
  }
  
  if (!validateCNPJ(formData.cnpj)) {
    showMessage("CNPJ inválido.");
    return;
  }
  
  if (formData.cep && formData.cep.replace(/[^\d]+/g, "").length !== 8) {
    showMessage("CEP deve ter exatamente 8 dígitos.");
    return;
  }

  try {
    // Preparar dados para envio
    const companyData = {
      nome: formData.nome.trim(),
      cnpj: formData.cnpj.replace(/[^\d]+/g, ""),
      rua: formData.rua.trim(),
      numero: formData.numero,
      bairro: formData.bairro.trim(),
      estado: formData.estado,
      cep: formData.cep.replace(/[^\d]+/g, ""),
    };

    // Verificar se CNPJ ou nome já existem
    const companiesResponse = await api.get('/api/companies');
    const cnpjExists = companiesResponse.data.some(
      company => company.cnpj === companyData.cnpj
    );

    const nomeExists = companiesResponse.data.some(
      company => company.nome.toLowerCase() === companyData.nome.toLowerCase()
    );

    if (cnpjExists) {
      showMessage("CNPJ já cadastrado. Não é possível cadastrar uma empresa com o mesmo CNPJ.");
      return;
    }

    if (nomeExists) {
      showMessage("Nome da empresa já cadastrado. Não é possível cadastrar uma empresa com o mesmo nome.");
      return;
    }

    // Enviar para o back-end
    await api.post('/api/companies', companyData);

    showMessage("Empresa cadastrada com sucesso!", "success");
    
    // Limpar formulário
    setFormData({
      nome: "",
      cnpj: "",
      rua: "",
      numero: "",
      bairro: "",
      estado: "",
      cep: "",
    });

  } catch (error) {
    console.error("Erro ao cadastrar empresa:", error);
    if (error.response && error.response.status === 403) {
      showMessage("Acesso negado. Você não tem permissão para esta ação.");
    } else if (error.response && error.response.status === 400) {
      showMessage("Erro nos dados enviados. Verifique as informações.");
    } else {
      showMessage("Erro ao cadastrar empresa. Tente novamente.");
    }
  }
};

  const handleNavigate = () => {
    navigate("/companies-list");
  };

  return (
    <div className={styles.container}>
      <Menu />

      <div className={styles.card}>
        <h2 className={styles.title}>Cadastro de Empresas</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="nome">
            Nome da empresa:
          </label>
          <input
            className={styles.input}
            id="nome"
            name="nome"
            type="text"
            placeholder="Digite o nome da empresa"
            value={formData.nome}
            onChange={handleChange}
            required
          />

          <label className={styles.label} htmlFor="cnpj">
            CNPJ da empresa:
          </label>
          <InputMask
            mask="99.999.999/9999-99"
            value={formData.cnpj}
            onChange={handleChange}
            name="cnpj"
            required
          >
            {(inputProps) => (
              <input
                {...inputProps}
                className={styles.input}
                id="cnpj"
                placeholder="Digite o CNPJ (ex: 12.345.678/0001-95)"
              />
            )}
          </InputMask>

          <h3 className={styles.subTitle}>Endereço</h3>

          <label className={styles.label} htmlFor="rua">
            Rua:
          </label>
          <input
            className={styles.input}
            id="rua"
            name="rua"
            type="text"
            placeholder="Digite a rua"
            value={formData.rua}
            onChange={handleChange}
          />

          <label className={styles.label} htmlFor="numero">
            Número:
          </label>
          <input
            className={styles.input}
            id="numero"
            name="numero"
            type="text"
            placeholder="Digite o número"
            value={formData.numero}
            onChange={handleChange}
            maxLength="10"
          />

          <label className={styles.label} htmlFor="bairro">
            Bairro:
          </label>
          <input
            className={styles.input}
            id="bairro"
            name="bairro"
            type="text"
            placeholder="Digite o bairro"
            value={formData.bairro}
            onChange={handleChange}
          />

          <label className={styles.label} htmlFor="estado">
            Estado:
          </label>
          <select
            className={styles.select}
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
          >
            <option value="" disabled>
              Selecione um estado
            </option>
            {brazilianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <label className={styles.label} htmlFor="cep">
            CEP:
          </label>
          <InputMask
            mask="99999-999"
            value={formData.cep}
            onChange={handleChange}
            name="cep"
          >
            {(inputProps) => (
              <input
                {...inputProps}
                className={styles.input}
                id="cep"
                placeholder="Digite o CEP (ex: 12345-678)"
              />
            )}
          </InputMask>

          <button type="submit" className={styles.button}>
            Cadastrar
          </button>
        </form>

        <button className={styles.secondaryButton} onClick={handleNavigate}>
          Listar empresas cadastradas
        </button>
      </div>

      {/* Modal de Mensagem */}
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

export default Companies;