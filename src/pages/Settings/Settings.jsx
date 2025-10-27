import React, { useState } from "react";
import styles from "./Settings.module.css";
import { X } from "lucide-react";
import Menu from "../../components/Menu/Menu";

// Initialize states from localStorage synchronously
const getInitialEmail = () => localStorage.getItem("userEmail") || "";
const getInitialNotifySystem = () => localStorage.getItem("notifySystem") === "true";
const getInitialNotifyEmail = () => localStorage.getItem("notifyEmail") === "true";
const getInitialPasswordLength = () => parseInt(localStorage.getItem("passwordLength"), 10) || 5;

const Settings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [newEmail, setNewEmail] = useState(getInitialEmail());
  const [tempEmail, setTempEmail] = useState(""); // Temporary state for email input
  const [notifySystem, setNotifySystem] = useState(getInitialNotifySystem());
  const [notifyEmail, setNotifyEmail] = useState(getInitialNotifyEmail());
  const [passwordLength, setPasswordLength] = useState(getInitialPasswordLength());

  // --- Modal Senha ---
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSuccessMessage("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMatch(null);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleConfirmPassword = (value) => {
    setConfirmPassword(value);
    setPasswordMatch(newPassword === value && value !== "");
  };

  const handleSavePassword = () => {
    if (passwordMatch && oldPassword && newPassword) {
      setSuccessMessage("Senha alterada com sucesso!");
      setPasswordLength((prev) => {
        const newLength = prev + 1;
        localStorage.setItem("passwordLength", newLength);
        return newLength;
      });
      setIsModalOpen(false);
    }
  };

  // --- Modal Email ---
  const handleOpenEmailModal = () => {
    setIsEmailModalOpen(true);
    setEmailMessage("");
    setTempEmail(newEmail); // Initialize with current email
  };

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
    setTempEmail(""); // Reset tempEmail on close
  };

  const handleSaveEmail = () => {
    if (tempEmail && /\S+@\S+\.\S+/.test(tempEmail)) {
      setNewEmail(tempEmail); // Update newEmail only on save
      localStorage.setItem("userEmail", tempEmail);
      setEmailMessage("Email adicionado com sucesso!");
      setIsEmailModalOpen(false);
      setTempEmail(""); // Reset tempEmail after save
    }
  };

  // --- Modal Erro ---
  const handleCloseErrorModal = () => setIsErrorModalOpen(false);

  // Handle System Notification Switch
  const handleNotifySystemToggle = () => {
    setNotifySystem((prev) => {
      const newValue = !prev;
      localStorage.setItem("notifySystem", newValue);
      return newValue;
    });
  };

  // Handle Email Notification Switch
  const handleNotifyEmailToggle = () => {
    if (!newEmail) {
      setIsErrorModalOpen(true);
    } else {
      setNotifyEmail((prev) => {
        const newValue = !prev;
        localStorage.setItem("notifyEmail", newValue);
        return newValue;
      });
    }
  };

  return (
    <div className={styles.container}>
      <Menu />

      <h1 className={styles.title}>Configurações</h1>

      <div className={styles.infoBox}>
        <p>
          <strong>Usuário:</strong> Rodrigo
        </p>
        <p>
          <strong>Senha:</strong> {"*".repeat(passwordLength)}
        </p>
        {newEmail && (
          <p>
            <strong>Email:</strong> {newEmail}
          </p>
        )}
        <div className={styles.buttonsRow}>
          <button className={styles.editBtn} onClick={handleOpenModal}>
            Editar Senha
          </button>
          <button className={styles.editBtn} onClick={handleOpenEmailModal}>
            Adicionar Email
          </button>
        </div>

        {successMessage && (
          <p className={styles.successMessage}>{successMessage}</p>
        )}
        {emailMessage && (
          <p className={styles.successMessage}>{emailMessage}</p>
        )}
      </div>

      <div className={styles.switchContainer}>
        <label className={styles.switchLabel}>
          Notificações do Sistema
          <div
            className={`${styles.switch} ${notifySystem ? styles.on : styles.off}`}
            onClick={handleNotifySystemToggle}
          >
            <div className={styles.slider}></div>
          </div>
        </label>

        <label className={styles.switchLabel}>
          Notificações de Alunos por Email
          <div
            className={`${styles.switch} ${notifyEmail ? styles.on : styles.off}`}
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
              placeholder="Senha antiga"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => handleConfirmPassword(e.target.value)}
            />

            {passwordMatch === true && (
              <p className={styles.match}>✔ Senhas coincidem</p>
            )}
            {passwordMatch === false && (
              <p className={styles.notMatch}>✘ Senhas não coincidem</p>
            )}

            <button
              className={styles.saveBtn}
              onClick={handleSavePassword}
              disabled={!passwordMatch || !oldPassword || !newPassword}
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Modal Adicionar Email */}
      {isEmailModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={handleCloseEmailModal}>
              <X size={20} />
            </button>
            <h2>Adicionar Email</h2>
            <input
              type="email"
              placeholder="Digite seu email"
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
            />
            <button
              className={styles.saveBtn}
              onClick={handleSaveEmail}
              disabled={!tempEmail || !/\S+@\S+\.\S+/.test(tempEmail)}
            >
              Adicionar
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