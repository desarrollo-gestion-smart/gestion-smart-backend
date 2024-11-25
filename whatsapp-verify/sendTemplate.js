app.get('/template', (req, res) => {
    const template = {
        title: "Mensaje de bienvenida",
        responses: [
            {
                id: 1,
                responseText: "Quiero registrarme",
                triggers: [
                    { id: 1, name: "nombre" },
                    { id: 2, name: "apellido" },
                    { id: 3, name: "correo electrónico" }
                ]
            },
            {
                id: 2,
                responseText: "Quiero cargar crédito/ fichas",
                triggers: [
                    { id: 1, name: "monto de carga" },
                    { id: 2, name: "link de pago" }
                ]
            },
            {
                id: 3,
                responseText: "Cuáles son los términos y condiciones",
                triggers: [
                    { id: 1, name: "link" }
                ]
            }
        ]
    };
    res.json(template);
});
