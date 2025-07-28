import React from 'react';
import { UserPlus, Fingerprint, FileText, Users, LogOut, Building } from 'lucide-react';
import 'assets/styles/Navbar.css';

const Navbar = ({ user, onNavigate, onLogout, activePage }) => {
    const navItems = [
        { id: 'home', label: 'Inicio', icon: Building },
        { id: 'registerPerson', label: 'Alta de Personas', icon: UserPlus },
        { id: 'registerFingerprint', label: 'Registro de Huella', icon: Fingerprint },
        { id: 'reports', label: 'Reportes', icon: FileText },
        { id: 'visitas', label: 'Visitas', icon: Users },
    ];

    return (
        <aside className="navbar-container">
            <div className="navbar-header">
                <h2>SICA</h2>
                <p>Universidad Tecnológica de Nezahualcoyólt</p>
            </div>
            <nav className="navbar-nav">
                {navItems.map(item => (
                    <a
                        key={item.id}
                        href="#"
                        onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
                        className={`nav-item ${activePage === item.id ? 'active' : ''}`}                    >
                        <item.icon className="nav-icon" />
                        <span>{item.label}</span>
                    </a>
                ))}
            </nav>
            <div className="navbar-footer">
                <div className="user-info">
                    <p className="user-name">{user.name}</p>
                    <p className="user-role">{user.role}</p>
                </div>
                <button onClick={onLogout} className="logout-button">
                    <LogOut className="logout-icon" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default Navbar;