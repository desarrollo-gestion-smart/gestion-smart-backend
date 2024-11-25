// services/userRegistration.js
const User = require('../models/users');

async function registerUserData(phoneNumber, name, surname, email) {
    try {
        // Aquí puedes guardar los datos del usuario en la base de datos
        const user = new User({ whatsapp: phoneNumber, name, surname, email });
        await user.save();
        console.log('Usuario registrado en la base de datos:', user);
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        throw error;
    }
}

module.exports = {
    registerUserData
};
