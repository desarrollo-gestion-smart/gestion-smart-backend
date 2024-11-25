// verifyPhone.js
const express = require('express');
const router = express.Router();
const twilio = require('twilio');
require('dotenv').config();  // Importa y configura dotenv

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } = process.env;

// Configura tu cliente Twilio con las credenciales de las variables de entorno
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

router.post('/:phoneNumber', async (req, res) => {
    try {
      const { phoneNumber } = req.params;
    //   console.log('Número recibido en el backend:', phoneNumber);
  
      const verification = await twilioClient.verify.v2.services(TWILIO_SERVICE_SID).verifications.create({
        to: phoneNumber,
        channel: 'whatsapp'
      });
  
      if (verification.status === 'pending') {
        return res.status(200).json({ message: 'Verificación enviada exitosamente' });
      } else {
        return res.status(400).json({ error: 'Error al enviar la verificación' });
      }
    } catch (error) {
      console.error('Error en el servidor:', error);
      res.status(500).json({ error: 'Error en el servidor al verificar el número' });
    }
  });
module.exports = router;
