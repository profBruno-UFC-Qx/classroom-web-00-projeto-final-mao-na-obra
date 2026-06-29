'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/account/delete',
      handler: 'account.delete',
      config: {
        prefix: '',
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/account/create-profile',
      handler: 'account.createProfile',
      config: {
        prefix: '',
        auth: false,
      },
    },
  ],
};
