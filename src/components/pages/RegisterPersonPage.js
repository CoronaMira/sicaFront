/*
* =============================================================================
* NOTA IMPORTANTE SOBRE EL ESTILO (CSS)
* =============================================================================
* Este componente utiliza Tailwind CSS para su diseño y apariencia.
* Si ves el formulario sin estilos, es porque Tailwind CSS no está 
* correctamente configurado en tu proyecto.
*
* SOLUCIÓN:
* 1. Asegúrate de haber instalado y configurado Tailwind CSS en tu proyecto
* siguiendo la guía oficial: https://tailwindcss.com/docs/installation
*
* 2. Para una prueba rápida, puedes añadir este script a tu archivo HTML principal:
* <script src="https://cdn.tailwindcss.com"></script>
*
* El código de React a continuación es correcto, solo necesita que Tailwind
* esté funcionando para que se vea como se espera.
* =============================================================================
*/

import React, { useState, useEffect } from 'react';
import { UserPlus, User, Mail, Phone, Hash, GraduationCap, Clock, Briefcase, Building2, LogIn, LogOut, Layers } from 'lucide-react';

// --- Componentes Mock para Demostración ---
const FormCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-2xl mx-auto">
        <div className="flex items-center text-gray-800 mb-6 border-b pb-4">
            <Icon className="w-8 h-8 mr-3 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        </div>
        {children}
    </div>
);

const InputField = ({ id, name, label, type, placeholder, icon: Icon, value, onChange }) => (
    <div className="input-field-container mb-4">
        <label htmlFor={id} className="input-label font-semibold text-gray-700 mb-2 flex items-center">
            <Icon className="w-5 h-5 mr-2 text-gray-400" />
            {label}
        </label>
        <input
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
        />
    </div>
);

const SelectField = ({ id, name, label, icon: Icon, value, onChange, children, disabled = false }) => (
    <div className="input-field-container">
        <label htmlFor={id} className="input-label font-semibold text-gray-700 mb-2 flex items-center">
            <Icon className="w-5 h-5 mr-2 text-gray-400" />
            {label}
        </label>
        <select id={id} name={name} value={value} onChange={onChange} disabled={disabled} className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed">
            {children}
        </select>
    </div>
);

// --- Componente Principal Actualizado ---

const RegisterPersonPage = () => {
    const initialFormData = {
        firstName: '',
        lastName: '',
        middleName: '',
        type: 'student',
        enrollment: '',
        studentLevel: 'engineering',
        engineeringDegree: '',
        tsuDegree: '',
        employeeNumber: '',
        area: '',
        entryTime: '',
        departureTime: '',
        shift: 'Matutino',
        email: '',
        phone: ''
    };

    const [formData, setFormData] = useState(initialFormData);
    const [engineeringDegrees, setEngineeringDegrees] = useState([]);
    const [tsuDegrees, setTsuDegrees] = useState([]); // <-- NUEVO estado para carreras TSU
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Efecto para cargar las divisiones de Ingeniería al montar el componente
    useEffect(() => {
        const fetchEngineeringDegrees = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/catalogs?type=INGENIERIA', {
                    headers: { 'X-API-KEY': '686a8466-e810-4405-b173-8f24cdbd0126' }
                });
                if (!response.ok) throw new Error('Failed to fetch engineering divisions');
                const data = await response.json();
                setEngineeringDegrees(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchEngineeringDegrees();
    }, []);

    // NUEVO: Efecto para cargar las carreras TSU cuando cambia la división de ingeniería
    useEffect(() => {
        const fetchTsuDegrees = async () => {
            if (!formData.engineeringDegree) {
                setTsuDegrees([]); // Limpiar si no hay ingeniería seleccionada
                return;
            }
            try {
                const response = await fetch(`http://localhost:8080/api/catalogs?type=TSU&idFather=${formData.engineeringDegree}`, {
                    headers: { 'X-API-KEY': '686a8466-e810-4405-b173-8f24cdbd0126' }
                });
                if (!response.ok) throw new Error('Failed to fetch TSU degrees');
                const data = await response.json();
                setTsuDegrees(data);
            } catch (error) {
                console.error(error);
                setTsuDegrees([]); // Limpiar en caso de error
            }
        };

        if (formData.studentLevel === 'tsu') {
            fetchTsuDegrees();
        }
    }, [formData.engineeringDegree, formData.studentLevel]); // Se ejecuta cuando cambia la ingeniería o el nivel

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            // Si se cambia la división de ingeniería, se resetea la carrera TSU
            if (name === 'engineeringDegree') {
                newState.tsuDegree = '';
            }
            // Si se cambia el nivel de estudio, se resetean las selecciones de carrera
            if (name === 'studentLevel') {
                newState.engineeringDegree = '';
                newState.tsuDegree = '';
            }
            return newState;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                middleName: formData.middleName,
                type: formData.type,
                email: formData.email,
                phone: formData.phone,
            };

            if (formData.type === 'student') {
                payload.enrollment = formData.enrollment;
                payload.shift = formData.shift;
                payload.studentLevel = formData.studentLevel;
                payload.engineeringDegree = formData.engineeringDegree;
                if (formData.studentLevel === 'tsu') {
                    payload.tsuDegree = formData.tsuDegree;
                }
            } else {
                payload.employeeNumber = formData.employeeNumber;
                payload.area = formData.area;
                payload.shift = formData.shift;
                payload.entryTime = formData.entryTime;
                payload.departureTime = formData.departureTime;
            }

            const response = await fetch('http://localhost:8080/api/persons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-KEY': '686a8466-e810-4405-b173-8f24cdbd0126' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error en la respuesta del servidor.' }));
                throw new Error(errorData.message || 'Ocurrió un error al registrar a la persona.');
            }

            const fullName = `${formData.firstName} ${formData.lastName}`.trim();
            setMessage({ type: 'success', text: `Se ha registrado a ${fullName} exitosamente.` });
            setFormData(initialFormData);

        } catch (error) {
            console.error("Error al registrar:", error);
            setMessage({ type: 'error', text: error.message || 'No se pudo conectar con el servidor.' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <div className="page-container min-h-screen bg-gray-100">
            <div className="flex items-center justify-center min-h-screen p-4 w-full">
                <FormCard title="Alta de Personal Universitario" icon={UserPlus}>
                    <form onSubmit={handleSubmit} className="form-body">
                        {/* Campos de Nombre y Rol (sin cambios) */}
                        <div className="form-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField id="firstName" name="firstName" label="Nombre(s)" type="text" placeholder="Eduardo" icon={User} value={formData.firstName} onChange={handleChange} />
                            <InputField id="lastName" name="lastName" label="Apellido Paterno" type="text" placeholder="Martínez" icon={User} value={formData.lastName} onChange={handleChange} />
                            <InputField id="middleName" name="middleName" label="Apellido Materno" type="text" placeholder="Díaz" icon={User} value={formData.middleName} onChange={handleChange} />
                        </div>
                        <div className="input-field-container my-4">
                            <SelectField id="type" name="type" label="Rol / Cargo" icon={Briefcase} value={formData.type} onChange={handleChange}>
                                <option value="student">Estudiante</option>
                                <option value="teacher">Profesor</option>
                                <option value="administrative">Administrativo</option>
                                <option value="directive">Directivo</option>
                            </SelectField>
                        </div>

                        {/* Sección de Estudiante Modificada */}
                        {formData.type === 'student' && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 my-4">
                                <h3 className="text-lg font-semibold text-blue-800 mb-3">Información del Estudiante</h3>
                                <InputField id="enrollment" name="enrollment" label="Matrícula" type="text" placeholder="A1234" icon={Hash} value={formData.enrollment} onChange={handleChange} />
                                <div className="my-4">
                                    <label className="input-label font-semibold text-gray-700 mb-2 flex items-center">
                                        <Layers className="w-5 h-5 mr-2 text-gray-400" /> Nivel de Estudio
                                    </label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input type="radio" name="studentLevel" value="engineering" checked={formData.studentLevel === 'engineering'} onChange={handleChange} className="mr-2" /> Ingeniería
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input type="radio" name="studentLevel" value="tsu" checked={formData.studentLevel === 'tsu'} onChange={handleChange} className="mr-2" /> TSU
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                                    <SelectField
                                        id="engineeringDegree" name="engineeringDegree" label="División de Ingeniería"
                                        icon={Building2} value={formData.engineeringDegree} onChange={handleChange}>
                                        <option value="">-- Selecciona una división --</option>
                                        {engineeringDegrees.map(degree => (
                                            <option key={degree.id} value={degree.id}>{degree.description}</option>
                                        ))}
                                    </SelectField>

                                    {/* Combo de TSU ahora es dinámico */}
                                    {formData.studentLevel === 'tsu' && (
                                        <SelectField
                                            id="tsuDegree" name="tsuDegree" label="Carrera TSU"
                                            icon={GraduationCap} value={formData.tsuDegree} onChange={handleChange}
                                            disabled={!formData.engineeringDegree || tsuDegrees.length === 0}>
                                            <option value="">-- Selecciona una carrera TSU --</option>
                                            {tsuDegrees.map(degree => (
                                                <option key={degree.id} value={degree.id}>{degree.description}</option>
                                            ))}
                                        </SelectField>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <SelectField id="shift" name="shift" label="Turno" icon={Clock} value={formData.shift} onChange={handleChange}>
                                        <option>Matutino</option>
                                        <option>Vespertino</option>
                                    </SelectField>
                                </div>
                            </div>
                        )}

                        {/* Sección de Empleado (sin cambios) */}
                        {(formData.type === 'teacher' || formData.type === 'administrative' || formData.type === 'directive') && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200 my-4">
                                <h3 className="text-lg font-semibold text-green-800 mb-3">Información del Empleado</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField id="employeeNumber" name="employeeNumber" label="Número de Empleado" type="text" placeholder="102030" icon={Briefcase} value={formData.employeeNumber} onChange={handleChange} />
                                    <InputField id="area" name="area" label="Área / Departamento" type="text" placeholder="Sistemas" icon={Building2} value={formData.area} onChange={handleChange} />
                                </div>
                                <div className="mt-4">
                                    <SelectField id="shift" name="shift" label="Turno" icon={Clock} value={formData.shift} onChange={handleChange}>
                                        <option>Matutino</option>
                                        <option>Vespertino</option>
                                        <option>Mixto</option>
                                        <option>Tiempo Completo</option>
                                    </SelectField>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <InputField id="entryTime" name="entryTime" label="Hora Entrada" type="time" icon={LogIn} value={formData.entryTime} onChange={handleChange} />
                                    <InputField id="departureTime" name="departureTime" label="Hora Salida" type="time" icon={LogOut} value={formData.departureTime} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {/* Campos de Contacto y Botón (sin cambios) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InputField id="email" name="email" label="Correo Electrónico" type="email" placeholder="eduardo.martinez@universidad.edu" icon={Mail} value={formData.email} onChange={handleChange} />
                            <InputField id="phone" name="phone" label="Teléfono" type="tel" placeholder="55 1234 5678" icon={Phone} value={formData.phone} onChange={handleChange} />
                        </div>
                        {message && (
                            <div className={`p-4 mt-6 rounded-lg text-center font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}
                        <div className="form-footer mt-8 text-center">
                            <button type="submit" disabled={isLoading} className="w-full sm:w-auto submit-button bg-blue-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center mx-auto">
                                {isLoading ? (<> <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Registrando... </>) : 'Registrar Persona'}
                            </button>
                        </div>
                    </form>
                </FormCard>
            </div>
        </div>
    );
};

export default RegisterPersonPage;
