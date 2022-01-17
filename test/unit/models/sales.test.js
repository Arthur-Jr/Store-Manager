const sinon = require('sinon');
const { expect } = require('chai');
const { MongoClient } = require('mongodb');

const saleModel = require('../../../src/models/sales.model');
const { getConnection } = require('../../mongoMockConnection');

// SALE MODEL TESTS:
describe('Testes do Sale Model', () => {
  let connectionMock;

  const payloadSale = [
    { productId: '61ddd49bed0ab5043e53d2b8', quantity: 5 }
  ];

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    await connectionMock.db('StoreManager').collection('sales').drop();
    MongoClient.connect.restore();
  });

  afterEach(async () => {
    await connectionMock.db('StoreManager').collection('sales').deleteMany({});
  });

  describe('Adcicionar uma nova compra ao BD. "addSalesModel"', () => {
    it('Deve adicionar a compra ao BD e retorna-lo.', async () => {
      const { itensSold } = await saleModel.addSalesModel(payloadSale);
      expect(itensSold).to.be.equal(payloadSale);
    });

    it('A compra deve exixtir do BD', async () => {
      const { _id } = await saleModel.addSalesModel(payloadSale);
      const sale = await connectionMock
      .db('StoreManager').collection('sales')
      .findOne({ _id });

      expect(sale).to.be.not.null;
    });
  });

  describe('Listar todas as compras do BD. "findAllSalesModel"', () => {
    it('Deve retornar um array vazio caso a collection esteja vazia', async () => {
      const sales = await saleModel.findAllSalesModel();
      expect(sales).to.be.an('array').that.has.length(0);
    });

    it('Deve retornar todas as compras do BD', async () => {
      await saleModel.addSalesModel(payloadSale);
      await saleModel.addSalesModel(payloadSale);
      const sales = await saleModel.findAllSalesModel();
      expect(sales).to.be.an('array').that.has.length(2);
    });
  });

  describe('Encontrar a compra pelo o id. "findSaleByIdModel"', () => {
    it('Deve retornar a compra de acordo com id ', async () => {
      const { _id } = await saleModel.addSalesModel(payloadSale);
      const sale = await saleModel.findSaleByIdModel(_id);

      expect(sale._id).to.deep.equal(_id);
    });

    it('Deve retornar null se a compra não existir no BD ', async () => {
      const sale = await saleModel.findSaleByIdModel('61ddd49bed0ab5043e53d2b8');

      expect(sale).to.be.null;
    });
  });

  describe('Editar um produto., "editSaleModel"', () => {
    it('Deve editar as informações do produto do id especificado e retorna-lo', async () => {
      const { _id } = await saleModel.addSalesModel(payloadSale);
      const { itensSold } = await saleModel.findSaleByIdModel(_id);
      expect(itensSold[0].quantity).to.be.equal(5);

      await saleModel.editSaleModel( _id, [
        { productId: payloadSale[0].productId, quantity: 10 }
      ]);
      const newSale = await saleModel.findSaleByIdModel(_id);

      expect(newSale.itensSold[0].quantity).to.be.equal(10);
    });
  });

  describe('Deletar uma compra. "deleteSaleModel"', () => {
    it('Deve deletar a compra do id especificado.', async () => {
      const { _id } = await saleModel.addSalesModel(payloadSale);
      await saleModel.deleteSaleModel(_id);
      const deletedSale = await saleModel.findSaleByIdModel(_id);

      expect(deletedSale).to.be.null;
    });
  });
});
