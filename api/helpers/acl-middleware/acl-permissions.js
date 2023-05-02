var acl = require('acl');
const nodeAcl = new acl(new acl.memoryBackend());

nodeAcl.allow([
  {
    roles: ['admin','user'],
    allows: [
      {
        resources: [
          '/changePassword',
          
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