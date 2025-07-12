import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
    Navigate
} from 'react-router-dom';

import './App.css';

// Importación de Componentes y Páginas
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MainAdmin from './pages/MainAdmin';
import MainOwner from './pages/MainOwner';
import MainCliente from './pages/MainCliente';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Nueva importación
import RegisterPage from './pages/RegisterPage'; // Nueva importación


// Componente Wrapper para la lógica de navegación
function AppWrapper() {
    const navigate = useNavigate();
    
    // Estados de autenticación
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfileId, setUserProfileId] = useState(null);
    const [currentUserName, setCurrentUserName] = useState('');

    // --- SECCIÓN CORREGIDA ---
    // Efecto para verificar la sesión al cargar la app
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userJson = localStorage.getItem('currentUser');
        let user = null;

        // 1. Primero, verificamos si userJson no es nulo o undefined
        if (userJson) {
            try {
                // 2. Solo si existe, intentamos parsearlo
                user = JSON.parse(userJson);
            } catch (error) {
                console.error("Error al parsear datos del usuario desde localStorage:", error);
                // Si el JSON está corrupto, es buena idea limpiar el estado de login
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
            }
        }

        if (token && user) {
            setIsAuthenticated(true);
            // Corregido: Usar 'perfil' como en tu respuesta de backend
            setUserProfileId(user.perfil); 
            setCurrentUserName(user.nombre);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Función de Login
    const handleLogin = (token, user) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        setIsAuthenticated(true);
        // Corregido: Usar 'perfil' como en tu respuesta de backend
        setUserProfileId(user.perfil); 
        setCurrentUserName(user.nombre);

        // Redirigir según el perfil del usuario
        switch (user.perfil) { // Corregido aquí también
            case 1:
                navigate('/admin');
                break;
            case 3:
                navigate('/owner');
                break;
            case 6:
                navigate('/cliente');
                break;
            default:
                navigate('/login');
        }
    };

    // Función de Logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        setIsAuthenticated(false);
        setUserProfileId(null);
        setCurrentUserName('');
        
        navigate('/login');
    };

    // Componente para la ruta raíz que redirige
    const RootRedirect = () => {
        if (!isAuthenticated) {
            return <Navigate to="/login" />;
        }
        switch (userProfileId) {
            case 1: return <Navigate to="/admin" />;
            case 3: return <Navigate to="/owner" />;
            case 6: return <Navigate to="/cliente" />;
            default: return <Navigate to="/login" />;
        }
    };

    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* Nueva ruta */}
            <Route path="/register" element={<RegisterPage />} /> {/* Nueva ruta */}
            
            {/* Ruta Raíz */}
            <Route path="/" element={<RootRedirect />} />

            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                <Route path="/admin" element={<MainAdmin userName={currentUserName} handleLogout={handleLogout} />} />
                <Route path="/owner" element={<MainOwner userName={currentUserName} handleLogout={handleLogout} />} />
                <Route path="/cliente" element={<MainCliente userName={currentUserName} handleLogout={handleLogout} />} />
            </Route>

            {/* Ruta para cualquier otra URL no definida, redirige al login si no autenticado, o a la raíz si sí */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

// Componente principal de la aplicación que provee el Router
function App() {
    return (
        <Router>
            <AppWrapper />
        </Router>
    );
}

export default App;