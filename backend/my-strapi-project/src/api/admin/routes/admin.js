module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/admin/users',
      handler: 'api::admin.admin.getUsers',
    },
    {
      method: 'DELETE',
      path: '/admin/users/:documentId',
      handler: 'api::admin.admin.deleteUser',
    },
  ],
};
