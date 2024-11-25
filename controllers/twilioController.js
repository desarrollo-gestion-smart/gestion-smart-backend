// Archivo: twilioController.js
const twilio = require('twilio');
require('dotenv').config();
const User = require('../models/users'); // Asumiendo que el usuario está registrado en esta colección

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER } = process.env;
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Lógica para recibir y responder mensajes de WhatsApp
async function handleIncomingWhatsApp(req, res) {
    const incomingMessage = req.body.Body;
    const fromNumber = req.body.From;

    // Buscamos al usuario registrado en la base de datos
    const user = await User.findOne({ whatsapp: fromNumber.replace('whatsapp:', '') });
    
    if (user) {
        if (incomingMessage === '1') {
            // Empieza el flujo de registro si el usuario envía '1'
            await twilioClient.messages.create({
                from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
                to: fromNumber,
                body: '¡Bienvenido! Por favor, responde con tu nombre:'
            });
            // Puedes guardar un estado de conversación en la base de datos para continuar el flujo.
        } else {
            // Respuesta por defecto para cualquier otro mensaje
            await twilioClient.messages.create({
                from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
                to: fromNumber,
                body: 'Hola, responde "1" para registrarte o pregúntame cualquier cosa.'
            });
        }
    } else {
        await twilioClient.messages.create({
            from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
            to: fromNumber,
            body: 'No reconocemos tu número. Por favor, verifica tu cuenta.'
        });
    }

    res.sendStatus(200); // Respuesta a Twilio de que el mensaje fue procesado
}

module.exports = { handleIncomingWhatsApp };
