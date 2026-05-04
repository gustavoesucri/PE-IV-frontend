import React, { useState } from 'react';
import api from '../api';
import styles from './ForgotPasswordModal.module.css';

const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'Se o email existir, um link de recuperação foi enviado.');
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao solicitar recuperação de senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          disabled={loading}
          aria-label="Fechar"
        >
          ×
        </button>

        {!sent ? (
          <>
            <div className={styles.header}>
              <h2>🔐 Recuperação de Senha</h2>
              <p className={styles.subtitle}>
                Informe seu email cadastrado para receber um link de recuperação
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                  disabled={loading}
                  placeholder="seu@email.com"
                  autoFocus
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !email}
              >
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </button>
            </form>

            <div className={styles.footer}>
              <p className={styles.note}>
                O link de recuperação expira em 1 hora.
              </p>
            </div>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h3>Solicitação Enviada!</h3>
            <p>{message}</p>
            <p className={styles.instructions}>
              Verifique sua caixa de entrada e spam. Se o email estiver cadastrado no sistema,
              você receberá as instruções para redefinir sua senha.
            </p>
            <button
              className={styles.backBtn}
              onClick={onClose}
            >
              Voltar ao Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
