import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated }) => {
    if (!isAuthenticated) {
        // Si el usuario no está autenticado, redirigir a la página de login
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, renderiza el contenido de la ruta anidada
    return <Outlet />;
};

export default ProtectedRoute;