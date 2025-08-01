import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { apiService } from 'services/apiService';
import { Download, Calendar, User, BarChart3, Edit } from 'lucide-react';
import 'assets/styles/ReportsPage.css';

const ReportsPage = () => {
    // --- Estados del Componente ---
    const [reportType, setReportType] = useState('access');
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [people, setPeople] = useState([]);
    const [filters, setFilters] = useState({ personId: '', startDate: '', endDate: '' });
    const [loading, setLoading] = useState(false);

    // --- Carga la lista de personas al montar el componente ---
    useEffect(() => {
        apiService.getAllPersons()
            .then(setPeople)
            .catch(error => console.error("Failed to fetch people list:", error));
    }, []);

    // --- Manejadores de eventos ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleJustifyAbsence = (record) => {
        alert(`Lógica para justificar la falta del día ${record.date} para la persona con ID ${record.personId}.`);
        // Aquí podrías abrir un modal, navegar a otra página o hacer una llamada a la API.
    };

    // --- Lógica Principal ---
    const handleGenerateReport = async () => {
        setLoading(true);
        setData([]);
        setColumns([]);
        try {
            let apiData;
            let reportColumns = [];
            let transformedData = [];

            switch (reportType) {
                case 'absences':
                    if (!filters.personId || !filters.startDate || !filters.endDate) {
                        alert("Por favor, seleccione una persona y un rango de fechas.");
                        setLoading(false);
                        return;
                    }
                    apiData = await apiService.getAbsences(filters);
                    reportColumns = [
                        { header: 'Persona', key: 'personName' },
                        { header: 'Fecha', key: 'date' },
                        { header: 'Tipo de Evento', key: 'eventType' },
                        { header: 'Acciones', key: 'actions' },
                    ];
                    const peopleMap = new Map(people.map(p => [p.id, `${p.firstName} ${p.lastName}`]));
                    transformedData = apiData.map(record => ({
                        ...record,
                        personName: peopleMap.get(record.personId) || `ID No Encontrado: ${record.personId}`,
                        eventType: record.eventType === 'ABSENCE' ? 'Falta' : 'Asistencia',
                    }));
                    break;

                case 'tardiness':
                    reportColumns = [ { header: 'ID de Persona', key: 'personId' }, { header: 'Fecha', key: 'date' }, { header: 'Tiempo de Retardo', key: 'delayTime' }, ];
                    transformedData = [];
                    alert("Reporte de retardos aún no implementado.");
                    break;

                case 'access':
                default:
                    apiData = await apiService.getAccessLogs();
                    reportColumns = [ { header: 'Usuario', key: 'userName' }, { header: 'Fecha', key: 'date' }, { header: 'Hora', key: 'time' }, { header: 'Punto de Acceso', key: 'accessPoint' }, { header: 'Estado', key: 'status' }, ];
                    transformedData = apiData.map(record => ({ id: record.id, userName: `Persona ID: ${record.personId}`, date: new Date(record.recordTimestamp).toLocaleDateString('es-ES'), time: new Date(record.recordTimestamp).toLocaleTimeString('es-ES'), accessPoint: record.deviceId, status: record.status === 'Concedido' ? 'Concedido' : 'Denegado', })).sort((a, b) => b.id - a.id);
                    break;
            }
            setColumns(reportColumns);
            setData(transformedData);
        } catch (error) {
            console.error(`Failed to fetch ${reportType} report:`, error);
        } finally {
            setLoading(false);
        }
    };

    const generatePdf = () => {
        const doc = new jsPDF();
        const reportTitles = { access: 'Reporte de Entradas y Salidas', absences: 'Reporte de Asistencias y Faltas', tardiness: 'Reporte de Retardos', };

        doc.setFontSize(18);
        doc.text(reportTitles[reportType] + ' - SICA', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 30);

        const pdfColumns = columns.filter(col => col.key !== 'actions');
        const tableColumn = pdfColumns.map(col => col.header);
        const tableRows = data.map(row => pdfColumns.map(col => row[col.key]));

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 38,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didDrawCell: (data) => {
                if (reportType === 'access' && data.column.header === 'Estado') {
                    if (data.cell.raw === 'Denegado') data.cell.styles.textColor = [192, 57, 43];
                    else if (data.cell.raw === 'Concedido') data.cell.styles.textColor = [39, 174, 96];
                }
                if (reportType === 'absences' && data.column.header === 'Tipo de Evento') {
                    if (data.cell.raw === 'Falta') data.cell.styles.textColor = [192, 57, 43];
                    else if (data.cell.raw === 'Asistencia') data.cell.styles.textColor = [39, 174, 96];
                }
            }
        });
        doc.save(`reporte_${reportType}_sica.pdf`);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Generador de Reportes</h1>
                    <button onClick={generatePdf} className="flex items-center gap-2 bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-400 transition-all duration-300" disabled={loading || data.length === 0}>
                        <Download size={18} /> Descargar PDF
                    </button>
                </div>

                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                        <div className="flex flex-col">
                            <label htmlFor="reportType" className="font-semibold text-gray-700 mb-2 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-gray-400"/>Tipo de Reporte</label>
                            <select id="reportType" name="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="access">Entradas y Salidas</option>
                                <option value="absences">Asistencias y Faltas</option>
                                <option value="tardiness">Retardos</option>
                            </select>
                        </div>

                        {/* --- Esta es la sección que fue corregida --- */}
                        {(reportType === 'absences' || reportType === 'tardiness') && (
                            <>
                                <div className="flex flex-col">
                                    <label htmlFor="personId" className="font-semibold text-gray-700 mb-2 flex items-center"><User className="w-5 h-5 mr-2 text-gray-400"/> Persona</label>
                                    <select id="personId" name="personId" value={filters.personId} onChange={handleFilterChange} className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">-- Selecciona una persona --</option>
                                        {people.map(person => (
                                            <option key={person.id} value={person.id}>
                                                {`${person.firstName} ${person.lastName}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="startDate" className="font-semibold text-gray-700 mb-2 flex items-center"><Calendar className="w-5 h-5 mr-2 text-gray-400"/> Fecha de Inicio</label>
                                    <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="endDate" className="font-semibold text-gray-700 mb-2 flex items-center"><Calendar className="w-5 h-5 mr-2 text-gray-400"/> Fecha de Fin</label>
                                    <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </>
                        )}

                        <button onClick={handleGenerateReport} className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 transition-all duration-300" disabled={loading}>
                            {loading ? 'Generando...' : 'Generar Reporte'}
                        </button>
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-transparent">
                            <thead>
                            <tr className="border-b-2 border-gray-300">
                                {columns.map(col => <th key={col.key} className="p-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">{col.header}</th>)}
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan={columns.length || 1} className="p-4 text-center text-gray-500">Cargando reportes...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={columns.length || 1} className="p-4 text-center text-gray-500">No hay datos para mostrar. Genere un reporte.</td></tr>
                            ) : (
                                data.map((row, index) => (
                                    <tr key={row.id || index} className={`border-b border-gray-200 hover:bg-gray-100/50 
                                            ${row.eventType === 'Falta' ? 'bg-red-50' : ''} 
                                            ${row.eventType === 'Asistencia' ? 'bg-green-50' : ''}`}
                                    >
                                        {columns.map(col => (
                                            <td key={col.key} className="p-4 whitespace-nowrap">
                                                {col.key === 'actions' ? (
                                                    row.eventType === 'Falta' && (
                                                        <button onClick={() => handleJustifyAbsence(row)} className="flex items-center gap-1 bg-yellow-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-yellow-600 transition-colors">
                                                            <Edit size={12} />
                                                            Justificar
                                                        </button>
                                                    )
                                                ) : col.key === 'eventType' ? (
                                                    <span className={`font-bold ${row.eventType === 'Falta' ? 'text-red-600' : 'text-green-600'}`}>
                                                            {row.eventType}
                                                        </span>
                                                ) : (
                                                    row[col.key]
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;