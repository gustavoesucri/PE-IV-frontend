import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import styles from './ResetPassword.module.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    if (!token) {
      setError('Token inválido ou ausente. Solicite uma nova recuperação de senha.');
    }
  }, [token]);

  useEffect(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao redefinir senha. O token pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>✗</div>
          <h2>Link Inválido</h2>
          <p className={styles.message}>
            O link de recuperação é inválido ou expirou.
          </p>
          <button
            className={styles.backBtn}
            onClick={() => navigate('/')}
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✓</div>
          <h2>Senha Redefinida!</h2>
          <p className={styles.message}>
            Sua senha foi alterada com sucesso.
          </p>
          <p className={styles.subMessage}>
            Você já pode fazer login com sua nova senha.
          </p>
          <button
            className={styles.loginBtn}
            onClick={() => navigate('/')}
          >
            Ir para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>🔐 Redefinir Senha</h2>
          <p className={styles.subtitle}>
            Crie uma nova senha segura para sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword">Nova Senha</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
              required
              disabled={loading}
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
              disabled={loading}
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
                {passwordStrength.special ? '✓' : '○'} Um caractere especial
              </li>
            </ul>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Redefinir Senha'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.note}>
            O link de recuperação expira em 1 hora.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
