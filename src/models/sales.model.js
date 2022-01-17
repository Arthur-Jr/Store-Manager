const { ObjectId } = require('mongodb');
const checkId = require('./checkId');
const connection = require('./connection');

const COLLECTION_NAME = 'sales';

const addSalesModel = async (sales) => {
  sales.forEach(({ productId }) => checkId(productId));
  const db = await connection();
  const { insertedId } = await db.collection(COLLECTION_NAME).insertOne({ itensSold: sales });

  return { _id: insertedId, itensSold: sales };
};

const findAllSalesModel = async () => {
  const db = await connection();
  const sales = await db.collection(COLLECTION_NAME).find({}).toArray();

  return sales;
};

const findSaleByIdModel = async (id) => {
  checkId(id);
  const db = await connection();
  const sale = await db.collection(COLLECTION_NAME).findOne({ _id: ObjectId(id) });

  return sale;
};

const editSaleModel = async (id, sale) => {
  checkId(id);
  const db = await connection();
  sale.forEach(async (item) => {
    await db.collection(COLLECTION_NAME).findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: { 'itensSold.$[element]': item } },
      {
        arrayFilters: [{ 'element.productId': { $eq: item.productId } }],
        returnDocument: 'after',
      },
    );
  });
};

const deleteSaleModel = async (id) => {
  checkId(id);
  const db = await connection();
  await db.collection(COLLECTION_NAME).deleteOne({ _id: ObjectId(id) });
};

module.exports = {
  addSalesModel,
  findAllSalesModel,
  findSaleByIdModel,
  editSaleModel,
  deleteSaleModel,
};
