import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './EmailVerificationBanner.module.css';

const EmailVerificationBanner = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!user || user.emailVerificado) {
      setShowBanner(false);
      return;
    }

    const checkEmailStatus = async () => {
      try {
        const response = await api.get('/auth/check-email-status');
        if (response.data.emailVerificado) {
          // Atualizar usuário no localStorage
          const updatedUser = { ...user, emailVerificado: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setShowBanner(false);
        } else {
          setShowBanner(true);
        }
      } catch (err) {
        console.error('Erro ao verificar status do email:', err);
      }
    };

    checkEmailStatus();

    // Verificar periodicamente
    const interval = setInterval(checkEmailStatus, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, [user]);

  if (!showBanner) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.icon}>⚠️</span>
        <span className={styles.text}>
          <strong>Email não verificado:</strong> Por favor, verifique seu email na caixa de entrada do mesmo assim que possível.
        </span>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
