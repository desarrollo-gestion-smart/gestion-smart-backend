// Usa require() en lugar de import
const express = require('express');
const dotenv = require('dotenv');
const twilio = require('twilio');
const cors = require('cors');

// Cargar variables de entorno
dotenv.config();

const { 
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_SERVICE_SID
} = process.env;

const app = express();

// Habilitar CORS
app.use(cors());
app.use(express.json()); // Middleware para procesar JSON

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Ruta de verificación de WhatsApp
app.post('/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const verification = await twilioClient.verify.v2.services(TWILIO_SERVICE_SID).verifications.create({
            to: phoneNumber,
            channel: "whatsapp"  // Usamos SMS en lugar de WhatsApp
        });
        res.json({ status: verification.status });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

// Exportamos el servicio como middleware
module.exports = app;
