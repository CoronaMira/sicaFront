import React from 'react';
import { Users, FileText, Fingerprint } from 'lucide-react';
import 'assets/styles/HomePage.css';

const HomePage = ({ user }) => (
    <div className="page-container">
        <h1 className="page-title">Bienvenido, {user.name}</h1>
        <p className="page-subtitle">Este es el panel de control del sistema de acceso biométrico SICA.</p>

        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon-wrapper blue">
                    <Users className="stat-icon"/>
                </div>
                <div className="stat-info">
                    <p className="stat-label">Personal Registrado</p>
                    <p className="stat-value">1,245</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon-wrapper green">
                    <FileText className="stat-icon"/>
                </div>
                <div className="stat-info">
                    <p className="stat-label">Accesos Hoy</p>
                    <p className="stat-value">3,480</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon-wrapper red">
                    <Fingerprint className="stat-icon"/>
                </div>
                <div className="stat-info">
                    <p className="stat-label">Alertas de Seguridad</p>
                    <p className="stat-value">3</p>
                </div>
            </div>
        </div>
    </div>
);

export default HomePage;