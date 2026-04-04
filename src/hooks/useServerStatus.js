import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';

const ServerStatusContext = createContext({ serverOffline: false });

export const useServerStatus = () => useContext(ServerStatusContext);

// Listeners globais — api.js notifica quando detecta erro de rede
let onServerDown = null;
let onServerUp = null;

export const notifyServerDown = () => { if (onServerDown) onServerDown(); };
export const notifyServerUp = () => { if (onServerUp) onServerUp(); };

export const ServerStatusProvider = ({ children }) => {
  const [serverOffline, setServerOffline] = useState(false);
  const retryRef = useRef(null);
  const isCheckingRef = useRef(false);
  const wasOfflineRef = useRef(false);

  const checkServer = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    try {
      // Faz uma requisição leve só pra testar conexão (sem auth)
      await api.get('/', { timeout: 5000, _skipOfflineNotify: true });
      if (retryRef.current) {
        clearInterval(retryRef.current);
        retryRef.current = null;
      }
      // Servidor voltou — recarrega a página para atualizar dados
      if (wasOfflineRef.current) {
        window.location.reload();
      }
    } catch (err) {
      // Ainda offline
      setServerOffline(true);
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  useEffect(() => {
    onServerDown = () => {
      wasOfflineRef.current = true;
      setServerOffline(true);
      // Iniciar retry a cada 15s se não estiver ativo
      if (!retryRef.current) {
        retryRef.current = setInterval(checkServer, 15000);
      }
    };

    onServerUp = () => {
      if (retryRef.current) {
        clearInterval(retryRef.current);
        retryRef.current = null;
      }
      // Servidor voltou após queda — recarrega para atualizar dados
      if (wasOfflineRef.current) {
        window.location.reload();
      }
    };

    return () => {
      onServerDown = null;
      onServerUp = null;
      if (retryRef.current) {
        clearInterval(retryRef.current);
        retryRef.current = null;
      }
    };
  }, [checkServer]);

  return (
    <ServerStatusContext.Provider value={{ serverOffline }}>
      {children}
      {serverOffline && <ServerOfflineOverlay />}
    </ServerStatusContext.Provider>
  );
};

const ServerOfflineOverlay = () => (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 99999, backdropFilter: 'blur(4px)',
  }}>
    <div style={{
      background: '#fff', borderRadius: 12, padding: '2.5rem 3rem',
      textAlign: 'center', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
      <h2 style={{ color: '#d32f2f', margin: '0 0 0.75rem', fontSize: '1.4rem' }}>
        Servidor fora do ar
      </h2>
      <p style={{ color: '#555', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
        Não foi possível conectar ao servidor.<br />
        Tentando reconectar automaticamente a cada 15 segundos...
      </p>
      <div style={{ display: 'inline-block' }}>
        <div style={{
          width: 32, height: 32, border: '4px solid #eee',
          borderTop: '4px solid #d32f2f', borderRadius: '50%',
          animation: 'serverSpinner 1s linear infinite',
        }} />
      </div>
      <style>{`@keyframes serverSpinner { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);
