app.post('/api/users/register', async (req, res) => {
    console.log('Datos recibidos:', req.body);  // Asegúrate de que lleguen los datos

    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Verifica si los datos son correctos
        console.log('Recibí los siguientes datos:', { firstName, lastName, email, password });

        // Crear un nuevo usuario (Asegúrate de tener el modelo `User`)
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
        });

        // Guardar el usuario en la base de datos
        await newUser.save();
        res.status(201).json({ success: true, message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);  // Registra errores
        res.status(500).json({ success: false, message: 'Error registrando el usuario' });
    }
});
