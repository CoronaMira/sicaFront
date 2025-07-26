import React, { useState, useEffect } from 'react';
// Asumimos que los componentes de UI existen en estas rutas.
// import FormCard from 'components/commons/FormCard';
import { Fingerprint } from 'lucide-react';
// import 'assets/styles/RegisterFingerprintPage.css';

// --- Mock Component for Demonstration ---
// Este es un componente simulado para que el ejemplo sea funcional.
// En tu proyecto, deberías usar tu componente real.
const FormCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-lg mx-auto text-center">
        <div className="flex items-center justify-center text-gray-800 mb-6">
            <Icon className="w-8 h-8 mr-3 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        </div>
        {children}
    </div>
);


const RegisterFingerprintPage = () => {
    const [personnel, setPersonnel] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, capturing, success, error
    const [message, setMessage] = useState('');

    // useEffect para cargar el personal desde el backend
    useEffect(() => {
        const fetchPersonnel = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/persons', {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-KEY': '3f628144-7c26-45dd-9b7d-62d5f0b1320a',
                    },
                });

                if (!response.ok) {
                    throw new Error('No se pudo obtener la lista de personal.');
                }

                const data = await response.json();
                setPersonnel(data);
            } catch (error) {
                console.error("Error fetching personnel:", error);
                setMessage('Error al cargar la lista de personal.');
                setScanStatus('error');
            }
        };

        fetchPersonnel();
    }, []);

    const handleScan = () => {
        if (!selectedUser) {
            setScanStatus('error');
            setMessage('Por favor, seleccione una persona para registrar su huella.');
            setTimeout(() => {
                setScanStatus('idle');
                setMessage('');
            }, 3000);
            return;
        }

        // 1. Estado inicial de escaneo (azul)
        setScanStatus('scanning');
        setMessage('Coloque el dedo en el sensor...');

        // 2. Cambia a estado "capturando" (amarillo) después de 1.5 segundos
        setTimeout(() => {
            setScanStatus('capturing');
            setMessage('Capturando huella...');

            // 3. Simula el resultado final después de 2 segundos
            setTimeout(() => {
                const isSuccess = Math.random() > 0.1; // 90% de éxito
                if (isSuccess) {
                    setScanStatus('success');
                    setMessage('Huella capturada correctamente.');
                } else {
                    setScanStatus('error');
                    setMessage('Error de escaneo. Por favor, intente de nuevo.');
                }

                // 4. Resetea todo para un nuevo escaneo
                setTimeout(() => {
                    setScanStatus('idle');
                    setMessage('');
                    setSelectedUser('');
                }, 4000); // Muestra el mensaje final por 4 segundos

            }, 2000); // Duración de la captura

        }, 1500); // Tiempo para colocar el dedo
    };

    const getStatusColorClass = () => {
        switch (scanStatus) {
            case 'scanning': return 'text-blue-500 animate-pulse';
            case 'capturing': return 'text-yellow-500 animate-pulse'; // Estado intermedio
            case 'success': return 'text-green-500';
            case 'error': return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="page-container bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
            <FormCard title="Registro de Huella Digital" icon={Fingerprint}>
                <div className="fingerprint-content flex flex-col items-center gap-6 w-full">
                    <div className="w-full">
                        <label htmlFor="user-select" className="input-label block text-lg font-semibold mb-2 text-gray-300">Seleccionar Persona</label>
                        <select
                            id="user-select"
                            className="select-element w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            disabled={scanStatus !== 'idle'}
                        >
                            <option value="">-- Seleccione un usuario --</option>
                            {personnel.map(p => (
                                <option key={p.id} value={p.id}>
                                    {`${p.firstName} ${p.lastName} ${p.middleName || ''}`.trim()} - {p.type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="scan-area flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-full w-48 h-48">
                        <Fingerprint className={`scan-icon w-24 h-24 transition-colors duration-300 ${getStatusColorClass()}`} />
                    </div>
                    <p className={`scan-message h-6 text-lg font-medium transition-colors duration-300 ${getStatusColorClass()}`}>
                        {scanStatus === 'idle' ? 'Esperando para escanear' : message}
                    </p>
                    <button
                        onClick={handleScan}
                        disabled={scanStatus !== 'idle'}
                        className="submit-button w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        {scanStatus === 'idle' ? 'Iniciar Escaneo' : 'Escaneando...'}
                    </button>
                </div>
            </FormCard>
        </div>
    );
};

export default RegisterFingerprintPage;
