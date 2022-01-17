const sinon = require('sinon');
const { expect } = require('chai');

const erroMiddleware = require('../../../src/middlewares/errorMiddleware');

const { UNPROCESSABLE, INTERNAL } = require('../../../src/utils/httpStatus');

// ERROR MIDDLEWARE TESTS:
describe('Testes do Middleware de Erro', () => {
  describe('Retorna a res com as infos do erro.', () => {
    const res = {};
    const req = {};
    let next = () => {};

    before(() => {
      res.status = sinon.stub().returns(res);
      res.json = sinon.stub().returns();
    });

    it('Deve retornar o res com as infos do param err, se o err.status existir.', async () => {
      req.body = {};

      const err = { message: 'Product already exists', status: UNPROCESSABLE, code: 'invalid_data' }
      
      erroMiddleware(err, req, res, next);
      expect(res.status.calledWith(err.status)).to.be.equal(true);
      expect(res.json.calledWith({ err: { message: err.message, code: err.code } })).to.be.equal(true);
    });

    it('Deve retornar o res com Iternal error.', async () => {
      req.body = {}
      
      const err = {}
      
      erroMiddleware(err, req, res, next);
      expect(res.status.calledWith(INTERNAL)).to.be.equal(true);
      expect(res.json.calledWith({ err: {
        message: 'Internal Server Error',
        code: 'Internal Server Error'
      } })).to.be.equal(true);
    });
  });
});
