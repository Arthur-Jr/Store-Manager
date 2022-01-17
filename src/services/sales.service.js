const joi = require('joi');
const { UNPROCESSABLE, NOT_FOUND } = require('../utils/httpStatus');
const saleModel = require('../models/sales.model');
const productModel = require('../models/products.model');
const productService = require('./products.service');

const notFoundThrow = () => {
  const err = new Error('Sale not found');
  err.status = NOT_FOUND;
  err.message = 'Sale not found';
  err.code = 'not_found';
  throw err;
};

const checkSaleInfos = (infos) => {
  const checkResult = joi.object({
    productId: joi.string().length(24).required(),
    quantity: joi.number().integer().min(1).required(),
  }).validate(infos);

  if (checkResult.error) {
    const err = new Error('Wrong product ID or invalid quantity');
    err.status = UNPROCESSABLE;
    err.message = 'Wrong product ID or invalid quantity';
    err.code = 'invalid_data';
    throw err;
  }
};

const checkProductQuantity = async (sale) => {
  const quantityCheck = await sale.map(async ({ productId, quantity: saleQuantity }) => {
    const { quantity } = await productService.findProductByIdService(productId);
    if (quantity - saleQuantity < 0) return false;
    return true;
  });

  const quantityCheckResult = await Promise.all(quantityCheck);
  // Referência ao Promisse.all:
  // https://stackoverflow.com/questions/40140149/use-async-await-with-array-map

  if (quantityCheckResult.some((index) => index === false)) {
    const err = new Error('Such amount is not permitted to sell');
    err.status = NOT_FOUND;
    err.message = 'Such amount is not permitted to sell';
    err.code = 'stock_problem';
    throw err;
  }
};

const addSalesService = async (sales) => {
  sales.forEach((sale) => checkSaleInfos(sale));

  await checkProductQuantity(sales);
  const result = await saleModel.addSalesModel(sales);
  await productModel.decreaseSaleQuantity(sales);

  return result;
};

const findAllSalesService = async () => {
  const sales = await saleModel.findAllSalesModel();

  return {
    sales,
  };
};

const findSaleByIdService = async (id) => {  
  const sale = await saleModel.findSaleByIdModel(id);

  if (sale === null) notFoundThrow();

  return sale;
};

const editSaleService = async (id, sale) => {
  sale.forEach((item) => checkSaleInfos(item));
  await saleModel.editSaleModel(id, sale);

  const editedSale = await saleModel.findSaleByIdModel(id);
  
  if (editedSale === null) notFoundThrow();

  return editedSale;
};

const deleteSaleService = async (id) => {
  const deletedSale = await saleModel.findSaleByIdModel(id);
  if (deletedSale === null) notFoundThrow();
  
  await saleModel.deleteSaleModel(id);
  await productModel.increaseSaleQuantity(deletedSale.itensSold);

  return deletedSale;
};

module.exports = {
  addSalesService,
  findAllSalesService,
  findSaleByIdService,
  editSaleService,
  deleteSaleService,
  checkSaleInfos,
  checkProductQuantity,
};
