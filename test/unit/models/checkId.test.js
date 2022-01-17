const { expect } = require('chai');

const checkId = require('../../../src/models/checkId');
const { UNPROCESSABLE } = require('../../../src/utils/httpStatus');

describe('Testes do checkId', () => {
  it('Deve dar "throw" de um erro se o ID for inválido', () => {
    try {
      checkId('abc');
    } catch ({ message, status, code }) {
      expect(message).to.be.equal('Wrong id format');
      expect(status).to.be.equal(UNPROCESSABLE);
      expect(code).to.be.equal('invalid_data');
    }
  });

  it('Deve retornar true se o ID é valido', () => {
    const result = checkId('61ddd49bed0ab5043e53d2b8');
    expect(result).to.be.true;
  });
});