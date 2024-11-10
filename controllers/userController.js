const User = require('../models/users'); 
const sendEmail = require('../controllers/emailSendRegister'); 

const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        console.log('Datos recibidos:', { firstName, lastName, email, password });

        // Validación de datos
        if (!firstName || !lastName || !email || !password) {
            console.log('Datos incompletos');
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
        }

        // Creación de nuevo usuario
        const newUser = new User({
            firstName,
            lastName,
            email,
            password
        });

        await newUser.save();
        console.log('Usuario guardado en la base de datos.');

        // Preparar los datos del correo
        const emailData = {
            to: 'desarrollo@gestion-smart-web.com',
            subject: 'Nuevo Usuario Registrado',
            text: `Un nuevo usuario se ha registrado: \n\nNombre: ${firstName} ${lastName} \nEmail: ${email}`,
        };

        // Enviar el correo
        try {
          await sendEmail(emailData);
          console.log('Correo enviado exitosamente.');
        } catch (emailError) {
          console.error('Error al enviar el correo:', emailError.message || emailError);
          return res.status(500).json({ success: false, message: 'Usuario registrado, pero fallo el envío de correo' });
        }

        // Responder con éxito
        res.status(201).json({ success: true, message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ success: false, message: 'Error registrando el usuario' });
    }
};

module.exports = {
    registerUser
};
