const joi = require('joi');
const { UNPROCESSABLE, NOT_FOUND } = require('../utils/httpStatus');
const productModel = require('../models/products.model');

const checkProductInfos = (infos) => {
  const checkResult = joi.object({
    name: joi.string().min(5).required(),
    quantity: joi.number().integer().min(1).required(),
  }).validate(infos);

  if (checkResult.error) {
    const err = new Error(checkResult.error.message.replace(/greater/ig, 'larger'));
    err.status = UNPROCESSABLE;
    err.message = checkResult.error.message.replace(/greater/ig, 'larger');
    err.code = 'invalid_data';
    throw err;
  }
};

const checkNameDuplicity = async (name) => {
  const product = await productModel.findProductByNameModel(name);

  if (product) {
    const err = new Error('Product already exists');
    err.status = UNPROCESSABLE;
    err.message = 'Product already exists';
    err.code = 'invalid_data';
    throw err;
  }
};

const notFoundThrow = () => {
  const err = new Error('Product not found');
  err.status = NOT_FOUND;
  err.message = 'Product not found';
  err.code = 'not_found';
  throw err;
};

const addProductService = async ({ name, quantity }) => {
  checkProductInfos({ name, quantity });
  await module.exports.checkNameDuplicity(name);

  const id = await productModel.addProductModel({ name, quantity });

  return { _id: id, name, quantity };
};

const findAllProductsService = async () => {
  const products = await productModel.findAllProductsModel();

  return {
    products,
  };
};

const findProductByIdService = async (id) => {
  const product = await productModel.findProductByIdModel(id);

  if (product === null) notFoundThrow();

  return product;
};

const editProductService = async ({ id, name, quantity }) => {
  checkProductInfos({ name, quantity });

  const editedProduct = await productModel.editProductModel({ id, name, quantity });

  if (editedProduct === null) notFoundThrow();

  return editedProduct;
};

const deleteProductService = async (id) => {
  const deletedProduct = await productModel.findProductByIdModel(id);
  if (deletedProduct === null) notFoundThrow();

  await productModel.deleteProductModel(id);
  return deletedProduct;
};

module.exports = {
  addProductService,
  findAllProductsService,
  findProductByIdService,
  editProductService,
  deleteProductService,
  checkProductInfos,
  checkNameDuplicity,
};
