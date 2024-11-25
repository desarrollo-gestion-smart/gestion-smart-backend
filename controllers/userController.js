const bcrypt = require('bcryptjs');  // Importa bcrypt
const User = require('../models/users');
const sendEmail = require('../controllers/emailSendRegister'); 

// Registrar usuario
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        console.log('Datos recibidos:', { firstName, lastName, email, password });

        // Validación de datos
        if (!firstName || !lastName || !email || !password) {
            console.log('Datos incompletos');
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
        }

        // Encriptar la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Creación de nuevo usuario
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,  // Guardar la contraseña encriptada
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

// Controlador para obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        console.log('Iniciando obtención de usuarios...');
        const users = await User.find(); // Intenta obtener todos los usuarios
        console.log('Usuarios obtenidos:', users); // Log de usuarios obtenidos
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error.message, error.stack); // Log detallado del error
        res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
};

// Controlador para actualizar número de WhatsApp
const updateUserWhatsapp = async (req, res) => {
    try {
        const { whatsapp } = req.body; // Solo el número de WhatsApp en el cuerpo de la solicitud
        const userId = req.userId; // Obtener el userId desde el middleware de autenticación

        // Verificar que el número de WhatsApp esté presente
        if (!whatsapp) {
            return res.status(400).json({ success: false, message: 'El número de WhatsApp es obligatorio' });
        }

        // Buscar y actualizar el usuario usando el userId
        const user = await User.findByIdAndUpdate(
            userId, // Condición de búsqueda usando userId
            { whatsapp }, // Actualizar el campo de WhatsApp
            { new: true } // Retornar el documento actualizado
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.status(200).json({ success: true, message: 'Número de WhatsApp actualizado correctamente', user });
    } catch (error) {
        console.error('Error al actualizar el número de WhatsApp:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el número de WhatsApp' });
    }
};

module.exports = { registerUser, getUsers, updateUserWhatsapp };
