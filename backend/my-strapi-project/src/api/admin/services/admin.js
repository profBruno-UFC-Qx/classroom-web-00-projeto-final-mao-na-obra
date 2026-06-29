'use strict';

/**
 * Serviço para operações administrativas de usuários
 */

async function getAuthenticatedUser(ctx) {
  const stateUser = ctx.state?.user;
  if (stateUser?.id) {
    return stateUser;
  }

  const authorization = ctx.request?.header?.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.replace('Bearer ', '').trim();
  if (!token) {
    return null;
  }

  try {
    const decoded = await strapi.plugins['users-permissions'].services.jwt.verify(token);
    return decoded ? { id: decoded.id } : null;
  } catch (err) {
    return null;
  }
}

module.exports = {
  async listUsers() {
    try {
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        populate: ['perfil'],
      });

      return users.map((user) => ({
        documentId: user.documentId,
        id: user.id,
        email: user.email,
        username: user.username,
        nomeCompleto: user.perfil?.nomeCompleto || 'Sem nome',
        telefone: user.perfil?.telefone || 'Não informado',
        endereco: user.perfil?.endereco || 'Não informado',
        tipoUsuario: user.perfil?.tipoUsuario || 'cliente',
      }));
    } catch (err) {
      console.error('Erro ao listar usuários:', err);
      throw new Error('Não foi possível listar usuários.');
    }
  },

  async deleteUser(userIdToDelete, adminUser) {
    try {
      // Buscar usuário a ser deletado
      const userToDelete = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        userIdToDelete,
        { populate: ['perfil'] }
      );

      if (!userToDelete) {
        throw new Error('Usuário não encontrado.');
      }

      // Verificar se está tentando deletar a si mesmo
      if (adminUser.id === userToDelete.id) {
        throw new Error('Você não pode excluir sua própria conta.');
      }

      // Verificar se está tentando deletar outro admin
      if (userToDelete.perfil?.tipoUsuario === 'admin') {
        throw new Error('Você não pode excluir outro administrador.');
      }

      const perfilId = userToDelete.perfil?.id;

      // Se tiver perfil, executar exclusão em cascata
      if (perfilId) {
        // 1. Excluir todos os Serviços do Perfil
        const servicos = await strapi.entityService.findMany('api::servico.servico', {
          filters: { prestador: perfilId },
        });

        for (const servico of servicos) {
          await strapi.entityService.delete('api::servico.servico', servico.id);
        }

        // 2. Excluir todas as Solicitações onde é cliente
        const solicitacoesCliente = await strapi.entityService.findMany(
          'api::solicitacao.solicitacao',
          { filters: { cliente: perfilId } }
        );

        for (const solicitacao of solicitacoesCliente) {
          await strapi.entityService.delete('api::solicitacao.solicitacao', solicitacao.id);
        }

        // 3. Excluir todas as Solicitações onde é prestador
        const solicitacoesPrestador = await strapi.entityService.findMany(
          'api::solicitacao.solicitacao',
          { filters: { prestador: perfilId } }
        );

        for (const solicitacao of solicitacoesPrestador) {
          await strapi.entityService.delete('api::solicitacao.solicitacao', solicitacao.id);
        }

        // 4. Excluir o Perfil
        await strapi.entityService.delete('api::perfil.perfil', perfilId);
      }

      // 5. Excluir o User
      await strapi.entityService.delete('plugin::users-permissions.user', userToDelete.id);

      return { ok: true, message: 'Usuário excluído com sucesso.' };
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      throw err;
    }
  },
};
