'use strict';

/**
 * perfil controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::perfil.perfil', ({ strapi }) => ({
	async createWithUser(ctx) {
		const user = ctx.state.user;

		if (!user) {
			return ctx.unauthorized();
		}

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
			return this.transformResponse(existingPerfil);
		}

		const {
			nomeCompleto,
			telefone,
			endereco,
			descricao,
			tipoUsuario,
		} = ctx.request.body;

		const perfil = await strapi.entityService.create('api::perfil.perfil', {
			data: {
				nomeCompleto,
				telefone,
				endereco,
				descricao,
				tipoUsuario,
			},
		});

		await strapi.entityService.update('plugin::users-permissions.user', user.id, {
			data: {
				perfil: perfil.id,
			},
		});

		const createdPerfil = await strapi.entityService.findOne('api::perfil.perfil', perfil.id, {
			populate: '*',
		});

		return this.transformResponse(createdPerfil);
	},
	async deleteAccount(ctx) {
		const user = ctx.state.user;

		if (!user) {
			return ctx.unauthorized();
		}

		// Find user's profile if exists
		const existingUser = await strapi.entityService.findOne(
			'plugin::users-permissions.user',
			user.id,
			{ populate: ['perfil'] },
		);

		try {
			// Delete perfil first if exists
			if (existingUser?.perfil?.id) {
				await strapi.entityService.delete('api::perfil.perfil', existingUser.perfil.id);
			}

			// Delete the user
			await strapi.entityService.delete('plugin::users-permissions.user', user.id);

			ctx.send({ ok: true, message: 'Conta excluída com sucesso.' });
		} catch (err) {
			ctx.throw(500, 'Não foi possível excluir a conta.');
		}
	},
}));
