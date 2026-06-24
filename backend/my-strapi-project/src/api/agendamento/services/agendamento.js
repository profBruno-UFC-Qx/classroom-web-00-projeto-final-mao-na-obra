'use strict';

/**
 * agendamento service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::agendamento.agendamento');
