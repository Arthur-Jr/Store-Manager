const sinon = require('sinon');
const { expect } = require('chai');

const productService = require('../../../src/services/products.service');
const productModel = require('../../../src/models/products.model');
const saleService = require('../../../src/services/sales.service');
const saleModel = require('../../../src/models/sales.model');
const { UNPROCESSABLE, NOT_FOUND } = require('../../../src/utils/httpStatus');

// SALE SERVICE TESTS:
describe('Testes do Sale Service', () => {
  const payloadSale = [
    { productId: '61ddd49bed0ab5043e53d2b8', quantity: 10 }
  ];

  const saleOnDB = {
    _id: '61ddd49bed0ab5043e53d2a6',
    itensSold: payloadSale,
  }

  const productOnBD = {
    _id: '61ddd49bed0ab5043e53d2b8',
    name: 'caneta',
    quantity: 5,
  }

  describe('Checar as infos da Sale. "checkSaleInfos"', () => {
    it('Deve dar "throw" de um erro se o productId estiver vazio.', () => {
      try {
        saleService.checkSaleInfos({ productId: '', quantity: 10 });
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('Wrong product ID or invalid quantity');
        expect(status).to.be.equal(UNPROCESSABLE);
        expect(code).to.be.equal('invalid_data');
      }
    });

    it('Deve dar "throw" de um erro se o productId não for string.', () => {
      try {
        saleService.checkSaleInfos({ productId: null, quantity: 10 });
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('Wrong product ID or invalid quantity');
        expect(status).to.be.equal(UNPROCESSABLE);
        expect(code).to.be.equal('invalid_data');
      }
    });

    it('Deve dar "throw" de um erro se quantity for menor ou igual a zero.', () => {
      try {
        saleService.checkSaleInfos({ productId: payloadSale[0].productId, quantity: 0 });
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('Wrong product ID or invalid quantity');
        expect(status).to.be.equal(UNPROCESSABLE);
        expect(code).to.be.equal('invalid_data');
      }
    });

    it('Deve dar "throw" de um erro se quantity não for um "Number".', () => {
      try {
        saleService.checkSaleInfos({ productId: payloadSale[0].productId, quantity: '' });
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('Wrong product ID or invalid quantity');
        expect(status).to.be.equal(UNPROCESSABLE);
        expect(code).to.be.equal('invalid_data');
      }
    });
  });

  describe('Checar a quantidade de produtos para compra, "checkProductQuantity"', () => {
    it('Deve dar "Throw" de um erro se a "quantity" de sale for maior que a de produto ', async () => {
      try {
        sinon.stub(productService, 'findProductByIdService').resolves(productOnBD);
        await saleService.checkProductQuantity(payloadSale);
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('Such amount is not permitted to sell');
        expect(status).to.be.equal(NOT_FOUND);
        expect(code).to.be.equal('stock_problem');
      }
    });
  });

  describe('Adciona uma compra no BD, "addSalesService"', () => {
    after(() => {
      saleService.checkProductQuantity.restore();
      saleModel.addSalesModel.restore();
      productModel.decreaseSaleQuantity.restore();
    });

    it('Deve retornar a compra.', async () => {
      sinon.stub(saleService, 'checkProductQuantity').resolves(null);
      sinon.stub(saleModel, 'addSalesModel').resolves(saleOnDB);
      sinon.stub(productModel, 'decreaseSaleQuantity').resolves(null);
      const sale = await saleService.addSalesService([{ ...payloadSale[0], quantity: 2 }]);

      expect(sale).to.be.equal(saleOnDB);
    });
  });

  describe('Listar todos os produtos no BD. "findAllSalesModel"', () => {
    afterEach(() => {
      saleModel.findAllSalesModel.restore();
    });

    it('Deve retornar a lista de compras', async () => {
      sinon.stub(saleModel, 'findAllSalesModel').resolves([saleOnDB, saleOnDB]);
      const { sales }= await saleService.findAllSalesService();
      expect(sales).to.have.length(2);
    });

    it('Deve retornar um array vazio se o BD estiver vazio', async () => {
      sinon.stub(saleModel, 'findAllSalesModel').resolves([]);
      const { sales }= await saleService.findAllSalesService();
      expect(sales).to.have.length(0);
    });
  });

  describe('Encontrar uma compra no BD pelo ID. "findSaleByIdService"', () => {
    afterEach(() => {
      saleModel.findSaleByIdModel.restore();
    });

    it('Deve dar "throw" de um erro se a compra não for encontrada.', async () => {
      sinon.stub(saleModel, 'findSaleByIdModel').resolves(null);
      try {
        await saleService.findSaleByIdService(saleOnDB._id);
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('Sale not found');
        expect(status).to.be.equal(NOT_FOUND);
        expect(code).to.be.equal('not_found');
      }
    });

    it('Deve retornar o produto referente ao ID', async () => {
      sinon.stub(saleModel, 'findSaleByIdModel').resolves(saleOnDB);
      const sale = await saleService.findSaleByIdService(saleOnDB._id);
      expect(sale).to.be.equal(saleOnDB);
    });
  });

  describe('Editar uma compra. "editSaleService"', () => {
    afterEach(() => {
      saleModel.editSaleModel.restore();
      saleModel.findSaleByIdModel.restore();
    });

    it('Deve retornar a compra já editada', async () => {
      const editedSale = { ...saleOnDB, itensSold: [{ ...payloadSale, quantity: 50 }] }

      sinon.stub(saleModel, 'editSaleModel').resolves(editedSale);
      sinon.stub(saleModel, 'findSaleByIdModel').resolves(editedSale);
      const sale = await saleService.editSaleService(saleOnDB._id, [{
        productId: payloadSale[0].productId,
        quantity: 50
      }]);

      expect(sale).to.be.equal(editedSale);
    });

    it('Deve dar "throw" de um erro se a compra não for encontrada.', async () => {
      sinon.stub(saleModel, 'findSaleByIdModel').resolves(null);
      sinon.stub(saleModel, 'editSaleModel').resolves(null);
      try {
        await saleService.editSaleService(saleOnDB._id, [{
          productId: payloadSale[0].productId,
          quantity: 50
        }]);
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('Sale not found');
        expect(status).to.be.equal(NOT_FOUND);
        expect(code).to.be.equal('not_found');
      }
    });
  });
  
  describe('Deletar uma compra. "deleteProductService"', () => {
    afterEach(() => {
      saleModel.findSaleByIdModel.restore();
      saleModel.deleteSaleModel.restore();
      productModel.increaseSaleQuantity.restore();
    });

    it('Deve retornar o produto deletado', async () => {
      sinon.stub(saleModel, 'findSaleByIdModel').resolves(saleOnDB);
      sinon.stub(saleModel, 'deleteSaleModel').resolves(null);
      sinon.stub(productModel, 'increaseSaleQuantity').resolves(null);
      const deletedSale = await saleService.deleteSaleService(saleOnDB._id);

      expect(deletedSale).to.be.equal(saleOnDB);
    });

    it('Deve dar "throw" de um erro se a compra não for encontrada.', async () => {
      sinon.stub(saleModel, 'findSaleByIdModel').resolves(null);
      sinon.stub(saleModel, 'deleteSaleModel').resolves(null);
      sinon.stub(productModel, 'increaseSaleQuantity').resolves(null);
      try {
        await saleService.deleteSaleService(saleOnDB._id);
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('Sale not found');
        expect(status).to.be.equal(NOT_FOUND);
        expect(code).to.be.equal('not_found');
      }
    });
  });
});
