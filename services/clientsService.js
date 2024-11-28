const Client = require('../models/clients');

/**
 * Obtiene todos los clientes de la colección `clients`.
 * @returns {Promise<Array>} Lista de clientes.
 */
const getAllClients = async () => {
    try {
        const clients = await Client.find(); // Busca todos los documentos
        return clients;
    } catch (error) {
        throw new Error(`Error al obtener los clientes: ${error.message}`);
    }
};

module.exports = {
    getAllClients
};
