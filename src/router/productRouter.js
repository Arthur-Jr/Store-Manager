const express = require('express');
const errorMiddleware = require('../middlewares/errorMiddleware');
const {
  addProductController,
  findAllProductsController,
  findProductByIdController,
  editProductController,
  deleteProductController,
} = require('../controllers/products.controller');

const router = express.Router();

router.post('/', addProductController);

router.get('/', findAllProductsController);

router.get('/:id', findProductByIdController);

router.put('/:id', editProductController);

router.delete('/:id', deleteProductController);

router.use(errorMiddleware);

module.exports = router;
