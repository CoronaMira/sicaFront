import React, { useState, useEffect } from 'react';
import {
    User, UserCheck, ShieldCheck, Camera, CalendarClock, Search, ClipboardList, CheckSquare
} from 'lucide-react';

// Este mock simulará las llamadas a tu backend
const mockApiService = {
    visits: [
        { id: 1, visitorName: 'Ana Gomez', visitDatetime: '2025-08-01T14:00:00', personVisited: 'Dr. Carlos Santana', visitorPhotoUrl: 'http://example.com/photos/ana.jpg', status: 'PENDIENTE', authorizedBy: null, qrFolio: null, qrCodeBase64: null },
        { id: 2, visitorName: 'Luis Martinez', visitDatetime: '2025-08-02T11:30:00', personVisited: 'Lic. Maria Rodriguez', visitorPhotoUrl: 'http://example.com/photos/luis.jpg', status: 'AUTORIZADO', authorizedBy: 'Seguridad', qrFolio: 'f4b1e6a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6AQAAAACgl2eQAAABcElEQVR4Xu2YUYrDMAxEDT5Aj5Sr+0g5gEGrN3JKk4V+d8BDutjy68cgS0q3xXeN9ow8tIHSBkobKG2g9DvAbCh3sx09Y6/B/uUGsB7zNeIkzmIFvQCssZDNjt9mCihImrBsC8R5sCFfpgDLzFTety7+CloBVDuZej/s3YCls1Eyir9lBGATa1n70fPK5eJkbQaQoHjXi5rYcb+TBkAWfpNTaj+PdPpp0wJQ4ZCdqb+Jxf9s/jwAszI1OpYPDUdHIDJeZNbO5EXFDSA1jEUGCqcjr9/NpgWwZuKg8Fcr4PECVO8jF12tmD7McHEDyA53jNpR1egrdkBUpj7n+92mB9BJGR7j8ugJVMmogzFfdGAFlKZyVB4fV84CKF9z9S768HwkywLA0Qj9JM+HVlDvKmaArLWs/cBvftSZPYEjj4KZgsf2eeWMAL26ayAuy24Ay6lWDHz9n8EMaAiA0wyNTh2ZAV+0gdIGShsobaDkAfwBvfpmGuBlAIMAAAAASUVORK5CYII=' },
    ],
    currentUser: { name: 'Admin General', role: 'Administrador' },
    addVisitor: async (data) => new Promise(res => setTimeout(() => { const v = { ...data, id: Date.now(), status: 'PENDIENTE' }; mockApiService.visits.push(v); res(v); }, 500)),
    getPendingVisits: async () => new Promise(res => setTimeout(() => res(mockApiService.visits.filter(v => v.status === 'PENDIENTE')), 300)),
    authorizeVisit: async (id) => new Promise(res => setTimeout(() => { const v = mockApiService.visits.find(i => i.id === id); if(v) { v.status = 'AUTORIZADO'; v.authorizedBy = mockApiService.currentUser.name; v.qrFolio = crypto.randomUUID(); v.qrCodeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6AQAAAACgl2eQAAABcElEQVR4Xu2YUYrDMAxEDT5Aj5Sr+0g5gEGrN3JKk4V+d8BDutjy68cgS0q3xXeN9ow8tIHSBkobKG2g9DvAbCh3sx09Y6/B/uUGsB7zNeIkzmIFvQCssZDNjt9mCihImrBsC8R5sCFfpgDLzFTety7+CloBVDuZej/s3YCls1Eyir9lBGATa1n70fPK5eJkbQaQoHjXi5rYcb+TBkAWfpNTaj+PdPpp0wJQ4ZCdqb+Jxf9s/jwAszI1OpYPDUdHIDJeZNbO5EXFDSA1jEUGCqcjr9/NpgWwZuKg8Fcr4PECVO8jF12tmD7McHEDyA53jNpR1egrdkBUpj7n+92mB9BJGR7j8ugJVMmogzFfdGAFlKZyVB4fV84CKF9z9S768HwkywLA0Qj9JM+HVlDvKmaArLWs/cBvftSZPYEjj4KZgsf2eeWMAL26ayAuy24Ay6lWDHz9n8EMaAiA0wyNTh2ZAV+0gdIGShsobaDkAfwBvfpmGuBlAIMAAAAASUVORK5CYII='; res(v); } }, 500)),
    searchVisits: async ({ q, start, end }) => new Promise(res => setTimeout(() => {
        let r = mockApiService.visits;
        if(q) r = r.filter(v => v.visitorName.toLowerCase().includes(q.toLowerCase()) || v.qrFolio === q);
        if(start) r = r.filter(v => new Date(v.visitDatetime) >= new Date(start));
        if(end) r = r.filter(v => new Date(v.visitDatetime) <= new Date(end));
        res(r);
    }, 400)),
};

// --- Componentes genéricos de UI que puedes mover a /components/commons ---
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

// --- Sub-página de Registro ---
const RegisterVisitorSubPage = () => {
    const [formData, setFormData] = useState({ visitorName: '', visitDatetime: '', personVisited: '', visitorPhotoUrl: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault(); setIsLoading(true); setMessage(null);
        try {
            await mockApiService.addVisitor(formData);
            setMessage({ type: 'success', text: 'Solicitud de visita registrada. Pendiente de autorización.' });
            setFormData({ visitorName: '', visitDatetime: '', personVisited: '', visitorPhotoUrl: '' });
        } catch (err) { setMessage({ type: 'error', text: 'Error al registrar la solicitud.' }); }
        finally { setIsLoading(false); setTimeout(() => setMessage(null), 5000); }
    };
    return (
        <FormCard title="Registrar una Visita" icon={ClipboardList}><form onSubmit={handleSubmit} className="space-y-4">
            <InputField name="visitorName" label="Nombre Completo del Visitante" icon={User} value={formData.visitorName} onChange={handleChange} />
            <InputField name="visitDatetime" label="Fecha y Hora de la Visita" type="datetime-local" icon={CalendarClock} value={formData.visitDatetime} onChange={handleChange} />
            <InputField name="personVisited" label="Persona a Quien Visita" icon={UserCheck} value={formData.personVisited} onChange={handleChange} />
            <InputField name="visitorPhotoUrl" label="URL de la Fotografía del Visitante" icon={Camera} value={formData.visitorPhotoUrl} onChange={handleChange} />
            {message && <div className={`p-3 rounded-md text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{message.text}</div>}
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                {isLoading ? 'Enviando Solicitud...' : 'Enviar Solicitud de Visita'}
            </button>
        </form></FormCard>
    );
};

// --- Sub-página de Autorización ---
const AuthorizationSubPage = () => {
    const [pendingVisits, setPendingVisits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const fetchPending = () => {
        setIsLoading(true);
        mockApiService.getPendingVisits().then(data => { setPendingVisits(data); setIsLoading(false); });
    }
    useEffect(fetchPending, []);
    const handleAuthorize = async (visitId) => { await mockApiService.authorizeVisit(visitId); fetchPending(); }

    if (isLoading) return <div className="text-center">Cargando...</div>;
    return (
        <FormCard title="Autorizar Visitas Pendientes" icon={CheckSquare}><div className="space-y-4">
            {pendingVisits.length > 0 ? pendingVisits.map(visit => (
                <div key={visit.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                    <div><p className="font-bold">{visit.visitorName}</p><p className="text-sm text-gray-600">Visita a: {visit.personVisited}</p><p className="text-sm text-gray-600">Fecha: {new Date(visit.visitDatetime).toLocaleString()}</p></div>
                    <button onClick={() => handleAuthorize(visit.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Autorizar</button>
                </div>
            )) : <p className="text-center text-gray-500">No hay visitas pendientes.</p>}
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
        setIsLoading(true); setSelected(null);
        const results = await mockApiService.searchVisits({q: params.query, start: params.startDate, end: params.endDate});
        setVisits(results); setIsLoading(false);
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
                {isLoading ? <p>Buscando...</p> : visits.length > 0 ? visits.map(v => (
                    <div key={v.id} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => setSelected(v)}>
                        <p className="font-bold">{v.visitorName} - <span className={`text-sm font-semibold ${v.status === 'AUTORIZADO' ? 'text-green-600' : 'text-orange-500'}`}>{v.status}</span></p>
                        <p className="text-sm text-gray-500">Fecha: {new Date(v.visitDatetime).toLocaleString()}</p>
                    </div>
                )) : <p>No se encontraron visitas.</p>}
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
