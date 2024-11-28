const express = require('express');
const router = express.Router();
const { getAllClients } = require('../../services/clientsService'); // Importa el servicio

// Ruta para obtener todos los clientes
router.get('/clients', async (req, res) => {
    try {
        const clients = await getAllClients(); // Llama al servicio
        res.status(200).json(clients); // Responde con los datos
    } catch (error) {
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
});

module.exports = router;
