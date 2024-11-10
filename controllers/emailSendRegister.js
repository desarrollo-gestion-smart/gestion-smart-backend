const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'c2700146.ferozo.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'desarrollo@gestion-smart-web.com', // tu correo
        pass: 'Ezequiel5454@' // tu contraseña
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});

const sendEmail = async (emailData) => {
    try {
        await transporter.sendMail({
            from: '"Gestión Smart Web" <desarrollo@gestion-smart-web.com>', // remitente
            to: emailData.to, // destinatario
            subject: emailData.subject, // asunto
            text: emailData.text // cuerpo del correo
        });
        console.log('Correo enviado exitosamente.');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw error; // relanzar el error para ser capturado por el controlador principal
    }
};

module.exports = sendEmail;
