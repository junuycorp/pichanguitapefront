import React, { useState } from 'react';
import './LoginPage.css'; // Estilos específicos para esta página
import { Link , useNavigate} from 'react-router-dom'; // Asegúrate de que Link esté importado


// Asumimos que las imágenes están en la carpeta 'src/assets'
/*import logo from '../assets/logo-pichanguita-isotipo.png';
import backgroundImage from '../assets/cancha_noche.jpeg';
import logoPichanguitaDark from '../assets/logo-modooscuo.png'; // Nuevo logo para modo oscuro
*/
import logo from '../assets/logo-pichanguita-isotipo.png';
import logoPichanguita from '../assets/logo-pichanguita-isotipo.png'; // Logo para modo claro
import logoPichanguitaDark from '../assets/logo-modooscuo.png'; // Nuevo logo para modo oscuro
import backgroundImage from '../assets/cancha_noche.jpeg'; // Fondo


const LoginPage = ({ handleLogin }) => {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

        // Función para manejar el cambio de tema (duplicada de MainAdmin/Owner/Cliente por ahora)
    const toggleTheme = () => {
        const root = document.documentElement;
        root.classList.add('theme-animating'); // Añade clase para la transición suave
        setTimeout(() => {
            root.classList.remove('theme-animating'); // Remueve la clase después de la transición
        }, 400); // Duración de la transición definida en common.css

        if (root.getAttribute('data-theme') === 'dark') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', 'dark');
        }
    };
        // Función para determinar qué logo mostrar
    const getLogoSrc = () => {
        const root = document.documentElement;
        return root.getAttribute('data-theme') === 'dark' ? logoPichanguitaDark : logoPichanguita;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        if (!usuario || !contrasena) {
            setError('Por favor, ingresa tu usuario y contraseña.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario, contrasena }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión. Verifica tus credenciales.');
            }
            
            // Si la respuesta es exitosa, llamamos a handleLogin
            // Pasamos el token y el objeto 'data' COMPLETO, que contiene los datos del usuario.
            handleLogin(data.token, data); // <-- ¡CORRECCIÓN AQUÍ!

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-container" title="Reserva tu cancha ya">
            <div className="login-form-section">
                <div className="login-card">
                {/* Botón de cambio de tema en la esquina superior derecha del card */}
                <button onClick={toggleTheme} className="theme-toggle-login" title="Cambiar tema">🌙</button>
                <div className="login-logo">
                <img src={getLogoSrc()} alt="Logo Pichanguita.pe" className="login-logo" />
                </div>
                    <h2>¡Bienvenido de vuelta!</h2>
                    <p className="login-subtitle">Ingresa para reservar tu cancha.</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="usuario">Email, Usuario o DNI</label>
                            <input
                                type="text"
                                id="usuario"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                placeholder="tu@ejemplo.com"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder="********"
                                required
                            />
                        </div>
                        <div className="form-options">
                            <Link to="/forgot-password" className="forgot-password">¿Olvidaste tu contraseña?</Link>
                        </div>
                        <button type="submit" className="btn-login" disabled={isLoading}>
                            {isLoading ? 'Ingresando...' : 'Entrar'}
                        </button>
                    </form>
                 <div className="login-links">
                    
                    <Link to="/register" className="register-link">Regístrate aquí</Link> {/* Actualiza el enlace */}
                </div>                   
                    <div className="separator">o</div>
                    <button className="btn-google">Continuar con Google</button>

                </div>
            </div>
            <div
                className="login-image-section"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="image-overlay">
                    <h3>Tu Pasión, Tu Cancha</h3>
                    <p>Encuentra y reserva canchas de fútbol al instante.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;