import { useState, useEffect } from 'react';
import api from '../api';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        const savedUser = localStorage.getItem('user');
        
        if (!savedUser) {
          console.log('⚠️ Nenhum usuário logado');
          setPermissions({});
          setLoading(false);
          return;
        }

        const user = JSON.parse(savedUser);
        console.log('👤 Usuário logado:', user);

        // Buscar permissões do cargo
        let rolePermissions = {};
        try {
          const rolePermsResponse = await api.get(`/role-permissions?role=${user.role}`);
          if (rolePermsResponse.data && rolePermsResponse.data.length > 0) {
            rolePermissions = rolePermsResponse.data[0].permissions;
            console.log('📋 Permissões do cargo:', rolePermissions);
          } else {
            console.warn(`⚠️ Nenhuma permissão encontrada para o cargo: ${user.role}`);
          }
        } catch (err) {
          console.error('Erro ao buscar permissões do cargo:', err);
        }

        // Buscar permissões específicas do usuário
        let userSpecificPermissions = {};
        try {
          const userPermsResponse = await api.get(`/user-specific-permissions?userId=${user.id}`);
          if (userPermsResponse.data && userPermsResponse.data.length > 0) {
            userSpecificPermissions = userPermsResponse.data[0].permissions;
            console.log('🔧 Permissões específicas do usuário:', userSpecificPermissions);
          }
        } catch (err) {
          console.error('Erro ao buscar permissões específicas:', err);
        }

        // Combinar permissões (usuário sobrepõe cargo)
        const finalPermissions = { ...rolePermissions };
        
        // Aplicar permissões específicas do usuário (sobrescrevendo)
        Object.keys(userSpecificPermissions).forEach(perm => {
          if (userSpecificPermissions[perm] !== undefined && userSpecificPermissions[perm] !== null) {
            finalPermissions[perm] = userSpecificPermissions[perm];
          }
        });

        console.log('✅ Permissões finais:', finalPermissions);
        setPermissions(finalPermissions);
        
      } catch (err) {
        console.error('❌ Erro ao carregar permissões:', err);
        setError(err);
        setPermissions({});
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  const hasPermission = (permission) => {
    return permissions[permission] === true;
  };

  return { permissions, loading, error, hasPermission };
};