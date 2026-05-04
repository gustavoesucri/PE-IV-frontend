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
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
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
  const [usernameMessage, setUsernameMessage] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

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
          // Carregar configurações do usuário do back-end
          const response = await api.get(`/user-settings?userId=${user.id}`);
          if (response.data && response.data.length > 0) {
            setUserSettings(response.data[0]);
          } else {
            // No settings found, keep userSettings null but still mark loaded
            console.warn("Configurações não encontradas");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        setSuccessMessage("Erro ao carregar configurações do servidor");
      } finally {
        setSettingsLoaded(true);
      }
    };

    loadUserData();
  }, []);

  // Desestruturar fora do useEffect para evitar warning de dependência
  const { newPassword } = passwordData;

  // Monitorar força da senha
  useEffect(() => {
    setPasswordStrength({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
    });
  }, [newPassword]);

  // Validar senha antes de salvar
  const validatePasswordStrength = () => {
    if (!passwordStrength.length) return 'A senha deve ter pelo menos 8 caracteres';
    if (!passwordStrength.uppercase) return 'A senha deve conter pelo menos uma letra maiúscula';
    if (!passwordStrength.lowercase) return 'A senha deve conter pelo menos uma letra minúscula';
    if (!passwordStrength.number) return 'A senha deve conter pelo menos um número';
    if (!passwordStrength.special) return 'A senha deve conter pelo menos um caractere especial';
    return null;
  };

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

      const response = await api.patch(`/user-settings/${userSettings.id}`, updatedSettings);
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
      const response = await api.patch(`/users/${currentUser.id}`, userData);
      
      // Atualizar também no localStorage (sem a senha por segurança)
      const userDataForStorage = { ...userData };
      delete userDataForStorage.password; // Não salvar senha no localStorage
      
      const updatedUser = { ...currentUser, ...userDataForStorage };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Não armazenamos senha no frontend por segurança
      
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

    // Validar força da senha
    const strengthError = validatePasswordStrength();
    if (strengthError) {
      setPasswordError(strengthError);
      return;
    }

    // Verificar se a senha atual está correta (verificar no backend)
    try {
      await api.post(`/users/${currentUser.id}/verify-password`, { password: passwordData.currentPassword });
    } catch (err) {
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
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const handleOpenEmailModal = () => {
    setIsEmailModalOpen(true);
    setEmailMessage("");
    setTempEmail(currentUser?.email || "");
    setEmailVerificationSent(false);
  };

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
    setTempEmail("");
    setEmailVerificationSent(false);
  };

  const handleSendEmailVerification = async () => {
    if (!tempEmail || !/\S+@\S+\.\S+/.test(tempEmail)) {
      setEmailMessage("Por favor, insira um email válido.");
      return;
    }

    try {
      await api.post('/auth/send-verification-email', { email: tempEmail });
      setEmailVerificationSent(true);
      setEmailMessage("Email de verificação enviado! Verifique sua caixa de entrada.");
    } catch (error) {
      console.error("Erro ao enviar verificação:", error);
      setEmailMessage(error.response?.data?.message || "Erro ao enviar email de verificação");
    }
  };

  const handleSaveEmail = async () => {
    if (tempEmail && /\S+@\S+\.\S+/.test(tempEmail)) {
      try {
        await updateUserData({ email: tempEmail });
        setEmailMessage("Email atualizado com sucesso!");
        setTimeout(() => {
          setIsEmailModalOpen(false);
          setTempEmail("");
          setEmailVerificationSent(false);
              }, 1500);
      } catch (error) {
        console.error("Erro ao salvar email:", error);
        setEmailMessage(error.message || "Erro ao salvar email");
      }
    }
  };

  // --- Modal Username ---
  const handleOpenUsernameModal = () => {
    setIsUsernameModalOpen(true);
    setUsernameMessage("");
    setTempUsername(currentUser?.username || "");
  };

  const handleCloseUsernameModal = () => {
    setIsUsernameModalOpen(false);
    setTempUsername("");
  };

  const handleSaveUsername = async () => {
    const trimmedUsername = tempUsername.trim();

    if (!trimmedUsername) {
      setUsernameMessage("Nome de usuário é obrigatório.");
      return;
    }

    if (trimmedUsername === currentUser.username) {
      setUsernameMessage("Informe um nome de usuário diferente do atual.");
      return;
    }

    try {
      const response = await api.patch('/users/me/username', { username: trimmedUsername });
      const updatedUser = { ...currentUser, username: response.data.username };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUsernameMessage("Nome de usuário atualizado com sucesso!");
      setTimeout(() => {
        setIsUsernameModalOpen(false);
        setTempUsername("");
      }, 1500);
    } catch (error) {
      console.error("Erro ao salvar nome de usuário:", error);
      setUsernameMessage(error.response?.data?.message || error.message || "Erro ao salvar nome de usuário");
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
          <button className={styles.editBtn} onClick={handleOpenUsernameModal}>
            Editar Usuário
          </button>
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
        {usernameMessage && (
          <p className={usernameMessage.includes("Erro") ? styles.errorMessage : styles.successMessage}>
            {usernameMessage}
          </p>
        )}
      </div>

      {!settingsLoaded ? (
        <div className={styles.switchContainer}>
          <div style={{ padding: '1rem', color: '#666' }}>Carregando preferências...</div>
        </div>
      ) : (
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
      )}

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

            {/* Medidor de força de senha */}
            {passwordData.newPassword && (
              <div className={styles.strengthMeter}>
                <p className={styles.strengthTitle}>Requisitos da senha:</p>
                <ul className={styles.strengthList}>
                  <li className={passwordStrength.length ? styles.valid : styles.invalid}>
                    {passwordStrength.length ? '✓' : '○'} Pelo menos 8 caracteres
                  </li>
                  <li className={passwordStrength.uppercase ? styles.valid : styles.invalid}>
                    {passwordStrength.uppercase ? '✓' : '○'} Uma letra maiúscula
                  </li>
                  <li className={passwordStrength.lowercase ? styles.valid : styles.invalid}>
                    {passwordStrength.lowercase ? '✓' : '○'} Uma letra minúscula
                  </li>
                  <li className={passwordStrength.number ? styles.valid : styles.invalid}>
                    {passwordStrength.number ? '✓' : '○'} Um número
                  </li>
                  <li className={passwordStrength.special ? styles.valid : styles.invalid}>
                    {passwordStrength.special ? '✓' : '○'} Um caractere especial
                  </li>
                </ul>
              </div>
            )}

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
              disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || !passwordMatch || !passwordStrength.length || !passwordStrength.uppercase || !passwordStrength.lowercase || !passwordStrength.number || !passwordStrength.special}
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
              disabled={emailVerificationSent}
            />

            {!emailVerificationSent ? (
              <button
                className={styles.saveBtn}
                onClick={handleSendEmailVerification}
                disabled={!tempEmail || !/\S+@\S+\.\S+/.test(tempEmail)}
              >
                Enviar Email de Verificação
              </button>
            ) : (
              <>
                <p className={styles.match}>
                  ✔ Email de verificação enviado! Verifique sua caixa de entrada.
                </p>
                <p className={styles.hint}>
                  Após verificar seu email, clique em salvar para confirmar a alteração.
                </p>
                <button
                  className={styles.saveBtn}
                  onClick={handleSaveEmail}
                  disabled={!tempEmail || !/\S+@\S+\.\S+/.test(tempEmail)}
                >
                  Salvar Email
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {isUsernameModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={handleCloseUsernameModal}>
              <X size={20} />
            </button>
            <h2>Editar Usuário</h2>
            <input
              type="text"
              placeholder="Digite seu novo nome de usuário"
              value={tempUsername}
              onChange={(e) => {
                setTempUsername(e.target.value);
                if (usernameMessage) {
                  setUsernameMessage("");
                }
              }}
              className={styles.input}
            />

            {usernameMessage && (
              <p className={usernameMessage.includes("sucesso") ? styles.match : styles.notMatch}>
                {usernameMessage}
              </p>
            )}

            <button
              className={styles.saveBtn}
              onClick={handleSaveUsername}
              disabled={!tempUsername.trim() || tempUsername.trim() === currentUser.username}
            >
              Salvar Usuário
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