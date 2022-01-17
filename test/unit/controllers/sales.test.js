const sinon = require('sinon');
const { expect } = require('chai');

const saleController = require('../../../src/controllers/sales.controller');
const saleService = require('../../../src/services/sales.service');

const {  HTTP_OK_STATUS } = require('../../../src/utils/httpStatus');

// SALE CONTROLLER TESTS:
describe('Testes do Sale Controller', () => {
  const payloadSale = [
    { productId: '61ddd49bed0ab5043e53d2b8', quantity: 10 }
  ];

  const saleOnDB = {
    _id: '61ddd49bed0ab5043e53d2a6',
    itensSold: payloadSale,
  }

  const res = {};
  const req = {};
  let next = () => {};

  before(() => {
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns();
  });

  describe('Adicionar uma venda no BD. "addSalesController', () => {
    after(() => {
      saleService.addSalesService.restore();
    });

    it('Deve retornar o res com status "201" e o json com a venda adicionada.', async () => {
      req.body = payloadSale;

      sinon.stub(saleService, 'addSalesService').resolves(saleOnDB);
      await saleController.addSalesController(req, res, next);
      expect(res.status.calledWith(HTTP_OK_STATUS)).to.be.equal(true);
      expect(res.json.calledWith(saleOnDB));
    });
  });

  describe('Listar todas as vendas no BD. "findAllSalesController', () => {
    after(() => {
      saleService.findAllSalesService.restore();
    });

    it('Deve retornar o res com status "200" e o json com a lista de vendas.', async () => {
      const allSales = { sales: [saleOnDB, saleOnDB] }
      sinon.stub(saleService, 'findAllSalesService').resolves(allSales);
      await saleController.findAllSalesController(req, res, next);
      expect(res.status.calledWith(HTTP_OK_STATUS)).to.be.equal(true);
      expect(res.json.calledWith(allSales));
    });
  });

  describe('Encontrar uma venda no BD pelo ID. "findSaleByIdController"', () => {
    after(() => {
      saleService.findSaleByIdService.restore();
    });

    it('Deve retornar o res com status "200" e o json com a venda referente ao id.', async () => {
      req.params = { id: saleOnDB._id };

      sinon.stub(saleService, 'findSaleByIdService').resolves(saleOnDB);
      await saleController.findSaleByIdController(req, res, next);
      expect(res.status.calledWith(HTTP_OK_STATUS)).to.be.equal(true);
      expect(res.json.calledWith(saleOnDB));
    });
  });

  describe('Editar uma venda. "editSaleController"', () => {
    after(() => {
      saleService.editSaleService.restore();
    });

    it('Deve retornar o res com status "200" e o json com a venda editada.', async () => {
      const editedSale = { ...saleOnDB, itensSold: [{
        productId: payloadSale[0].productId,
        quantity: 50,
      }] }
      req.params = { id: saleOnDB._id };
      req.body = { productId: payloadSale[0].productId, quantity: 50 }

      sinon.stub(saleService, 'editSaleService').resolves(editedSale);
      await saleController.editSaleController(req, res, next);
      expect(res.status.calledWith(HTTP_OK_STATUS)).to.be.equal(true);
      expect(res.json.calledWith(editedSale));
    });
  });

  describe('Deletar uma venda. "deleteSaleController"', () => {
    after(() => {
      saleService.deleteSaleService.restore();
    });

    it('Deve retornar o res com status "200" e o json com a venda deletada.', async () => {
      req.params = { id: saleOnDB._id };

      sinon.stub(saleService, 'deleteSaleService').resolves(saleOnDB);
      await saleController.deleteSaleController(req, res, next);
      expect(res.status.calledWith(HTTP_OK_STATUS)).to.be.equal(true);
      expect(res.json.calledWith(saleOnDB));
    });
  });
});

