import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPasswordPage.css'; // Estilos específicos para esta página
import logoPichanguita from '../assets/logo-pichanguita-isotipo.png'; // Logo
import backgroundImage from '../assets/cancha_noche.jpeg'; // Fondo

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'; // Asegúrate de tener VITE_BACKEND_URL configurado

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!email) {
            setError('Por favor, ingresa tu correo electrónico.');
            return;
        }

        try {
            // Asume que el backend tiene un endpoint para recuperar contraseña
            // que envía un correo con un link o instrucciones.
            const response = await fetch(`${backendUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Se ha enviado un correo con instrucciones para restablecer tu contraseña.');
            } else {
                setError(data.message || 'Ocurrió un error al intentar recuperar la contraseña. Por favor, verifica tu correo.');
            }
        } catch (err) {
            console.error('Error de red o del servidor:', err);
            setError('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
        }
    };

    return (
        <div className="forgot-password-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="forgot-password-card">
                <img src={logoPichanguita} alt="Logo Pichanguita.pe" className="logo" />
                <h2>¿Olvidaste tu contraseña?</h2>
                <p>Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    {message && <p className="success-message">{message}</p>}
                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="submit-button">Enviar Instrucciones</button>
                </form>

                <p className="back-to-login">
                    <Link to="/login">Volver al inicio de sesión</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;