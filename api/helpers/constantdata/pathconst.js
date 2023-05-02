exports.PagesPath = {
  IndexPage: appRoot + "/api/index.html",
  ErrorPage: appRoot + "/api/error.html",
  DocPage: appRoot + "/api/doc/index.html"
};
exports.ControllersPath = {
  UserControllerV1: appRoot + '/api/v1/controllers/user/index.js'
};

exports.ReqModelsPath = {
  UserValidationV1: appRoot + "/api/v1/validation/user/index.js"
};
exports.FilesPath = {
  V1Routes: appRoot + "/api/v1/routes/index.js",
  AuthHelper: appRoot + "/api/helpers/constantdata/authhelper.js",
  ResHelper: appRoot + "/api/helpers/response/response.js",
  CommonHelper: appRoot + "/api/helpers/commonhelper.js"
};


exports.ServicesPath = {
  UserService: appRoot + "/api/services/user-services.js"
}