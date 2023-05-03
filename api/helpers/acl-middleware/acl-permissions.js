var acl = require('acl');
const nodeAcl = new acl(new acl.memoryBackend());

nodeAcl.allow([
  {
    roles: ['admin','user'],
    allows: [
      {
        resources: [
          '/changePassword',
          '/updateUser',
          '/getAllConfrence',
          '/registerConfrence',
          '/unRegisterConfrence'
        ],
        permissions: ['*']
      },
    ],
  },
  {
    roles: ["admin"],
    allows: [
      {
        resources: [
         '/changeUserStatus',
         '/getAllUsers',
         '/createConfrence',
         '/editConfrence'
        ],
        permissions: ['*']
      },
    ],
  },
  {
    roles: ["user"],
    allows: [
      {
        resources: [
         
        ],
        permissions: ['*']
      },
    ],
  }

]);


module.exports = {
  nodeAcl
}