const sinon = require('sinon');
const { expect } = require('chai');
const { MongoClient } = require('mongodb');

const productModel = require('../../../src/models/products.model');
const { getConnection } = require('../../mongoMockConnection');

const payloadProduct = {
  name: 'caneta',
  quantity: 10,
}

// PRODUCT MODEL TESTS:
describe('Testes do Product Model', () => {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    await connectionMock.db('StoreManager').collection('products').deleteMany({});
    await connectionMock.db('StoreManager').collection('products').drop();
    MongoClient.connect.restore();
  });

  afterEach(async () => {
    await connectionMock.db('StoreManager').collection('products').deleteMany({});
  });

  describe('Adicionar um novo produto no BD. "addProductModel"', () => {
    it('Deve retornar um objeto com o id do produto', async () => {
      const productId = await productModel.addProductModel(payloadProduct);

      expect(productId).to.be.an('object');
      expect(productId).to.have.a.property('id');
    });

    it('Deve existir um produto com o nome cadatrado no BD', async () => {
      await productModel.addProductModel(payloadProduct);
      const product = await connectionMock
      .db('StoreManager').collection('products')
      .findOne({ name: payloadProduct.name });

      expect(product).to.be.not.null;
    });
  });

  describe('Encontrar um produto no BD pelo nome. "findProductByNameModel"', () => {
    it('Deve encontrar o produto pelo nome', async () => {
      await productModel.addProductModel(payloadProduct);
      const product = await productModel.findProductByNameModel(payloadProduct.name);
      expect(product).to.be.not.null;    
    });
  });

  describe('Listar todos os produtos no BD. "findAllProductsModel"', () => {
    it('Deve retornar um array vazio caso a collection esteja vazia', async () => {
      const products = await productModel.findAllProductsModel();
      expect(products).to.be.an('array').that.has.length(0);
    });

    it('Deve retornar todos os produtos do BD', async () => {
      await productModel.addProductModel(payloadProduct);
      await productModel.addProductModel(payloadProduct);
      const products = await productModel.findAllProductsModel();
      expect(products).to.be.an('array').that.has.length(2);
    });
  });

  describe('Encontrar o produto pelo o id. "findProductByIdModel"', () => {
    it('Deve retornar o produto de acordo com id ', async () => {
      const productId = await productModel.addProductModel(payloadProduct);
      const { _id } = await productModel.findProductByIdModel(productId);

      expect(_id).to.deep.equal(productId);
    });

    it('Deve retornar null se o produto não existir no BD ', async () => {
      const product = await productModel.findProductByIdModel('61ddd49bed0ab5043e53d2b8');

      expect(product).to.be.null;
    });
  });

  describe('Editar um produto., "editProductModel"', () => {
    it('Deve editar as informações do produto do id especificado e retorna-lo', async () => {
      const productId = await productModel.addProductModel(payloadProduct);
      const { quantity, name } = await productModel.findProductByIdModel(productId);
      expect(quantity).to.be.equal(10);
      expect(name).to.be.equal('caneta');

      const newProduct = await productModel.editProductModel({
        id: productId,
        name: 'lápis',
        quantity: 20,
      });
      expect(newProduct.quantity).to.be.equal(20);
      expect(newProduct.name).to.be.equal('lápis');
    });

    it('Deve retornar null se o produto não existir no BD ', async () => {
      const newProduct = await productModel.editProductModel({
        id: '61ddd49bed0ab5043e53d2b8',
        name: 'lápis',
        quantity: 20,
      });

      expect(newProduct).to.be.null;
    });
  });

  describe('Deletar um produto. "deleteProductModel"', () => {
    it('"findProductByIdModel" deve retornar null após o "deleteProductModel" ser chamado.', async () => {
      const productId = await productModel.addProductModel(payloadProduct);
      await productModel.deleteProductModel(productId);

      const product = await productModel.findProductByIdModel(productId);
      expect(product).to.be.null;
    });
  });

  describe('Diminuir a quantidade de acordo com a quantidade da compra., "decreaseSaleQuantity"', () => {
    it('Deve diminuir a "quntity" de acordo com a "quantity" da compra.', async () => {
      const productId = await productModel.addProductModel(payloadProduct);
      await productModel.decreaseSaleQuantity([{ productId, quantity: 5 }]);
      const product = await productModel.findProductByIdModel(productId);
      expect(product.quantity).to.be.equal(5);
    });

    it('Deve diminuir a "quantity" de 2 produtos', async () => {
      const productId = await productModel.addProductModel(payloadProduct);
      const productId2 = await productModel.addProductModel(payloadProduct);
      await productModel.decreaseSaleQuantity([
        { productId, quantity: 5 },
        { productId: productId2, quantity: 2 },
      ]);
      const product = await productModel.findProductByIdModel(productId);
      const product2 = await productModel.findProductByIdModel(productId2);

      expect(product.quantity).to.be.equal(5);
      expect(product2.quantity).to.be.equal(8);
    });
  });

  describe('Acrescentar a quantidade de acordo com a quantidade da compra removida.', () => {
    it('Deve acrescentar a "quntity" de acordo com a "quantity" da compra removida.', async () => {
      const productId = await productModel.addProductModel(payloadProduct);
      await productModel.increaseSaleQuantity([{ productId, quantity: 5 }]);
      const product = await productModel.findProductByIdModel(productId);
      expect(product.quantity).to.be.equal(15);
    });

    it('Deve acrescentar a "quantity" de 2 produtos', async () => {
      const productId = await productModel.addProductModel(payloadProduct);
      const productId2 = await productModel.addProductModel(payloadProduct);
      await productModel.increaseSaleQuantity([
        { productId, quantity: 5 },
        { productId: productId2, quantity: 2 },
      ]);
      const product = await productModel.findProductByIdModel(productId);
      const product2 = await productModel.findProductByIdModel(productId2);

      expect(product.quantity).to.be.equal(15);
      expect(product2.quantity).to.be.equal(12);
    });
  });
});
