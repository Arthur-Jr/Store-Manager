const sinon = require('sinon');
const { expect } = require('chai');

const productController = require('../../../src/controllers/products.controller');
const productService = require('../../../src/services/products.service');

const { CREATED, HTTP_OK_STATUS } = require('../../../src/utils/httpStatus');

const payloadProduct = {
  name: 'caneta',
  quantity: 10,
}

const productOnBD= {
  _id: '61ddd49bed0ab5043e53d2b8',
  name: 'caneta',
  quantity: 10,
}

// PRODUCT CONTROLLER TESTS:
describe('Testes do Product Controller', () => {
  const res = {};
  const req = {};
  let next = () => {};

  before(() => {
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns();
  });

  describe('Adicionar um produto no BD. "addProductController', () => {
    after(() => {
      productService.addProductService.restore();
    });

    it('Deve retornar o res com status "201" e o json com produto adicionado.', async () => {
      req.body = payloadProduct;

      sinon.stub(productService, 'addProductService').resolves(productOnBD);
      await productController.addProductController(req, res, next);
      expect(res.status.calledWith(CREATED)).to.be.equal(true);
      expect(res.json.calledWith(productOnBD));
    });
  });

  describe('Listar todos os produtos no BD. "findAllProductsController', () => {
    after(() => {
      productService.findAllProductsService.restore();
    });

    it('Deve retornar o res com status "200" e o json com a lista de produtos.', async () => {
      req.body = payloadProduct;

      const allProducts = { products: [productOnBD, productOnBD] }
      sinon.stub(productService, 'findAllProductsService').resolves(allProducts);
      await productController.findAllProductsController(req, res, next);
      expect(res.status.calledWith(HTTP_OK_STATUS)).to.be.equal(true);
      expect(res.json.calledWith(allProducts));
    });
  });

  describe('Encontrar um produto no BD pelo ID. "findProductByIdController', () => {
    after(() => {
      productService.findProductByIdService.restore();
    });

    it('Deve retornar o res com status "200" e o json com o produto referente ao id.', async () => {
      req.params = { id: productOnBD._id };

      sinon.stub(productService, 'findProductByIdService').resolves(productOnBD);
      await productController.findProductByIdController(req, res, next);
      expect(res.status.calledWith(HTTP_OK_STATUS)).to.be.equal(true);
      expect(res.json.calledWith(productOnBD));
    });
  });

  describe('Editar um produto. "editProductController"', () => {
    after(() => {
      productService.editProductService.restore();
    });

    it('Deve retornar o res com status "200" e o json com o produto editado.', async () => {
      const editedProduct = {  ...productOnBD, quantity: 20 }
      req.params = { id: productOnBD._id };
      req.body = { name: productOnBD.name, quantity: 20 }

      sinon.stub(productService, 'editProductService').resolves(editedProduct);
      await productController.editProductController(req, res, next);
      expect(res.status.calledWith(HTTP_OK_STATUS)).to.be.equal(true);
      expect(res.json.calledWith(editedProduct));
    });
  });

  describe('Deletar um produto. "deleteProductController"', () => {
    after(() => {
      productService.deleteProductService.restore();
    });

    it('Deve retornar o res com status "200" e o json com o produto deletado.', async () => {
      req.params = { id: productOnBD._id };

      sinon.stub(productService, 'deleteProductService').resolves(productOnBD);
      await productController.deleteProductController(req, res, next);
      expect(res.status.calledWith(HTTP_OK_STATUS)).to.be.equal(true);
      expect(res.json.calledWith(productOnBD));
    });
  });
});
