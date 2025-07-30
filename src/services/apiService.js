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
    visits: [
        { id: 2, visitorName: 'Luis Martinez', visitDatetime: '2025-08-02T11:30:00', personVisited: 'Lic. Maria Rodriguez', visitorPhotoUrl: 'http://example.com/photos/luis.jpg', status: 'AUTORIZADO', authorizedBy: 'Seguridad', qrFolio: 'f4b1e6a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6AQAAAACgl2eQAAABcElEQVR4Xu2YUYrDMAxEDT5Aj5Sr+0g5gEGrN3JKk4V+d8BDutjy68cgS0q3xXeN9ow8tIHSBkobKG2g9DvAbCh3sx09Y6/B/uUGsB7zNeIkzmIFvQCssZDNjt9mCihImrBsC8R5sCFfpgDLzFTety7+CloBVDuZej/s3YCls1Eyir9lBGATa1n70fPK5eJkbQaQoHjXi5rYcb+TBkAWfpNTaj+PdPpp0wJQ4ZCdqb+Jxf9s/jwAszI1OpYPDUdHIDJeZNbO5EXFDSA1jEUGCqcjr9/NpgWwZuKg8Fcr4PECVO8jF12tmD7McHEDyA53jNpR1egrdkBUpj7n+92mB9BJGR7j8ugJVMmogzFfdGAFlKZyVB4fV84CKF9z9S768HwkywLA0Qj9JM+HVlDvKmaArLWs/cBvftSZPYEjj4KZgsf2eeWMAL26ayAuy24Ay6lWDHz9n8EMaAiA0wyNTh2ZAV+0gdIGShsobaDkAfwBvfpmGuBlAIMAAAAASUVORK5CYII=' },
    ],
    currentUser: { name: 'Admin General', role: 'Administrador' },
    getPendingVisits: async () => new Promise(res => setTimeout(() => res(apiService.visits.filter(v => v.status === 'PENDIENTE')), 300)),
    authorizeVisit: async (id) => new Promise(res => setTimeout(() => { const v = apiService.visits.find(i => i.id === id); if(v) { v.status = 'AUTORIZADO'; v.authorizedBy = apiService.currentUser.name; v.qrFolio = crypto.randomUUID(); v.qrCodeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6AQAAAACgl2eQAAABcElEQVR4Xu2YUYrDMAxEDT5Aj5Sr+0g5gEGrN3JKk4V+d8BDutjy68cgS0q3xXeN9ow8tIHSBkobKG2g9DvAbCh3sx09Y6/B/uUGsB7zNeIkzmIFvQCssZDNjt9mCihImrBsC8R5sCFfpgDLzFTety7+CloBVDuZej/s3YCls1Eyir9lBGATa1n70fPK5eJkbQaQoHjXi5rYcb+TBkAWfpNTaj+PdPpp0wJQ4ZCdqb+Jxf9s/jwAszI1OpYPDUdHIDJeZNbO5EXFDSA1jEUGCqcjr9/NpgWwZuKg8Fcr4PECVO8jF12tmD7McHEDyA53jNpR1egrdkBUpj7n+92mB9BJGR7j8ugJVMmogzFfdGAFlKZyVB4fV84CKF9z9S768HwkywLA0Qj9JM+HVlDvKmaArLWs/cBvftSZPYEjj4KZgsf2eeWMAL26ayAuy24Ay6lWDHz9n8EMaAiA0wyNTh2ZAV+0gdIGShsobaDkAfwBvfpmGuBlAIMAAAAASUVORK5CYII='; res(v); } }, 500)),
    searchVisits: async ({ q, start, end }) => new Promise(res => setTimeout(() => {
        let r = apiService.visits;
        if(q) r = r.filter(v => v.visitorName.toLowerCase().includes(q.toLowerCase()) || v.qrFolio === q);
        if(start) r = r.filter(v => new Date(v.visitDatetime) >= new Date(start));
        if(end) r = r.filter(v => new Date(v.visitDatetime) <= new Date(end));
        res(r);
    }, 400)),

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
        const apiKey = '686a8466-e810-4405-b173-8f24cdbd0126';

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
                const errorData = await response.text();
                throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
            }

            return await response.json();

        } catch (error) {
            console.error("Error al realizar la llamada fetch a addVisitor:", error);
            throw error;
        }
    },
};
