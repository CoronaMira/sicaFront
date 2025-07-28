import React, { useState, useCallback } from 'react';
import { authService } from 'services/authService';
import LoginPage from 'components/pages/LoginPage';
import Navbar from 'components/layout/Navbar';
import HomePage from 'components/layout/HomePage';
import RegisterPersonPage from 'components/pages/RegisterPersonPage';
import RegisterFingerprintPage from 'components/pages/RegisterFingerprintPage';
import ReportsPage from 'components/pages/ReportsPage';
import RegisterVisitorPage from 'components/pages/RegisterVisitorPage';
import VisitsPage from 'components/pages/VisitsPage';

// Importa los estilos globales
import 'assets/styles/App.css';

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');

    const handleLogin = useCallback(async (username, password) => {
        setIsLoading(true);
        setLoginError('');
        try {
            const user = await authService.login(username, password);
            setCurrentUser(user);
            setCurrentPage('home'); // Redirige al inicio tras el login
        } catch (error) {
            setLoginError(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        await authService.logout();
        setCurrentUser(null);
        setCurrentPage('home'); // Resetea la página
    }, []);

    const handleNavigation = (page) => {
        setCurrentPage(page);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage user={currentUser} />;
            case 'registerPerson':
                return <RegisterPersonPage />;
            case 'registerFingerprint':
                return <RegisterFingerprintPage />;
            case 'reports':
                return <ReportsPage />;
            case 'registerVisitor':
                return <RegisterVisitorPage />;
            case 'visitas':
                return <VisitsPage />;
            default:
                return <HomePage user={currentUser} />;
        }
    };

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} error={loginError} isLoading={isLoading} />;
    }

    return (
        <div className="app-container">
            <Navbar user={currentUser} onNavigate={handleNavigation} onLogout={handleLogout} activePage={currentPage} />
            <main className="main-content">
                {renderPage()}
            </main>
        </div>
    );
}

export default App;