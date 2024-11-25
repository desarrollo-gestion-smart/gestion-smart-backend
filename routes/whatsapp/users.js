
// Endpoint para obtener el ObjectId y whatsapp
const express = require('express');
const User = require('../../models/users');  // Asegúrate de que la ruta es correcta
const router = express.Router();

// Endpoint para obtener el ObjectId y whatsapp
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'whatsapp'); // Recupera solo los campos whatsapp y _id
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios' });
    }

    // Mapea los resultados para devolver solo los campos requeridos
    const result = users.map(user => ({
      id: user._id,
      whatsapp: user.whatsapp
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ message: 'Hubo un error al obtener los datos' });
  }
});

module.exports = router;


