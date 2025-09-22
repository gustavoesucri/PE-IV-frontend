import React, { useState } from "react";
import styles from "./Settings.module.css";
import { X } from "lucide-react";
import Menu from "../../components/Menu/Menu";

const Settings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [notifySystem, setNotifySystem] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);

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
      setIsModalOpen(false);
    }
  };

  // --- Modal Email ---
  const handleOpenEmailModal = () => {
    setIsEmailModalOpen(true);
    setEmailMessage("");
    setNewEmail("");
  };

  const handleCloseEmailModal = () => setIsEmailModalOpen(false);

  const handleSaveEmail = () => {
    if (newEmail && /\S+@\S+\.\S+/.test(newEmail)) {
      setEmailMessage("Email adicionado com sucesso!");
      setIsEmailModalOpen(false);
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
          <strong>Senha:</strong> *****
        </p>
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
            className={`${styles.switch} ${notifySystem ? styles.on : styles.off
              }`}
            onClick={() => setNotifySystem(!notifySystem)}
          >
            <div className={styles.slider}></div>
          </div>
        </label>

        <label className={styles.switchLabel}>
          Notificações de Alunos por Email
          <div
            className={`${styles.switch} ${notifyEmail ? styles.on : styles.off
              }`}
            onClick={() => setNotifyEmail(!notifyEmail)}
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
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <button
              className={styles.saveBtn}
              onClick={handleSaveEmail}
              disabled={!newEmail || !/\S+@\S+\.\S+/.test(newEmail)}
            >
              Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
