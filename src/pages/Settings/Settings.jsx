import React, { useState, useEffect } from "react";
import styles from "./Settings.module.css";
import { X } from "lucide-react";
import Menu from "../../components/Menu/Menu";
import api from "../../api";

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [currentPasswordFromServer, setCurrentPasswordFromServer] = useState("");

  // Formatar categoria (role) para exibição
  const formatRole = (role) => {
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // Carregar usuário e configurações
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          
          // Buscar dados completos do usuário (incluindo senha) do back-end
          try {
            const userResponse = await api.get(`/api/users/${user.id}`);
            setCurrentPasswordFromServer(userResponse.data.password);
          } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
          }
          
          // Carregar configurações do usuário do back-end
          const response = await api.get(`/api/userSettings?userId=${user.id}`);
          if (response.data && response.data.length > 0) {
            setUserSettings(response.data[0]);
          } else {
            throw new Error("Configurações não encontradas");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        setSuccessMessage("Erro ao carregar configurações do servidor");
      }
    };

    loadUserData();
  }, []);

  // Atualizar CONFIGURAÇÕES no back-end (notificações)
  const updateUserSettings = async (newSettings) => {
    if (!userSettings || !currentUser) {
      throw new Error("Usuário ou configurações não carregados");
    }

    try {
      const updatedSettings = {
        ...userSettings,
        settings: {
          ...userSettings.settings,
          ...newSettings
        },
        updatedAt: new Date().toISOString()
      };

      const response = await api.patch(`/api/userSettings/${userSettings.id}`, updatedSettings);
      setUserSettings(response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      throw new Error("Erro ao atualizar configurações no servidor");
    }
  };

  // Atualizar DADOS DO USUÁRIO no back-end (email, senha)
  const updateUserData = async (userData) => {
    if (!currentUser) {
      throw new Error("Usuário não carregado");
    }

    try {
      const response = await api.patch(`/api/users/${currentUser.id}`, userData);
      
      // Atualizar também no localStorage (sem a senha por segurança)
      const userDataForStorage = { ...userData };
      delete userDataForStorage.password; // Não salvar senha no localStorage
      
      const updatedUser = { ...currentUser, ...userDataForStorage };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Atualizar a senha local se for uma alteração de senha
      if (userData.password) {
        setCurrentPasswordFromServer(userData.password);
      }
      
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
      throw new Error("Erro ao atualizar dados no servidor");
    }
  };

  // --- Modal Senha ---
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSuccessMessage("");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordMatch(null);
    setPasswordError("");
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro quando o usuário digitar
    if (passwordError) {
      setPasswordError("");
    }

    // Verificar se as senhas coincidem
    if (name === "confirmPassword") {
      setPasswordMatch(value === passwordData.newPassword && value !== "");
    } else if (name === "newPassword") {
      setPasswordMatch(value === passwordData.confirmPassword && value !== "");
    }
  };

  const handleSavePassword = async () => {
    // Verificar se todos os campos estão preenchidos
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Preencha todos os campos de senha.");
      return;
    }

    // Verificar se a senha atual está correta
    if (passwordData.currentPassword !== currentPasswordFromServer) {
      setPasswordError("Senha atual incorreta!");
      return;
    }

    // Verificar se as senhas coincidem
    if (!passwordMatch) {
      setPasswordError("As senhas não coincidem!");
      return;
    }

    try {
      // Atualizar senha no back-end
      await updateUserData({ password: passwordData.newPassword });
      setSuccessMessage("Senha alterada com sucesso!");
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setPasswordError(error.message || "Erro ao alterar senha");
    }
  };

  // --- Modal Email ---
  const handleOpenEmailModal = () => {
    setIsEmailModalOpen(true);
    setEmailMessage("");
    setTempEmail(currentUser?.email || "");
  };

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
    setTempEmail("");
  };

  const handleSaveEmail = async () => {
    if (tempEmail && /\S+@\S+\.\S+/.test(tempEmail)) {
      try {
        await updateUserData({ email: tempEmail });
        setEmailMessage("Email atualizado com sucesso!");
        setTimeout(() => {
          setIsEmailModalOpen(false);
          setTempEmail("");
        }, 1500);
      } catch (error) {
        console.error("Erro ao salvar email:", error);
        setEmailMessage(error.message || "Erro ao salvar email");
      }
    }
  };

  // --- Modal Erro ---
  const handleCloseErrorModal = () => setIsErrorModalOpen(false);

  // Handle System Notification Switch
  const handleNotifySystemToggle = async () => {
    if (!userSettings) {
      setSuccessMessage("Configurações não carregadas");
      return;
    }
    
    try {
      const newNotifySystem = !userSettings.settings?.notifySystem;
      await updateUserSettings({ 
        notifySystem: newNotifySystem 
      });
    } catch (error) {
      console.error("Erro ao atualizar notificações do sistema:", error);
      setSuccessMessage(error.message || "Erro ao atualizar notificações");
    }
  };

  // Handle Email Notification Switch
  const handleNotifyEmailToggle = async () => {
    if (!userSettings) {
      setSuccessMessage("Configurações não carregadas");
      return;
    }
    
    if (!currentUser?.email) {
      setIsErrorModalOpen(true);
    } else {
      try {
        const newNotifyEmail = !userSettings.settings?.notifyEmail;
        await updateUserSettings({ 
          notifyEmail: newNotifyEmail 
        });
      } catch (error) {
        console.error("Erro ao atualizar notificações de email:", error);
        setSuccessMessage(error.message || "Erro ao atualizar notificações");
      }
    }
  };

  // Adicione uma verificação para evitar erros se currentUser ainda não carregou
  if (!currentUser) {
    return (
      <div className={styles.container}>
        <Menu />
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Carregando configurações...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Menu />

      <h1 className={styles.title}>Configurações</h1>

      <div className={styles.infoBox}>
        <p>
          <strong>Usuário:</strong> {currentUser.username}
        </p>
        <p>
          <strong>Senha:</strong> {"*".repeat(8)}
        </p>
        <p>
          <strong>Categoria:</strong> {formatRole(currentUser.role)}
        </p>
        {currentUser?.email && (
          <p>
            <strong>Email:</strong> {currentUser.email}
          </p>
        )}
        <div className={styles.buttonsRow}>
          <button className={styles.editBtn} onClick={handleOpenModal}>
            Editar Senha
          </button>
          <button className={styles.editBtn} onClick={handleOpenEmailModal}>
            {currentUser?.email ? "Editar Email" : "Adicionar Email"}
          </button>
        </div>

        {successMessage && (
          <p className={successMessage.includes("Erro") ? styles.errorMessage : styles.successMessage}>
            {successMessage}
          </p>
        )}
        {emailMessage && (
          <p className={emailMessage.includes("Erro") ? styles.errorMessage : styles.successMessage}>
            {emailMessage}
          </p>
        )}
      </div>

      <div className={styles.switchContainer}>
        <label className={styles.switchLabel}>
          Notificações do Sistema
          <div
            className={`${styles.switch} ${userSettings?.settings?.notifySystem ? styles.on : styles.off}`}
            onClick={handleNotifySystemToggle}
          >
            <div className={styles.slider}></div>
          </div>
        </label>

        <label className={styles.switchLabel}>
          Notificações de Alunos por Email
          <div
            className={`${styles.switch} ${userSettings?.settings?.notifyEmail ? styles.on : styles.off}`}
            onClick={handleNotifyEmailToggle}
          >
            <div className={styles.slider}></div>
          </div>
        </label>
      </div>

      {/* Modal Editar Senha */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={handleCloseModal}>
              <X size={20} />
            </button>
            <h2>Alterar Senha</h2>
            
            <input
              type="password"
              name="currentPassword"
              placeholder="Senha atual"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className={styles.input}
            />
            
            <input
              type="password"
              name="newPassword"
              placeholder="Nova senha"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className={styles.input}
            />
            
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar nova senha"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className={styles.input}
            />

            {/* Mensagens de erro e validação */}
            {passwordError && (
              <p className={styles.notMatch}>{passwordError}</p>
            )}

            {passwordMatch === true && passwordData.newPassword && !passwordError && (
              <p className={styles.match}>✔ Senhas coincidem</p>
            )}
            
            {passwordMatch === false && passwordData.newPassword && !passwordError && (
              <p className={styles.notMatch}>✘ Senhas não coincidem</p>
            )}

            <button
              className={styles.saveBtn}
              onClick={handleSavePassword}
              disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || !passwordMatch}
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Modal Adicionar/Editar Email */}
      {isEmailModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={handleCloseEmailModal}>
              <X size={20} />
            </button>
            <h2>{currentUser?.email ? "Editar Email" : "Adicionar Email"}</h2>
            <input
              type="email"
              placeholder="Digite seu email"
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
              className={styles.input}
            />
            
            {emailMessage && (
              <p className={emailMessage.includes("Erro") ? styles.notMatch : styles.match}>
                {emailMessage}
              </p>
            )}
            
            <button
              className={styles.saveBtn}
              onClick={handleSaveEmail}
              disabled={!tempEmail || !/\S+@\S+\.\S+/.test(tempEmail)}
            >
              {currentUser?.email ? "Atualizar" : "Adicionar"}
            </button>
          </div>
        </div>
      )}

      {/* Modal Erro Email */}
      {isErrorModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={handleCloseErrorModal}>
              <X size={20} />
            </button>
            <h2>Erro</h2>
            <p>Erro, não há email cadastrado na sua conta.</p>
            <button className={styles.saveBtn} onClick={handleCloseErrorModal}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;