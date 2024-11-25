// routes/usuarios.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Para generar tokens JWT
const User = require('../../models/users'); // Asegúrate de que la ruta sea correcta
require('dotenv').config();

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, country } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            country,
        });

        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar el usuario', details: err.message });
    }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Verificar la contraseña
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Generar un token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (err) {
        res.status(500).json({ error: 'Error al iniciar sesión', details: err.message });
    }
});

// Ruta para actualizar el número de WhatsApp o vincular una billetera
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { whatsapp, wallet } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: { whatsapp, wallet } },
            { new: true } // Devuelve el usuario actualizado
        );

        res.json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el usuario', details: err.message });
    }
});

// Ruta para obtener un usuario específico por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el usuario', details: err.message });
    }
});

router.get('/getusers', async (req, res) => {
    try {
        const users = await User.find(); // Busca todos los documentos en la colección
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los usuarios', details: err.message });
    }
});

module.exports = router;
