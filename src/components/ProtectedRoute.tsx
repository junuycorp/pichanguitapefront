import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    isAuthenticated: boolean;
    authChecked: boolean; // Esta es la nueva prop
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, authChecked }) => {
    if (!authChecked) {
        return <p>Cargando sesión...</p>; // O un componente de Spinner real si tienes uno
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;