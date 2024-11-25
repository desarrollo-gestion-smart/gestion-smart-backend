// routes/mercadoPagoRoutes.js
const express = require('express');
const router = express.Router();
const mercadoPagoController = require('../controllers/mercado-pago/mercadoPagoVinculate');

router.get('/vincular', mercadoPagoController.iniciarVinculacion);
router.get('/callback', mercadoPagoController.callback);

module.exports = router;
