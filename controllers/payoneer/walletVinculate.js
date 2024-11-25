const express = require('express');
const axios = require('axios');
require('dotenv').config();

const payoneerRouter = express.Router();

payoneerRouter.post('/api/payoneer/authenticate', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'El correo y la contraseña son obligatorios.' });
  }

  try {
    const response = await axios.post(
      'https://login.payoneer.com/', // Ajusta este endpoint según la documentación de Payoneer
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { access_token } = response.data;

    res.status(200).json({ message: 'Autenticación exitosa', token: access_token });
  } catch (error) {
    console.error('Error al autenticar con Payoneer:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al autenticar con Payoneer.' });
  }
});

module.exports = payoneerRouter;
