import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPermissions = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem('user');
      
      if (!savedUser) {
        setPermissions({});
        setLoading(false);
        return;
      }

      const user = JSON.parse(savedUser);

      // Buscar permissões do cargo
      let rolePermissions = {};
      const rolePermsResponse = await api.get(`/permissions/role-permissions?role=${user.role}`);
      if (rolePermsResponse.data && rolePermsResponse.data.length > 0) {
        rolePermissions = rolePermsResponse.data[0].permissions;
      }

      // Buscar permissões específicas do usuário
      let userSpecificPermissions = {};
      try {
        const userPermsResponse = await api.get(`/permissions/user-specific-permissions?userId=${user.id}`);
        if (userPermsResponse.data && userPermsResponse.data.length > 0) {
          userSpecificPermissions = userPermsResponse.data[0].permissions;
        }
      } catch (err) {
        // Permissões específicas são opcionais
      }

      // Combinar permissões (usuário sobrepõe cargo)
      const finalPermissions = { ...rolePermissions };
      Object.keys(userSpecificPermissions).forEach(perm => {
        if (userSpecificPermissions[perm] !== undefined && userSpecificPermissions[perm] !== null) {
          finalPermissions[perm] = userSpecificPermissions[perm];
        }
      });

      setPermissions(finalPermissions);
      setError(null);
      setLoading(false);
      
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const hasPermission = useCallback((permission) => {
    return permissions[permission] === true;
  }, [permissions]);

  return { permissions, loading, error, hasPermission };
};