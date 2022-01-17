const express = require('express');
const errorMiddleware = require('../middlewares/errorMiddleware');
const {
  addSalesController,
  findAllSalesController,
  findSaleByIdController,
  editSaleController,
  deleteSaleController,
} = require('../controllers/sales.controller');

const router = express.Router();

router.post('/', addSalesController);

router.get('/', findAllSalesController);

router.get('/:id', findSaleByIdController);

router.put('/:id', editSaleController);

router.delete('/:id', deleteSaleController);

router.use(errorMiddleware);

module.exports = router;
