const sinon = require('sinon');
const { expect } = require('chai');

const productService = require('../../../src/services/products.service');
const productModel = require('../../../src/models/products.model');
const { UNPROCESSABLE, NOT_FOUND } = require('../../../src/utils/httpStatus');

// PRODUCT SERVICE TESTS:
describe('Testes do Product Service', () => {
  const payloadProduct = {
    name: 'caneta',
    quantity: 10,
  }

  const productOnBD= {
    _id: '61ddd49bed0ab5043e53d2b8',
    name: 'caneta',
    quantity: 10,
  }

  describe('Checar as infos do produto. "checkProductInfos"', () => {
    it('Deve dar "throw" de um erro se o nome estiver vazio.', () => {
      try {
        productService.checkProductInfos({ name: '', quantity: 10 });
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('"name" is not allowed to be empty');
        expect(status).to.be.equal(UNPROCESSABLE);
        expect(code).to.be.equal('invalid_data');
      }
    });

    it('Deve dar "throw" de um erro se o nome não for string.', () => {
      try {
        productService.checkProductInfos({ name: null, quantity: 10 });
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('"name" must be a string');
        expect(status).to.be.equal(UNPROCESSABLE);
        expect(code).to.be.equal('invalid_data');
      }
    });

    it('Deve dar "throw" de um erro se quantity for menor ou igual a zero.', () => {
      try {
        productService.checkProductInfos({ name: 'caneta', quantity: 0 });
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('"quantity" must be larger than or equal to 1');
        expect(status).to.be.equal(UNPROCESSABLE);
        expect(code).to.be.equal('invalid_data');
      }
    });

    it('Deve dar "throw" de um erro se quantity não for um "Number".', () => {
      try {
        productService.checkProductInfos({ name: 'caneta', quantity: '' });
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('"quantity" must be a number');
        expect(status).to.be.equal(UNPROCESSABLE);
        expect(code).to.be.equal('invalid_data');
      }
    });
  });

  describe('Checar se um produto com o mesmo nome já existe no BD. "checkNameDuplicity"', () => {
    afterEach(() => {
      productModel.findProductByNameModel.restore();
    });

    it('Deve dar "throw de um erro se o produto já existir no BD"', async () => {
      sinon.stub(productModel, 'findProductByNameModel').resolves(productOnBD);

      try {
        await productService.checkNameDuplicity(payloadProduct.name);
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('Product already exists');
        expect(status).to.be.equal(UNPROCESSABLE);
        expect(code).to.be.equal('invalid_data');
      }
    });
  });

  describe('Adciona um produto no BD, "addProductService"', () => {
    after(() => {
      productModel.addProductModel.restore();
      productService.checkNameDuplicity.restore();
    });

    it('Deve retornar o produto.', async () => {
      sinon.stub(productModel, 'addProductModel').resolves(productOnBD._id);
      sinon.stub(productService, 'checkNameDuplicity').resolves(null);
      const product = await productService.addProductService(payloadProduct);
      expect(product).to.deep.equal(productOnBD);
    });
  });

  describe('Listar todos os produtos no BD. "findAllProductsService"', () => {
    afterEach(() => {
      productModel.findAllProductsModel.restore();
    });

    it('Deve retornar um array com a lista de produtos', async () => {
      sinon.stub(productModel, 'findAllProductsModel').resolves([productOnBD, productOnBD]);
      const { products }= await productService.findAllProductsService();
      expect(products).to.have.length(2);
    });

    it('Deve retornar um array vazio se o BD estiver vazio', async () => {
      sinon.stub(productModel, 'findAllProductsModel').resolves([]);
      const { products }= await productService.findAllProductsService();
      expect(products).to.have.length(0);
    });
  });

  describe('Encontrar um produto no BD pelo ID. "findProductByIdService"', () => {
    afterEach(() => {
      productModel.findProductByIdModel.restore();
    });

    it('Deve dar "throw" de um erro se o produto não for encontrado.', async () => {
      sinon.stub(productModel, 'findProductByIdModel').resolves(null);
      try {
        await productService.findProductByIdService(productOnBD._id);
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('Product not found');
        expect(status).to.be.equal(NOT_FOUND);
        expect(code).to.be.equal('not_found');
      }
    });

    it('Deve retornar o produto referente ao ID', async () => {
      sinon.stub(productModel, 'findProductByIdModel').resolves(productOnBD);
      const product = await productService.findProductByIdService(productOnBD._id);
      expect(product).to.be.equal(productOnBD);
    });
  });

  describe('Editar um produto. "editProductService"', () => {
    afterEach(() => {
      productModel.editProductModel.restore();
    });

    it('Deve retornar o produto já editado', async () => {
      sinon.stub(productModel, 'editProductModel').resolves({ ...productOnBD, quantity: 50 });
      const product = await productService.editProductService({
        id: productOnBD._id,
        name: productOnBD.name,
        quantity: productOnBD.quantity,
      });

      expect(product).to.deep.equal({ ...productOnBD, quantity: 50 });
    });

    it('Deve dar "throw" de um erro se o produto não for encontrado.', async () => {
      sinon.stub(productModel, 'editProductModel').resolves(null);
      try {
        await productService.editProductService(productOnBD);
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('Product not found');
        expect(status).to.be.equal(NOT_FOUND);
        expect(code).to.be.equal('not_found');
      }
    });
  });

  describe('Deletar um produto. "deleteProductService"', () => {
    afterEach(() => {
      productModel.findProductByIdModel.restore();
      productModel.deleteProductModel.restore();
    });

    it('Deve retornar o produto deletado', async () => {
      sinon.stub(productModel, 'findProductByIdModel').resolves(productOnBD);
      sinon.stub(productModel, 'deleteProductModel').resolves(null);
      const product = await productService.deleteProductService(productOnBD._id);

      expect(product).to.be.equal(productOnBD);
    });

    it('Deve dar "throw" de um erro se o produto não for encontrado.', async () => {
      sinon.stub(productModel, 'findProductByIdModel').resolves(null);
      sinon.stub(productModel, 'deleteProductModel').resolves(null);
      try {
        await productService.deleteProductService(productOnBD._id);
      } catch ({ message, status, code }) {
        expect(message).to.be.equal('Product not found');
        expect(status).to.be.equal(NOT_FOUND);
        expect(code).to.be.equal('not_found');
      }
    });
  });
});
