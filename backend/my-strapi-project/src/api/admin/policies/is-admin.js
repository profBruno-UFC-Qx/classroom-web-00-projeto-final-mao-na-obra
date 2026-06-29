'use strict';

/**
 * Policy para verificar se o usuário autenticado é um admin
 */
module.exports = async (policyContext, config, { strapi }) => {
  const user = policyContext.state?.user;

  if (!user) {
    return false;
  }

  try {
    const userDb = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      user.id,
      { populate: ['perfil'] }
    );

    return userDb?.perfil?.tipoUsuario === 'admin';
  } catch (err) {
    console.error('Erro ao verificar se é admin:', err);
    return false;
  }
};
