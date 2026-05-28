import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './FirstLoginModal.module.css';

const FirstLoginModal = ({ user, onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(user?.emailVerificado || false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    // Impedir navegação com F5 ou fechar a aba
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Verificar status do email periodicamente se o email foi enviado
  useEffect(() => {
    if (!emailSent || emailVerified) return;

    const checkEmailStatus = async () => {
      try {
        const response = await api.get('/auth/check-email-status');
        if (response.data.emailVerificado) {
          setEmailVerified(true);
          setError('');
        }
      } catch (err) {
        console.error('Erro ao verificar status do email:', err);
      }
    };

    // Verificar imediatamente e depois a cada 5 segundos
    checkEmailStatus();
    const interval = setInterval(checkEmailStatus, 5000);

    return () => clearInterval(interval);
  }, [emailSent, emailVerified]);

  useEffect(() => {
    // Verificar força da senha
    setPasswordStrength({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
    });
  }, [newPassword]);

  const validatePassword = () => {
    if (!passwordStrength.length) return 'A senha deve ter pelo menos 8 caracteres';
    if (!passwordStrength.uppercase) return 'A senha deve conter pelo menos uma letra maiúscula';
    if (!passwordStrength.lowercase) return 'A senha deve conter pelo menos uma letra minúscula';
    if (!passwordStrength.number) return 'A senha deve conter pelo menos um número';
    if (!passwordStrength.special) return 'A senha deve conter pelo menos um caractere especial';
    if (newPassword !== confirmPassword) return 'As senhas não coincidem';
    return null;
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      return 'Por favor, insira um email válido';
    }
    return null;
  };

  const handleSendVerificationEmail = async () => {
    const emailError = validateEmail();
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/send-verification-email', { email: newEmail });
      setEmailSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar email de verificação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    const emailError = validateEmail();
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/change-password-first-login', {
        newPassword,
        newEmail,
      });

      // Atualizar usuário no localStorage
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      onComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Impedir clique fora do modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      // Não faz nada - não permite fechar
      setError('Você deve completar esta etapa antes de continuar.');
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>🎉 Bem-vindo ao Sistema!</h2>
          <p className={styles.subtitle}>
            Para sua segurança, confirme seu email e registre uma senha sua.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Seção de Email */}
          <div className={styles.section}>
            <h3>📧 Confirme seu Email</h3>
            <div className={styles.inputGroup}>
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={styles.input}
                required
                disabled={loading || emailSent}
                placeholder="seu.email.aqui@exemple.com"
              />
              <small className={styles.hint}>
                Este email será usado para recuperação de senha
              </small>
            </div>

            {!emailSent ? (
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleSendVerificationEmail}
                disabled={loading || !newEmail}
              >
                {loading ? 'Enviando...' : 'Enviar Email de Verificação'}
              </button>
            ) : (
              <div className={styles.verificationStatus}>
                {!emailVerified ? (
                  <>
                    <div className={styles.spinner}></div>
                    <p className={styles.verificationText}>
                      📧 Email de verificação enviado!<br />
                      <strong>Verifique sua caixa de entrada e spam</strong>, depois clique no link do email para continuar.
                    </p>
                    <p className={styles.verificationSubtext}>
                      Esta tela será atualizada automaticamente quando o email for verificado.
                    </p>
                  </>
                ) : (
                  <div className={styles.verifiedSuccess}>
                    <div className={styles.successIcon}>✓</div>
                    <p><strong>Email verificado com sucesso!</strong></p>
                    <p>Agora você pode alterar sua senha.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Seção de Senha - desabilitada até email verificado */}
          <div className={`${styles.section} ${!emailVerified ? styles.disabledSection : ''}`}>
            <h3>🔒 Nova Senha</h3>
            <div className={styles.inputGroup}>
              <label htmlFor="newPassword">Nova Senha</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                required
                disabled={loading || !emailVerified}
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
                disabled={loading || !emailVerified}
              />
            </div>

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
                  {passwordStrength.special ? '✓' : '○'} Um caractere especial (!@#$% etc)
                </li>
              </ul>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !emailVerified}
          >
            {loading ? 'Salvando...' : 'Salvar e Continuar'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.warning}>
            ⚠️ Esta etapa é obrigatória. Você não pode usar o sistema até completar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirstLoginModal;
