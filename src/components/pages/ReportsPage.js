import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { apiService } from 'services/apiService';
import { Download } from 'lucide-react';
import 'assets/styles/ReportsPage.css';

const ReportsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        apiService.getAccessLogs()
            .then(data => setLogs(data.sort((a, b) => b.id - a.id)))
            .finally(() => setLoading(false));
    }, []);

    const generatePdf = () => {
        const doc = new jsPDF();

        // Título del documento
        doc.setFontSize(18);
        doc.text('Reporte de Accesos - SICA', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 30);

        // Definir las columnas de la tabla
        const tableColumn = ["Usuario", "Fecha", "Hora", "Punto de Acceso", "Estado"];
        // Definir las filas de la tabla
        const tableRows = [];

        logs.forEach(log => {
            const logData = [
                log.userName,
                log.date,
                log.time,
                log.accessPoint,
                log.status,
            ];
            tableRows.push(logData);
        });

        // Crear la tabla en el PDF
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 38,
            theme: 'grid',
            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [44, 62, 80], // Color de cabecera (azul oscuro)
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245], // Color de fila alterna
            },
            didDrawCell: (data) => {
                // Colorear las celdas de "Estado"
                if (data.column.dataKey === 4) { // El índice de la columna "Estado"
                    if (data.cell.raw === 'Denegado') {
                        data.cell.styles.textColor = [192, 57, 43]; // Rojo
                        data.cell.styles.fontStyle = 'bold';
                    } else if (data.cell.raw === 'Concedido') {
                        data.cell.styles.textColor = [39, 174, 96]; // Verde
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        });

        // Guardar el PDF
        doc.save('reporte_accesos_sica.pdf');
    };

    return (
        <div className="page-container">
            <div className="report-header">
                <h1 className="page-title">Reporte de Accesos</h1>
                <button onClick={generatePdf} className="download-button" disabled={loading || logs.length === 0}>
                    <Download size={18} />
                    Descargar PDF
                </button>
            </div>

            <div className="report-card">
                <div className="table-container">
                    <table className="report-table">
                        <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Punto de Acceso</th>
                            <th>Estado</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="loading-cell">Cargando reportes...</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id}>
                                    <td data-label="Usuario">{log.userName}</td>
                                    <td data-label="Fecha">{log.date}</td>
                                    <td data-label="Hora">{log.time}</td>
                                    <td data-label="Punto de Acceso">{log.accessPoint}</td>
                                    <td data-label="Estado">
                                            <span className={`status-badge ${
                                                log.status === 'Concedido' ? 'status-concedido' : 'status-denegado'
                                            }`}>
                                                {log.status}
                                            </span>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
