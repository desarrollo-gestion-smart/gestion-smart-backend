const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); // Para llamadas a APIs externas
const authRoutes = require('./controllers/authController');
const whatsappVerify = require('./whatsapp-verify/verify');
const checkCode = require('./whatsapp-verify/checkCode');
const sendEmail = require('./controllers/emailSendRegister');
const { registerUser, getUsers } = require('./controllers/userController');
const { handleIncomingWhatsApp } = require('./controllers/twilioController');
const twilio = require('twilio');
const diacritics = require('diacritics');
// const payoneerRouter = require('./controllers/payoneer/walletVinculate');
const {findById} = require("./models/users");
const authenticateJWT = require('./middleware/authmiddleware');
const User = require('./models/users');
const clientRoutes = require('./routes/clients/getClients'); // Importa las rutas

// const userRoutes = require('./routes/whatsapp/users');
// const mercadopagoRouter = require('./controllers/mercado-pago/mercadoPagoVinculate'); // Importa el router con las rutas de Mercado Pago
const mercadopagoRouter = express.Router();


require('dotenv').config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "https://gestion-smart.com",
      "https://gestion-smart-front-production.up.railway.app",
      "https://gestion-smart.com/register",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
const MONGODB_URI = 'mongodb+srv://desarrollo:ADelgado.dev@cluster0.xvocm.mongodb.net/gestionSmart?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Rutas existentes
app.use('/api/users', authRoutes);
app.use('/api/verify', whatsappVerify);
app.use('/api/validateCode', checkCode);
app.post('/api/twilio/receive-whatsapp', handleIncomingWhatsApp);
app.get('/api/users', getUsers);
app.use('/api', clientRoutes);

// endpoints para whatsapp

// app.use('/user/contact', userRoutes)

//endpoint para tomar los usuarios de la base de datos

app.post('/api/send-email', async (req, res) => {
  const emailData = req.body;
  console.log('Datos del correo recibidos:', emailData);
  try {
    await sendEmail(emailData);
    console.log('Correo enviado exitosamente');
    res.status(200).json({ message: 'Correo enviado exitosamente' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
  }
});

// Integrar el servicio de Payoneer
// app.use('/api/payoneer', payoneerRouter);
// Datos iniciales para WhatsApp
const userData = {};
const initialTemplates = {
  bienvenida: {
    nombre: 'Mensaje de Bienvenida',
    mensajeInicial: 'Hola Bienvenido a Poseidon! Ya puedes comenzar a Jugar! Elige tu opción.',
    respuestas: [
      {
        texto: 'Quiero Registrarme',
        desencadenador: 'registro',
      },
      {
        texto: 'Quiero cargar Créditos/Fichas',
        desencadenador: 'cargarCredito',
      },
      {
        texto: 'Texto Personalizado',
        desencadenador: 'textoPersonalizado',
      },
      {
        texto: '¿Cuáles son los términos y condiciones?',
        desencadenador: 'Link',
      },
    ],
  },
};
const desencadenadoresDetalles = {
  registro: ['Nombre y Apellido', 'Correo Electrónico', 'Whatsapp'],
  cargarCredito: ['Monto a cargar', 'Método de pago'],
  textoPersonalizado: ['Texto del mensaje'],
  Link: ['Enlace a Políticas de Privacidad'],
};

// Normalización de texto
const normalizeText = (text) => {
  return diacritics.remove(text).toLowerCase();
};

// Webhook de WhatsApp
app.post('/webhook', (req, res) => {
  console.log('Encabezados:', req.headers);
  console.log('Cuerpo recibido:', req.body);

  const { From, Body } = req.body;

  if (!From || !Body) {
    console.error('Datos incompletos recibidos en el mensaje');
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  console.log(`Mensaje recibido de ${From}: ${Body}`);

  let respuestaBot = '';
  const userMessage = normalizeText(Body);
  console.log('userMessage:', userMessage);

  if (!userData[From]) {
    if (userMessage === 'hola' || userMessage === 'start') {
      respuestaBot = `Hola Bienvenido a Poseidon! Ya puedes comenzar a Jugar! Elige tu opción:

1 - Quiero Registrarme
2 - Quiero Cargar Créditos/Fichas
3 - Texto Personalizado
4 - ¿Cuáles son los términos y condiciones?`;

      sendMessageToUser(From, respuestaBot);
      userData[From] = { step: undefined }; // Inicializar el estado del usuario
    }
  } else {
    const userStep = userData[From]?.step;
    console.log('userStep:', userStep);

    if (userMessage === '1' && !userStep) {
      userData[From] = { step: 'name' };
      respuestaBot = 'Por favor, ingresa tu nombre:';
      sendMessageToUser(From, respuestaBot);
    } else if (userMessage === '1' && userStep) {
      respuestaBot = 'Ya has iniciado el registro. Por favor, ingresa el siguiente dato.';
      sendMessageToUser(From, respuestaBot);
    } else if (userStep === 'name') {
      userData[From].name = Body;
      userData[From].step = 'lastName';
      respuestaBot = 'Gracias. Ahora, por favor ingresa tu apellido:';
      sendMessageToUser(From, respuestaBot);
    } else if (userStep === 'lastName') {
      userData[From].lastName = Body;
      userData[From].step = 'email';
      respuestaBot = 'Perfecto. Ahora, por favor ingresa tu correo electrónico:';
      sendMessageToUser(From, respuestaBot);
    } else if (userStep === 'email') {
      userData[From].email = Body;
      userData[From].step = 'whatsapp';
      respuestaBot = `Gracias, ahora tomaremos este número de WhatsApp: ${From}. ¿Es correcto? Responde con "sí" para confirmar o "no" para modificarlo.`;
      sendMessageToUser(From, respuestaBot);
    } else if (userStep === 'whatsapp') {
      const normalizedResponse = normalizeText(Body);

      if (normalizedResponse === 'sí' || normalizedResponse === 'si') {
        userData[From].whatsappConfirmed = true;
        userData[From].step = 'done';
        respuestaBot = '¡Tu usuario ha sido registrado exitosamente!';
        sendMessageToUser(From, respuestaBot);
      } else if (normalizedResponse === 'no') {
        respuestaBot = 'Por favor, ingresa el número correcto de WhatsApp:';
        sendMessageToUser(From, respuestaBot);
      } else {
        respuestaBot = 'Respuesta no válida. Por favor responde con "sí" o "no".';
        sendMessageToUser(From, respuestaBot);
      }
    } else {
      respuestaBot = 'Mensaje no reconocido. Por favor, selecciona una opción válida.';
      sendMessageToUser(From, respuestaBot);
    }
  }

  res.status(200).json({ message: 'Respuesta enviada correctamente' });
});


// Función para enviar mensajes a través de Twilio
const sendMessageToUser = (to, message) => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    })
    .then((message) => {
      console.log('Mensaje enviado:', message.sid);
    })
    .catch((error) => {
      console.error('Error al enviar mensaje:', error);
    });
};



// Servidor
const jwt = require("jsonwebtoken");

app.get("/api/mercadopago/callback", async (req, res) => {
  const { code, state } = req.query;

  console.log("Callback recibido con parámetros:", { code, state });

  if (!code || !state) {
    console.error("Faltan parámetros: code o state");
    return res.status(400).json({ error: "Faltan parámetros (code o state)" });
  }

  try {
    // Verificar y decodificar el token `state`
    console.log("Decodificando el token `state`...");
    const decodedState = jwt.verify(state, process.env.JWT_SECRET);
    const userId = decodedState.userId;
    console.log("Token `state` validado. Usuario ID:", userId);

    // Solicitar el token de Mercado Pago
    console.log("Solicitando token de Mercado Pago...");
    console.log("Parámetros enviados a Mercado Pago:");
    console.log({
      grant_type: "authorization_code",
      client_id: process.env.MP_CLIENT_ID,
      client_secret: process.env.MP_CLIENT_SECRET,
      redirect_uri: process.env.MP_REDIRECT_URI,
      code,
    });
    const response = await axios.post(
      "https://api.mercadopago.com/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: "275793137258734",
        client_secret: "xzoghtz7AINHIGA1ZOzyDBEaJYW8iXjV",
        redirect_uri: "https://gestion-smart.com/vinculate/mercadopago/callback",
        code,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, refresh_token, user_id, expires_in } = response.data;

    console.log("Tokens obtenidos de Mercado Pago:", response.data);

    // Verificar el usuario en la base de datos
    console.log("Verificando usuario en la base de datos...");
    const user = await User.findById(userId);
    if (!user) {
      console.error("Usuario no encontrado en la base de datos.");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.log("Usuario encontrado:", user.email);

    // Actualizar la billetera en la base de datos
    console.log("Actualizando la billetera del usuario...");
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "wallet.mercadoPago": {
            accessToken: access_token,
            refreshToken: refresh_token,
            userId: user_id,
            expiresIn: expires_in,
            linkedAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    console.log("Billetera vinculada exitosamente para el usuario:", userId);

    res.status(200).json({
      redirectUrl: "https://gestion-smart.com/apps/wallet/vinculate?success=true",
    });
  } catch (error) {
    console.error("Error en el procesamiento del callback:", error.message);

    res.status(500).json({
      redirectUrl: "https://gestion-smart.com/apps/wallet/vinculate?success=false",
      error: error.response?.data || error.message,
    });
  }
});


app.get("/api/mercadopago/wallet-status", async (req, res) => {
  console.log("Solicitud a wallet-status recibida:", req.headers);

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.error("Token de autorización faltante");
    return res.status(401).json({ error: "Token de autorización faltante" });
  }

  try {
    const token = authHeader.split(" ")[1];
    console.log("Token recibido:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decodificado:", decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.error("Usuario no encontrado");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!user.wallet || !user.wallet.mercadoPago) {
      console.error("Wallet no vinculada");
      return res.status(404).json({ error: "Wallet no vinculada" });
    }

    console.log("Estado de wallet:", user.wallet.mercadoPago);
    res.status(200).json({ walletStatus: user.wallet.mercadoPago });
  } catch (error) {
    console.error("Error al verificar el estado de la wallet:", error.message);
    res.status(500).json({ error: error.message });
  }
});
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});