'use strict';

/**
 * perfil router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::perfil.perfil', ({ strapi }) => ({
	additionalRoutes: [
		{
			method: 'POST',
			path: '/with-user',
			handler: 'perfil.createWithUser',
			config: {
				prefix: '',
			},
		},
		{
			method: 'DELETE',
			path: '/delete-account',
			handler: 'perfil.deleteAccount',
			config: {
				prefix: '',
			},
		},
		{
			method: 'POST',
			path: '/delete-account',
			handler: 'perfil.deleteAccount',
			config: {
				prefix: '',
			},
		},
	],
}));
