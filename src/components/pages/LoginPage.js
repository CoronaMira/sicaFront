import React, { useState } from 'react';
import { Fingerprint, User, Lock } from 'lucide-react';
import 'assets/styles/LoginPage.css';

const LoginPage = ({ onLogin, error, isLoading }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isLoading) {
            onLogin(username, password);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon-wrapper">
                        <Fingerprint className="login-icon" />
                    </div>
                    <h1>Acceso SICA</h1>
                    <p>Por favor, inicie sesión para continuar</p>
                </div>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <User className="input-icon"/>
                        <input
                            type="text"
                            placeholder="Usuario (ej: admin)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Lock className="input-icon"/>
                        <input
                            type="password"
                            placeholder="Contraseña (ej: 123)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" disabled={isLoading} className="login-button">
                        {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;