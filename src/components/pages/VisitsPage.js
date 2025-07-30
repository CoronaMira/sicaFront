import React, { useState, useEffect, useRef } from 'react';
import {
    User, UserCheck, ShieldCheck, Camera, CalendarClock, Search, ClipboardList, CheckSquare
} from 'lucide-react';

// --- Función para convertir Base64 a Blob ---
const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// --- Service para la API ---
// Todas las funciones ahora apuntan a la API real.
const apiService = {
    // --- Configuración Centralizada ---
    baseUrl: 'http://localhost:8080/api',
    apiKey: '686a8466-e810-4405-b173-8f24cdbd0126',

    // --- FUNCIÓN REAL para crear una visita ---
    addVisitor: async (visitorDataWithPhoto) => {
        const url = `${apiService.baseUrl}/visits`;
        try {
            const { visitorPhoto, ...visitDetails } = visitorDataWithPhoto;
            const formData = new FormData();
            const visitJson = JSON.stringify({
                ...visitDetails,
                status: 'PENDIENTE'
            });
            formData.append('visit', visitJson);
            if (visitorPhoto) {
                formData.append('photo', dataURLtoBlob(visitorPhoto), 'visitor-photo.png');
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'X-API-KEY': apiService.apiKey },
                body: formData,
            });
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Error en addVisitor:", error);
            throw error;
        }
    },

    // --- FUNCIÓN REAL para obtener visitas pendientes ---
    getPendingVisits: async () => {
        const url = `${apiService.baseUrl}/visits?status=PENDING`;
        try {
            const response = await fetch(url, {
                headers: { 'X-API-KEY': apiService.apiKey }
            });
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Error en getPendingVisits:", error);
            throw error;
        }
    },

    // --- FUNCIÓN REAL para autorizar una visita ---
    authorizeVisit: async (visitId) => {
        // Asumiendo un endpoint PUT para autorizar, una práctica REST común.
        const url = `${apiService.baseUrl}/visits/${visitId}/authorize`;
        try {
            const response = await fetch(url, {
                method: 'PUT', // o 'PATCH'
                headers: { 'X-API-KEY': apiService.apiKey }
            });
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Error en authorizeVisit:", error);
            throw error;
        }
    },

    // --- FUNCIÓN REAL para buscar visitas ---
    searchVisits: async ({ q, start, end }) => {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (start) params.append('startDate', start);
        if (end) params.append('endDate', end);
        const url = `${apiService.baseUrl}/visits?${params.toString()}`;
        try {
            const response = await fetch(url, {
                headers: { 'X-API-KEY': apiService.apiKey }
            });
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Error en searchVisits:", error);
            throw error;
        }
    },
};

// --- Componentes genéricos de UI ---
const FormCard = ({ title, icon: Icon, children }) => (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"><div className="p-6 md:p-8">
        <div className="flex items-center space-x-3 mb-6"><Icon className="h-7 w-7 text-blue-500" /><h2 className="text-2xl font-bold text-gray-700">{title}</h2></div>
        {children}
    </div></div>
);
const InputField = ({ name, label, type = "text", icon: Icon, value, onChange, placeholder = "", required=true }) => (
    <div><label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label><div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="h-5 w-5 text-gray-400" /></div>
        <input id={name} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
    </div></div>
);

// --- Sub-página de Registro (con Fetch real) ---
const RegisterVisitorSubPage = () => {
    const [formData, setFormData] = useState({ visitorName: '', visitDatetime: '', personVisited: '', visitorPhoto: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    useEffect(() => {
        let stream = null;
        const startStream = async () => {
            if (isCameraOpen) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    setMessage({ type: 'error', text: 'No se pudo acceder a la cámara. Revisa los permisos.' });
                    setIsCameraOpen(false);
                }
            }
        };
        startStream();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isCameraOpen]);

    const handleOpenCamera = () => {
        setCapturedImage(null);
        setMessage(null);
        setIsCameraOpen(true);
    };

    const handleCloseCamera = () => setIsCameraOpen(false);

    const handleTakePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageDataUrl = canvas.toDataURL('image/png');
            setCapturedImage(imageDataUrl);
            setFormData({ ...formData, visitorPhoto: imageDataUrl });
            handleCloseCamera();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!capturedImage) {
            setMessage({ type: 'error', text: 'Por favor, toma una fotografía del visitante.' });
            return;
        }
        setIsLoading(true);
        setMessage(null);
        try {
            await apiService.addVisitor(formData);
            setMessage({ type: 'success', text: 'Visitante registrado con éxito. Pendiente de autorización.' });
            setFormData({ visitorName: '', visitDatetime: '', personVisited: '', visitorPhoto: '' });
            setCapturedImage(null);
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Error al registrar la solicitud.' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <>
            <FormCard title="Registrar una Visita" icon={ClipboardList}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField name="visitorName" label="Nombre Completo del Visitante" icon={User} value={formData.visitorName} onChange={handleChange} />
                    <InputField name="visitDatetime" label="Fecha y Hora de la Visita" type="datetime-local" icon={CalendarClock} value={formData.visitDatetime} onChange={handleChange} />
                    <InputField name="personVisited" label="Persona a Quien Visita" icon={UserCheck} value={formData.personVisited} onChange={handleChange} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fotografía del Visitante</label>
                        {capturedImage ? (
                            <div className="text-center">
                                <img src={capturedImage} alt="Captura del visitante" className="mx-auto border-4 rounded-lg w-48 h-auto" />
                                <button type="button" onClick={handleOpenCamera} className="mt-2 text-sm text-blue-600 hover:underline">Tomar Otra Foto</button>
                            </div>
                        ) : (
                            <button type="button" onClick={handleOpenCamera} className="w-full flex items-center justify-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md border-2 border-dashed hover:bg-gray-200">
                                <Camera className="mr-2 h-5 w-5" /> Abrir Cámara y Tomar Foto
                            </button>
                        )}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>
                    {message && <div className={`p-3 rounded-md text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{message.text}</div>}
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isLoading ? 'Registrando...' : 'Registrar Visitante'}
                    </button>
                </form>
            </FormCard>
            {isCameraOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-xl text-center max-w-lg w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Apunta a la cara del visitante</h3>
                        <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md border" />
                        <div className="mt-4 flex justify-center space-x-4">
                            <button type="button" onClick={handleTakePhoto} className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700">Tomar Foto</button>
                            <button type="button" onClick={handleCloseCamera} className="bg-gray-300 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-400">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// --- Sub-página de Autorización ---
const AuthorizationSubPage = () => {
    const [pendingVisits, setPendingVisits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPending = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.getPendingVisits();
            setPendingVisits(data);
        } catch (err) {
            setError('No se pudieron cargar las visitas pendientes.');
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => { fetchPending(); }, []);

    const handleAuthorize = async (visitId) => {
        try {
            await apiService.authorizeVisit(visitId);
            fetchPending(); // Recarga la lista después de autorizar
        } catch (err) {
            alert('Error al autorizar la visita.');
        }
    }

    if (isLoading) return <div className="text-center p-4">Cargando visitas pendientes...</div>;
    if (error) return <div className="text-center p-4 text-red-500">{error}</div>

    return (
        <FormCard title="Autorizar Visitas Pendientes" icon={CheckSquare}><div className="space-y-4">
            {pendingVisits.length > 0 ? pendingVisits.map(visit => (
                <div key={visit.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                    <div>
                        <p className="font-bold">{visit.visitorName}</p>
                        <p className="text-sm text-gray-600">Visita a: {visit.personVisited}</p>
                        <p className="text-sm text-gray-600">Fecha: {new Date(visit.visitDatetime).toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleAuthorize(visit.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Autorizar</button>
                </div>
            )) : <p className="text-center text-gray-500">No hay visitas pendientes de autorización.</p>}
        </div></FormCard>
    );
};

// --- Sub-página de Consulta ---
const ConsultationSubPage = () => {
    const [visits, setVisits] = useState([]);
    const [search, setSearch] = useState({ query: '', startDate: '', endDate: '' });
    const [selected, setSelected] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (params = search) => {
        setIsLoading(true);
        setSelected(null);
        try {
            const results = await apiService.searchVisits({q: params.query, start: params.startDate, end: params.endDate});
            setVisits(results);
        } catch (err) {
            alert('Error al buscar visitas');
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => { handleSearch(); }, []);

    const handleChange = e => setSearch({...search, [e.target.name]: e.target.value});
    const handleFormSubmit = e => { e.preventDefault(); handleSearch(); }

    return (
        <FormCard title="Consultar Visitas" icon={Search}>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <InputField name="query" label="Buscar por Nombre o Folio" icon={Search} value={search.query} onChange={handleChange} required={false} />
                <InputField name="startDate" label="Desde" type="date" icon={CalendarClock} value={search.startDate} onChange={handleChange} required={false}/>
                <InputField name="endDate" label="Hasta" type="date" icon={CalendarClock} value={search.endDate} onChange={handleChange} required={false}/>
                <button type="submit" className="md:col-span-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md">Buscar</button>
            </form>
            <div className="space-y-2">
                {isLoading ? <p className="text-center">Buscando...</p> : visits.length > 0 ? visits.map(v => (
                    <div key={v.id} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => setSelected(v)}>
                        <p className="font-bold">{v.visitorName} - <span className={`text-sm font-semibold ${v.status === 'AUTORIZADO' ? 'text-green-600' : 'text-orange-500'}`}>{v.status}</span></p>
                        <p className="text-sm text-gray-500">Fecha: {new Date(v.visitDatetime).toLocaleString()}</p>
                    </div>
                )) : <p className="text-center">No se encontraron visitas para los criterios de búsqueda.</p>}
            </div>
            {selected && <div className="mt-6 p-6 border-t">
                <h3 className="text-xl font-semibold mb-4">Detalle de la Visita</h3>
                <p><strong>Visitante:</strong> {selected.visitorName}</p>
                <p><strong>Fecha y Hora:</strong> {new Date(selected.visitDatetime).toLocaleString()}</p>
                <p><strong>Visita a:</strong> {selected.personVisited}</p>
                <p><strong>Estado:</strong> {selected.status}</p>
                {selected.authorizedBy && <p><strong>Autorizado por:</strong> {selected.authorizedBy}</p>}
                {selected.qrCodeBase64 && <div className="mt-4 text-center"><h4 className="font-semibold">Código QR</h4><img src={`data:image/png;base64,${selected.qrCodeBase64}`} alt="QR" className="mx-auto mt-2 border-4 rounded-lg w-48"/></div>}
            </div>}
        </FormCard>
    );
};


// --- Componente Principal de la Página ---
const VisitsPage = () => {
    const [activeView, setActiveView] = useState('registro');
    const renderView = () => {
        switch (activeView) {
            case 'registro': return <RegisterVisitorSubPage />;
            case 'autorizacion': return <AuthorizationSubPage />;
            case 'consulta': return <ConsultationSubPage />;
            default: return <RegisterVisitorSubPage />;
        }
    };
    return (
        <div className="w-full">
            <div className="bg-white p-4 shadow-md rounded-lg">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Módulo de Gestión de Visitas</h1>
                <div className="flex border-b">
                    <button onClick={() => setActiveView('registro')} className={`py-2 px-4 ${activeView === 'registro' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Registro</button>
                    <button onClick={() => setActiveView('autorizacion')} className={`py-2 px-4 ${activeView === 'autorizacion' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Autorización</button>
                    <button onClick={() => setActiveView('consulta')} className={`py-2 px-4 ${activeView === 'consulta' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Consulta</button>
                </div>
                <div className="pt-6">{renderView()}</div>
            </div>
        </div>
    );
};

export default VisitsPage;
