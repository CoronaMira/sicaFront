import React, { useState } from 'react';

import { apiService } from 'services/apiService';
import FormCard from 'components/commons/FormCard';
import InputField from 'components/commons/InputField';
import { Users, User, UserCheck, ShieldCheck, Camera, CalendarClock, QrCode } from 'lucide-react';
// Asumo que tienes un CSS para los estilos
// import 'assets/styles/Form.css';

const RegisterVisitorPage = () => {
    // Estado inicial del formulario con todos los campos requeridos por el backend
    const [formData, setFormData] = useState({
        visitorName: '',
        visitDatetime: '',
        personVisited: '',
        authorizedBy: '',
        visitorPhotoUrl: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [qrCodeImage, setQrCodeImage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setQrCodeImage(null);
        try {
            const responseData = await apiService.addVisitor(formData);
            setMessage({ type: 'success', text: 'Visitante registrado con éxito.' });

            if (responseData && responseData.qrCodeBase64) {
                setQrCodeImage(responseData.qrCodeBase64);
            }
            // Limpiar el formulario después del éxito
            setFormData({
                visitorName: '',
                visitDatetime: '',
                personVisited: '',
                authorizedBy: '',
                visitorPhotoUrl: ''
            });
        } catch (err) {
            setMessage({ type: 'error', text: 'Error al registrar al visitante.' });
        } finally {
            setIsLoading(false);
            // Ocultar el mensaje después de 5 segundos
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <div className="page-container p-4 sm:p-6 md:p-8">
            <FormCard title="Alta de Visitantes Externos" icon={Users}>
                <form onSubmit={handleSubmit} className="form-body space-y-4">

                    <InputField
                        id="visitorName"
                        name="visitorName"
                        label="Nombre Completo del Visitante"
                        type="text"
                        placeholder="Ej: Juan Pérez"
                        icon={User}
                        value={formData.visitorName}
                        onChange={handleChange}
                    />

                    <InputField
                        id="visitDatetime"
                        name="visitDatetime"
                        label="Fecha y Hora de la Visita"
                        type="datetime-local"
                        placeholder=""
                        icon={CalendarClock}
                        value={formData.visitDatetime}
                        onChange={handleChange}
                    />

                    <InputField
                        id="personVisited"
                        name="personVisited"
                        label="Persona a Quien Visita"
                        type="text"
                        placeholder="Ej: Dra. Ana Torres"
                        icon={UserCheck}
                        value={formData.personVisited}
                        onChange={handleChange}
                    />

                    <InputField
                        id="authorizedBy"
                        name="authorizedBy"
                        label="Autorizado Por"
                        type="text"
                        placeholder="Ej: Recepción Principal"
                        icon={ShieldCheck}
                        value={formData.authorizedBy}
                        onChange={handleChange}
                    />

                    <InputField
                        id="visitorPhotoUrl"
                        name="visitorPhotoUrl"
                        label="URL de la Fotografía del Visitante"
                        type="text"
                        placeholder="http://example.com/foto.jpg"
                        icon={Camera}
                        value={formData.visitorPhotoUrl}
                        onChange={handleChange}
                    />

                    {message && (
                        <div className={`p-3 rounded-md text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="form-footer pt-4">
                        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                            {isLoading ? 'Registrando...' : 'Registrar Visitante'}
                        </button>
                    </div>
                </form>
                {qrCodeImage && (
                    <div className="mt-6 p-6 border-t border-gray-200 text-center bg-gray-50 rounded-b-xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
                            <QrCode className="h-6 w-6" />
                            Código QR de Acceso Generado
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            El visitante deberá mostrar este código para ingresar.
                        </p>
                        <div className="flex justify-center">
                            <img
                                src={`data:image/png;base64,${qrCodeImage}`}
                                alt="Código QR del Visitante"
                                className="border-4 border-white rounded-lg shadow-lg"
                                style={{ width: '220px', height: '220px' }}
                            />
                        </div>
                    </div>
                )}
            </FormCard>
        </div>
    );
};
export default RegisterVisitorPage;
