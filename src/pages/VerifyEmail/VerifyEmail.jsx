import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import styles from './VerifyEmail.module.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Token de verificação inválido ou ausente.');
        setLoading(false);
        return;
      }

      try {
        await api.get(`/auth/verify-email?token=${token}`);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao verificar email. O token pode ter expirado.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.spinner}></div>
          <p className={styles.message}>Verificando seu email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>✗</div>
          <h2>Verificação Falhou</h2>
          <p className={styles.message}>{error}</p>
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
        <div className={styles.successIcon}>✓</div>
        <h2>Email Verificado!</h2>
        <p className={styles.message}>
          Seu email foi confirmado com sucesso.
        </p>

        <div className={styles.instructions}>
          <p>
            Você já pode fazer login no sistema com seu usuário e senha.
          </p>
        </div>

        <button
          className={styles.loginBtn}
          onClick={() => navigate('/')}
        >
          Ir para o Login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
