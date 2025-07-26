// --- Service para API de datos ---
export const apiService = {
    // --- Mocks para otras partes de la aplicación (se mantienen igual) ---
    universityPersonnel: [
        { id: 101, name: 'Dr. Carlos Santana', role: 'Rector', registrationDate: '2023-01-15' },
        { id: 102, name: 'Lic. Maria Rodriguez', role: 'Coordinadora Académica', registrationDate: '2023-02-20' },
    ],
    accessLogs: [
        { id: 1, userId: 2, userName: 'Juan Perez', date: '2024-07-26', time: '08:01:15', accessPoint: 'Entrada Principal', status: 'Concedido' },
    ],
    getPersonnel: async () => {
        return new Promise(resolve => setTimeout(() => resolve([...apiService.universityPersonnel]), 300));
    },
    addPersonnel: async (person) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newPerson = { ...person, id: Date.now(), registrationDate: new Date().toISOString().split('T')[0] };
                apiService.universityPersonnel.push(newPerson);
                resolve(newPerson);
            }, 500);
        });
    },
    getVisitors: async () => {
        // Esta lista ahora se manejará desde el backend, pero mantenemos el mock por si se usa en otra parte.
        const mockVisitors = [{ id: 201, name: 'CONGRESO-24-1', reason: 'Congreso de IA', validUntil: '2024-10-30' }];
        return new Promise(resolve => setTimeout(() => resolve(mockVisitors), 300));
    },
    getAccessLogs: async () => {
        return new Promise(resolve => setTimeout(() => resolve([...apiService.accessLogs]), 300));
    },

    // --- Función Actualizada para Registrar Visitantes (Llamada Real a la API) ---
    addVisitor: async (visitorData) => {
        const url = 'http://localhost:8080/api/visits';
        const apiKey = '652acf78-4544-4b51-9d6f-ebd6e49dea86';

        console.log("Enviando datos a la API real:", visitorData);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey,
                },
                body: JSON.stringify(visitorData),
            });

            if (!response.ok) {
                // Si la respuesta no es exitosa, capturamos el error.
                const errorData = await response.text();
                throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
            }

            // Si la respuesta es exitosa, la convertimos a JSON.
            // Tu backend debería devolver el objeto de la visita creada, incluyendo el QR.
            return await response.json();

        } catch (error) {
            console.error("Error al realizar la llamada fetch a addVisitor:", error);
            // Re-lanzamos el error para que el componente (el formulario) pueda capturarlo y mostrar un mensaje.
            throw error;
        }
    },
};
