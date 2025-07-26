// --- Mock Service para Autenticación (Modelo) ---
export const authService = {
    users: [
        { id: 1, username: 'admin', password: '123', name: 'Admin General', role: 'Administrador' },
        { id: 2, username: 'j.perez', password: '123', name: 'Juan Perez', role: 'Profesor' },
        { id: 3, username: 'a.gomez', password: '123', name: 'Ana Gomez', role: 'Estudiante' },
    ],
    login: async (username, password) => {
        console.log(`Intentando iniciar sesión con: ${username}`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = authService.users.find(u => u.username === username && u.password === password);
                if (user) {
                    console.log("Usuario encontrado:", user);
                    resolve(user);
                } else {
                    console.log("Credenciales inválidas");
                    reject('Usuario o contraseña incorrectos.');
                }
            }, 500);
        });
    },
    logout: async () => {
        console.log("Cerrando sesión");
        return new Promise(resolve => setTimeout(resolve, 300));
    }
};
