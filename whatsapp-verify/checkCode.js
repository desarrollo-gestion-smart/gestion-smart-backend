const express = require('express');
const router = express.Router();
const twilio = require('twilio');
require('dotenv').config();
const authenticateJWT = require('../middleware/authmiddleware');  // Importar el middleware de autenticación
const User = require('../models/users');

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } = process.env;
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Ruta para verificar el código de WhatsApp
router.post('/:phoneNumber/:code', authenticateJWT, async (req, res) => {
    try {
        const phoneNumber = decodeURIComponent(req.params.phoneNumber);
        const { code } = req.params;
        const userId = req.user.userId;  // El JWT contiene el ID del usuario

        console.log('Número de teléfono recibido:', phoneNumber);
        console.log('Código recibido:', code);
        console.log('ID del usuario desde JWT:', userId);
        if (!phoneNumber.startsWith('+')) {
            return res.status(400).json({ message: 'Número de teléfono inválido. Asegúrate de incluir el prefijo internacional.' });
        }
        // Verificación del código con Twilio
        const { status } = await twilioClient.verify.v2.services(TWILIO_SERVICE_SID).verificationChecks.create({
            to: phoneNumber,
            code: code
        });

        // Mueve el log después de recibir el estado de Twilio
        console.log('Estado de la verificación de Twilio:', status);

        if (status === 'approved') {
            // Si el código es aprobado, buscamos al usuario por su ID y actualizamos el número de WhatsApp
            const user = await User.findById(userId);
            if (user) {
                user.whatsapp = phoneNumber;
                await user.save();
                console.log('Número de WhatsApp actualizado en la base de datos');
                return res.json({ status: 'approved' });
            } else {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
        } else {
            return res.status(401).json({ status: 'invalid' });
        }
    } catch (error) {
        console.error('Error en la validación del código:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
