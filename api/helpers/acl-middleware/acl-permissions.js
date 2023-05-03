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
          '/getAllUsersOfConfrence'
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
         '/editConfrence',
         '/updateSpeaker',
         '/topSpeakers'
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
          '/voteSpeaker',
          '/registerConfrence',
          '/unRegisterConfrence'
        ],
        permissions: ['*']
      },
    ],
  }

]);


module.exports = {
  nodeAcl
}