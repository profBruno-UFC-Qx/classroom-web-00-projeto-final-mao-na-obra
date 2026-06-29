'use strict';

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
  async delete(ctx) {
    const user = await getAuthenticatedUser(ctx);

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
  async createProfile(ctx) {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      return ctx.unauthorized();
    }

    const {
      nomeCompleto,
      telefone,
      endereco,
      descricao,
      tipoUsuario,
      categoria,
      preco,
    } = ctx.request.body || {};

    try {
      const existingUser = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        { populate: ['perfil'] },
      );

      if (existingUser?.perfil?.id) {
        const existingPerfil = await strapi.entityService.findOne(
          'api::perfil.perfil',
          existingUser.perfil.id,
          { populate: '*' },
        );
        return ctx.send(this.transformResponse ? this.transformResponse(existingPerfil) : existingPerfil);
      }

      // Garante que descrição é um bloco válido do Strapi
      let descricaoBloco = descricao;
      if (typeof descricao === 'string') {
        descricaoBloco = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: descricao }],
            },
          ],
        };
      }

      const perfil = await strapi.entityService.create('api::perfil.perfil', {
        data: { nomeCompleto, telefone, endereco, descricao: descricaoBloco, tipoUsuario },
      });

      if (tipoUsuario === 'prestador' && categoria) {
        const categoriaId = Number(categoria);
        const precoNumero = Number(preco);

        const categoriaEntity = await strapi.entityService.findOne(
          'api::categoria-servico.categoria-servico',
          categoriaId,
          { fields: ['nome'] },
        );

        await strapi.entityService.create('api::servico.servico', {
          data: {
            titulo: `Serviço de ${categoriaEntity?.nome || categoriaId}`,
            categoria: categoriaId,
            preco: Number.isFinite(precoNumero) ? precoNumero : null,
            descricao: descricao || {
              type: 'doc',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
            },
            ativo: true,
            prestador: perfil.id,
          },
        });
      }

      await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: { perfil: perfil.id },
      });

      const createdPerfil = await strapi.entityService.findOne('api::perfil.perfil', perfil.id, { populate: '*' });

      return ctx.send(createdPerfil);
    } catch (err) {
      console.error('createProfile error:', err);
      ctx.status = 500;
      ctx.body = { data: null, error: { status: 500, message: 'Não foi possível criar o perfil.' } };
    }
  },
};
