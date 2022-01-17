const { ObjectId } = require('mongodb');
const { UNPROCESSABLE } = require('../utils/httpStatus');

module.exports = (id) => {
  if (!ObjectId.isValid(id)) {
    const err = new Error('Wrong id format');
    err.status = UNPROCESSABLE;
    err.message = 'Wrong id format';
    err.code = 'invalid_data';
    throw err;
  }

  return true;
};
