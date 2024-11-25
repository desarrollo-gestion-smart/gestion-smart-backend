const jwt = require('jsonwebtoken');

// Middleware de autenticación JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.state;
    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado, token no proporcionado.' });
    }

    try {
        // Verificar el token y decodificarlo
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta'); // Cambia 'tu_clave_secreta' por la clave secreta real
        req.user = decoded;  // Almacenar la información del usuario en `req.user`
        next();  // Llamar al siguiente middleware
    } catch (error) {
        return res.status(403).json({ message: 'Token no válido o expirado.' });
    }
};

module.exports = authenticateJWT;
