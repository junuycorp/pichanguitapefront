import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    isAuthenticated: boolean;
    authChecked: boolean; // Esta es la prop para saber si la verificación inicial terminó
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, authChecked }) => {
    // Si la verificación inicial de autenticación aún no ha terminado, muestra un mensaje de carga.
    // Esto es crucial para evitar que el usuario vea la página de login por un instante
    // antes de que la sesión se restaure desde localStorage.
    if (!authChecked) {
        return <p>Cargando...</p>; // Puedes reemplazar esto con un spinner o un componente de carga
    }

    // Una vez que la autenticación ha sido verificada (authChecked es true):
    // Si no está autenticado, redirige a la página de login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado y la verificación terminó, renderiza el contenido de la ruta anidada
    return <Outlet />;
};

export default ProtectedRoute;