const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { registerUser } = require('./controllers/userController'); 
const { login } = require('./controllers/authController');  // Corrige la ruta de importación

const app = express();
app.use(cors());
app.use(express.json());

// Conexión directa sin dotenv
const MONGODB_URI = 'mongodb+srv://desarrollo:ADelgado.dev@cluster0.xvocm.mongodb.net/gestionSmart?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Rutas
app.post('/api/users/register', registerUser);  
app.post('/api/users/login', login);  

// Puerto de ejecución
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
