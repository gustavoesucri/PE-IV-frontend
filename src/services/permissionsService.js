import api from '../api';

class PermissionsService {
  async getUserPermissions(userId, role) {
    try {
      console.log('🔍 Buscando permissões para:', { userId, role });
      
      // Buscar permissões do cargo - NOTA: Adicionei o prefixo 'permissions/'
      let rolePermissions = {};
      try {
        const response = await api.get(`/permissions/role-permissions?role=${role}`);
        console.log('📋 Resposta role-permissions:', response.data);
        
        if (response.data && response.data.length > 0) {
          rolePermissions = response.data[0].permissions;
        } else {
          console.warn(`⚠️ Nenhuma permissão encontrada para role: ${role}`);
          rolePermissions = this.getDefaultPermissionsByRole(role);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar permissões do cargo:', error);
        rolePermissions = this.getDefaultPermissionsByRole(role);
      }

      // Buscar permissões específicas do usuário - NOTA: Adicionei o prefixo 'permissions/'
      let userSpecificPermissions = {};
      try {
        const response = await api.get(`/permissions/user-specific-permissions?userId=${userId}`);
        console.log('🔧 Resposta user-specific-permissions:', response.data);
        
        if (response.data && response.data.length > 0) {
          userSpecificPermissions = response.data[0].permissions;
        }
      } catch (error) {
        console.error('❌ Erro ao buscar permissões específicas:', error);
      }

      // Combinar permissões
      const finalPermissions = { ...rolePermissions, ...userSpecificPermissions };
      console.log('✅ Permissões finais:', finalPermissions);
      
      return finalPermissions;
    } catch (error) {
      console.error('❌ Erro fatal ao buscar permissões:', error);
      return this.getDefaultPermissionsByRole(role);
    }
  }

  getDefaultPermissionsByRole(role) {
    const defaults = {
      diretor: {
        view_students: true,
        create_students: true,
        edit_students: true,
        delete_students: true,
        view_companies: true,
        create_companies: true,
        view_assessments: true,
        create_assessments: true,
        view_users: true,
        manage_users: true,
      },
      professor: {
        view_students: true,
        create_students: true,
        edit_students: true,
        delete_students: false,
        view_companies: true,
        create_companies: false,
        view_assessments: true,
        create_assessments: true,
        view_users: false,
        manage_users: false,
      },
      psicologo: {
        view_students: true,
        create_students: false,
        edit_students: true,
        delete_students: false,
        view_companies: false,
        create_companies: false,
        view_assessments: true,
        create_assessments: true,
        view_users: false,
        manage_users: false,
      },
      'cadastrador de empresas': {
        view_students: false,
        create_students: false,
        edit_students: false,
        delete_students: false,
        view_companies: true,
        create_companies: true,
        view_assessments: false,
        create_assessments: false,
        view_users: false,
        manage_users: false,
      },
    };
    
    return defaults[role] || defaults.professor;
  }
}

const permissionsServiceInstance = new PermissionsService();
export default permissionsServiceInstance;