const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    country: { type: String },
    status: { type: String, enum: ['active', 'inactive'] },
    whatsapp: { type: String, required: false }, // Campo para el número de WhatsApp
    wallet: {
        mercadoPago: {
            accessToken: { type: String },
            refreshToken: { type: String },
            userId: { type: String },
            expiresIn: { type: Number },
            linkedAt: { type: Date },
        },
    },
});

// Middleware para cifrar la contraseña antes de guardar el usuario
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
