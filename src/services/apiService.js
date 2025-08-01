// --- Service para API de datos ---
// Este archivo contiene toda la lógica para comunicarse con los endpoints de la API.

export const apiService = {
    /**
     * Función auxiliar privada para realizar llamadas fetch con configuración común.
     * @param {string} url - La URL del endpoint.
     * @param {object} options - Opciones adicionales para la llamada fetch (method, body, etc.).
     * @returns {Promise<any>} - La respuesta JSON de la API.
     */
    _fetch: async function(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'X-API-KEY': '686a8466-e810-4405-b173-8f24cdbd0126',
            ...options.headers,
        };

        try {
            const response = await fetch(url, { ...options, headers });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error en la respuesta del servidor.' }));
                throw new Error(errorData.message || `Error en la API: ${response.statusText}`);
            }
            return response.json();
        } catch (error) {
            console.error(`Error en la llamada fetch a ${url}:`, error);
            throw error; // Re-lanzamos el error para que el componente que llama pueda manejarlo.
        }
    },

    /**
     * Obtiene la lista completa de personas.
     */
    getAllPersons: function() {
        const url = 'http://localhost:8080/api/persons';
        return this._fetch(url);
    },

    /**
     * Obtiene todos los registros de acceso (entradas/salidas).
     */
    getAccessLogs: function() {
        const url = 'http://localhost:8080/api/attendance-records';
        return this._fetch(url).then(data => Array.isArray(data) ? data : [data]);
    },

    /**
     * Obtiene el reporte de faltas para una persona en un rango de fechas.
     */
    getAbsences: function({ personId, startDate, endDate }) {
        const url = new URL(`http://localhost:8080/api/v1/incidents/absences/person/${personId}`);
        url.searchParams.append('startDate', startDate);
        url.searchParams.append('endDate', endDate);
        return this._fetch(url.toString());
    },

    /**
     * Obtiene el reporte de retardos para una persona en un rango de fechas.
     */
    getTardiness: function({ personId, startDate, endDate }) {
        const url = new URL(`http://localhost:8080/api/v1/incidents/tardiness/person/${personId}`);
        url.searchParams.append('startDate', startDate);
        url.searchParams.append('endDate', endDate);
        return this._fetch(url.toString());
    },

    /**
     * Registra una justificación de falta para una persona.
     */
    justifyAbsence: function(justificationData) {
        const url = 'http://localhost:8080/api/attendance-records';
        return this._fetch(url, {
            method: 'POST',
            body: JSON.stringify(justificationData),
        });
    },

    
};
