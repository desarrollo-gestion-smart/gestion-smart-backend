const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { login } = require('./controllers/authController');
const whatsappVerify = require('./whatsapp-verify/verify');  // Servicio de WhatsApp
const sendEmail = require('./controllers/emailSendRegister');  // Importa el servicio de correo
const { registerUser, getUsers } = require('./controllers/userController'); // Importa getUsers
const User = require('./models/users'); // Importa el modelo User

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
const MONGODB_URI = 'mongodb+srv://desarrollo:ADelgado.dev@cluster0.xvocm.mongodb.net/gestionSmart?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Rutas de la API de usuario
app.post('/api/users/register', registerUser);  
app.post('/api/users/login', login);  

// Ruta de verificación de WhatsApp
app.use('/api/verify', whatsappVerify);  // Servicio de verificación

// Ruta para enviar correos
app.post('/api/send-email', async (req, res) => {
    const emailData = req.body;
    try {
        await sendEmail(emailData);  // Llama al controlador de correo
        res.status(200).json({ message: 'Correo enviado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
    }
});
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, 'firstName lastName email'); // Obtén los campos necesarios
        res.json(users); // Envía la lista de usuarios al frontend
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
});
// Puerto de ejecución
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
