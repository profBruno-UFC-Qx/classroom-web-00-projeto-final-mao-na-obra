'use strict';

/**
 * Controlador para operações administrativas
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
  async getUsers(ctx) {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      return ctx.unauthorized();
    }

    // Verificar se é admin
    try {
      const userDb = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        { populate: ['perfil'] }
      );

      if (userDb?.perfil?.tipoUsuario !== 'admin') {
        return ctx.forbidden();
      }

      // Listar usuários
      const users = await strapi.service('api::admin.admin').listUsers();
      return ctx.send({ data: users });
    } catch (err) {
      console.error('Erro ao listar usuários:', err);
      ctx.status = 500;
      ctx.body = {
        error: { status: 500, message: 'Erro ao listar usuários.' },
      };
    }
  },

  async deleteUser(ctx) {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      return ctx.unauthorized();
    }

    // Verificar se é admin
    try {
      const adminUser = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        { populate: ['perfil'] }
      );

      if (adminUser?.perfil?.tipoUsuario !== 'admin') {
        return ctx.forbidden();
      }

      const { documentId } = ctx.params;

      if (!documentId) {
        ctx.status = 400;
        ctx.body = { error: { status: 400, message: 'documentId não fornecido.' } };
        return;
      }

      // Buscar usuário por documentId
      const userToDelete = await strapi.query('plugin::users-permissions.user').findOne({
        where: { documentId },
      });

      if (!userToDelete) {
        ctx.status = 404;
        ctx.body = { error: { status: 404, message: 'Usuário não encontrado.' } };
        return;
      }

      // Chamar service para deletar
      const result = await strapi.service('api::admin.admin').deleteUser(userToDelete.id, adminUser);

      return ctx.send(result);
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);

      if (err.message.includes('não pode excluir sua própria conta')) {
        ctx.status = 403;
        ctx.body = {
          error: { status: 403, message: err.message },
        };
        return;
      }

      if (err.message.includes('não pode excluir outro administrador')) {
        ctx.status = 403;
        ctx.body = {
          error: { status: 403, message: err.message },
        };
        return;
      }

      if (err.message.includes('não encontrado')) {
        ctx.status = 404;
        ctx.body = {
          error: { status: 404, message: err.message },
        };
        return;
      }

      ctx.status = 500;
      ctx.body = {
        error: { status: 500, message: err.message || 'Erro ao excluir usuário.' },
      };
    }
  },
};
