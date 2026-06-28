'use strict';

module.exports = {
  async delete(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized();
    }

    try {
      // populate perfil
      const existingUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, { populate: ['perfil'] });

      if (existingUser?.perfil?.id) {
        await strapi.entityService.delete('api::perfil.perfil', existingUser.perfil.id);
      }

      await strapi.entityService.delete('plugin::users-permissions.user', user.id);

      ctx.send({ ok: true, message: 'Conta excluída com sucesso.' });
    } catch (err) {
      // Log detailed error for debugging
      console.error('Account delete error:', err);
      // Return error message to client for easier troubleshooting in dev
      ctx.status = 500;
      ctx.body = { data: null, error: { status: 500, name: err.name || 'Error', message: String(err.message || err) } };
    }
  },
};
