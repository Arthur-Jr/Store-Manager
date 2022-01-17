const rescue = require('express-rescue');
const { CREATED, HTTP_OK_STATUS } = require('../utils/httpStatus');
const productService = require('../services/products.service');

const addProductController = rescue(async (req, res) => {
  const { name, quantity } = req.body;

  const newProduct = await productService.addProductService({ name, quantity });

  return res.status(CREATED).json(newProduct);
});

const findAllProductsController = rescue(async (_req, res) => {
  const products = await productService.findAllProductsService();

  return res.status(HTTP_OK_STATUS).json(products);
});

const findProductByIdController = rescue(async (req, res) => {
  const { id } = req.params;
  const product = await productService.findProductByIdService(id);

  return res.status(HTTP_OK_STATUS).json(product);
});

const editProductController = rescue(async (req, res) => {
  const { name, quantity } = req.body;
  const { id } = req.params;

  const editedProduct = await productService.editProductService({ id, name, quantity });

  return res.status(HTTP_OK_STATUS).json(editedProduct);
});

const deleteProductController = rescue(async (req, res) => {
  const { id } = req.params;

  const deletedProduct = await productService.deleteProductService(id);

  return res.status(HTTP_OK_STATUS).json(deletedProduct);
});

module.exports = {
  addProductController,
  findAllProductsController,
  findProductByIdController,
  editProductController,
  deleteProductController,
};
