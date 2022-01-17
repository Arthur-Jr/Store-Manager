const { INTERNAL } = require('../utils/httpStatus');

module.exports = (err, _req, res, _next) => {
  console.log(err.message);

  if (err.status) { 
    return res.status(err.status).json({ err: { message: err.message, code: err.code } });
  }

  return res.status(INTERNAL).json({
    err: {
      code: 'Internal Server Error',
      message: 'Internal Server Error',
    },
  });
};

// Referência de como lidar com o throw new Error:
// https://stackoverflow.com/questions/58252067/pass-an-object-with-js-throw-new-error-in-node
