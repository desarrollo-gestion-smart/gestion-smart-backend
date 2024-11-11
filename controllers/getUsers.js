// controllers/userController.js

const User = require('../models/User'); // Asegúrate de tener un modelo User definido

// Controlador para obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        const users = await User.find(); // Obtén todos los usuarios
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
};

module.exports = { registerUser, getUsers }; // Exporta la función getUsers
