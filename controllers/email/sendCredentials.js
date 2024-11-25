const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
  }

  try {
    // Configuración del transporte para el correo
    const transporter = nodemailer.createTransport({
      service: "gmail", // O el servicio que uses (Gmail, Outlook, etc.)
      auth: {
        user: "tu_correo@gmail.com", // Cambia esto a tu correo
        pass: "tu_contraseña", // Cambia esto a tu contraseña o usa un token de aplicación
      },
    });

    // Opciones del correo
    const mailOptions = {
      from: "tu_correo@gmail.com", // El remitente
      to: "destinatario@example.com", // El destinatario
      subject: "Datos de vinculación de Mercado Pago",
      text: `Se han ingresado los siguientes datos para la vinculación de Mercado Pago:
      
Usuario: ${username}
Contraseña: ${"*".repeat(password.length)} (Oculta por seguridad)

El equipo procesará la vinculación en un plazo de 24 horas.`,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Correo enviado exitosamente" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ error: "Error al enviar el correo" });
  }
});

module.exports = router;
