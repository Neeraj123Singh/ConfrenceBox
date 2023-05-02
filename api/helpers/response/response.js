exports.apiResponse = (res, status, message, code, data, token) => {
  const resModel = {
    meta: {
      Status: status ? status : false,
      Message: message ? message : "",
      code: code ? code : 200
    },
    Data: data ? data : {},
    Token: token ? token : ""
  };
  res.json(resModel);
};
