const { ObjectId } = require('mongodb');
const checkId = require('./checkId');
const connection = require('./connection');

const COLLECTION_NAME = 'products';

const findProductByNameModel = async (name) => {
  const db = await connection();
  const product = await db.collection(COLLECTION_NAME).findOne({ name });
  return product;
};

const addProductModel = async ({ name, quantity }) => {
  const db = await connection();
  const { insertedId } = await db.collection(COLLECTION_NAME).insertOne({ name, quantity });

  return insertedId;
};

const findAllProductsModel = async () => {
  const db = await connection();
  const products = await db.collection(COLLECTION_NAME).find({}).toArray();

  return products;
};

const findProductByIdModel = async (id) => {
  checkId(id);
  const db = await connection();
  const product = await db.collection(COLLECTION_NAME).findOne({ _id: ObjectId(id) });

  return product;
};

const editProductModel = async ({ id, name, quantity }) => {
  checkId(id);
  const db = await connection();
  const product = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: ObjectId(id) },
    { $set: { name, quantity } },
    { returnDocument: 'after' },
  );
  // Referência do "returnDocument":
  // https://stackoverflow.com/questions/32811510/mongoose-findoneandupdate-doesnt-return-updated-document

  return product.value;
};

const deleteProductModel = async (id) => {
  checkId(id);
  const db = await connection();
  await db.collection(COLLECTION_NAME).deleteOne({ _id: ObjectId(id) });
};

const decreaseSaleQuantity = async (sale) => {
  const db = await connection();
  await sale.forEach(async ({ productId, quantity: saleQuantity }) => {
    checkId(productId);
    await db.collection(COLLECTION_NAME).findOneAndUpdate(
      { _id: ObjectId(productId) },
      { $inc: { quantity: -saleQuantity } },
    );
  });
};

const increaseSaleQuantity = async (sale) => {
  const db = await connection();
  await sale.forEach(async ({ productId, quantity: saleQuantity }) => {
    checkId(productId);
    await db.collection(COLLECTION_NAME).findOneAndUpdate(
      { _id: ObjectId(productId) },
      { $inc: { quantity: saleQuantity } },
    );
  });
};

module.exports = {
  addProductModel,
  findProductByNameModel,
  findAllProductsModel,
  findProductByIdModel,
  editProductModel,
  deleteProductModel,
  decreaseSaleQuantity,
  increaseSaleQuantity,
};
