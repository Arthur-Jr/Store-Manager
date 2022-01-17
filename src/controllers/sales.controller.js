const rescue = require('express-rescue');
const { HTTP_OK_STATUS } = require('../utils/httpStatus');
const saleService = require('../services/sales.service');

const addSalesController = rescue(async (req, res) => {
  const sale = req.body;

  const newSale = await saleService.addSalesService(sale);

  return res.status(HTTP_OK_STATUS).json(newSale);
});

const findAllSalesController = rescue(async (_req, res) => {
  const sales = await saleService.findAllSalesService();

  return res.status(HTTP_OK_STATUS).json(sales);
});

const findSaleByIdController = rescue(async (req, res) => {
  const { id } = req.params;
  const sale = await saleService.findSaleByIdService(id);

  return res.status(HTTP_OK_STATUS).json(sale);
});

const editSaleController = rescue(async (req, res) => {
  const { id } = req.params;
  const sale = req.body;
  
  const editSale = await saleService.editSaleService(id, sale);

  return res.status(HTTP_OK_STATUS).json(editSale);
});

const deleteSaleController = rescue(async (req, res) => {
  const { id } = req.params;

  const deletedSale = await saleService.deleteSaleService(id);

  return res.status(HTTP_OK_STATUS).json(deletedSale);
});

module.exports = {
  addSalesController,
  findAllSalesController,
  findSaleByIdController,
  editSaleController,
  deleteSaleController,
};
