'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/account/delete',
      handler: 'account.delete',
      config: {
        prefix: '',
      },
    },
  ],
};
