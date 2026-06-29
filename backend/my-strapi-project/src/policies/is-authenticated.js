'use strict';

module.exports = async (policyContext, config, { strapi }) => {
  if (policyContext.state?.user) {
    return true;
  }

  return policyContext.unauthorized('Autenticação necessária.');
};
