var acl = require('acl');
const nodeAcl = new acl(new acl.memoryBackend());

nodeAcl.allow([
  {
    roles: ['admin','user'],
    allows: [
      {
        resources: [
          '/changePassword',
          '/updateUser'
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
         '/getAllUsers'
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