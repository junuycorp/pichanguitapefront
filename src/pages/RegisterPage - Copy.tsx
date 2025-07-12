import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';
import logoPichanguita from '../assets/logo-pichanguita-isotipo.png';
import backgroundImage from '../assets/cancha_noche.jpeg';
import axios from 'axios'; // Asegúrate de importar axios

const RegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nro_docu: '',
        nombres: '',
        apellidos: '',
        fecha_nacimiento: '', // Formato YYYY-MM-DD
        domicilio: '', // Para dueños
        numero_domicilio: '', // Email o NroCelular WhatsApp
        email: '',
        contrasena: '',
        pregunta_secreta: '',
        respuesta: '',
        rol: '', // 'owner' o 'cliente'
        honeypot: '' // Campo honeypot para el backend
    });
    const [emailConfirmationCode, setEmailConfirmationCode] = useState(''); // Nuevo estado para el código de email
    const [phoneConfirmationCode, setPhoneConfirmationCode] = useState(''); // Nuevo estado para el código de WhatsApp
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Limpiar errores al cambiar los campos
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (step === 1) {
                // Validación básica para el Paso 1
                if (!formData.nro_docu || !formData.nombres || !formData.apellidos || !formData.fecha_nacimiento) {
                    setError('Por favor, completa todos los campos del paso 1.');
                    setIsLoading(false);
                    return;
                }
                // Aquí podrías añadir validaciones de formato (ej. fecha, DNI)
                setStep(2);
            } else if (step === 2) {
                // Validación básica para el Paso 2 antes de enviar al backend
                if (!formData.rol || !formData.email || !formData.numero_domicilio) {
                    setError('Por favor, selecciona tu rol y proporciona tu email y número de contacto.');
                    setIsLoading(false);
                    return;
                }
                // Si el rol es 'owner', domicilio no puede estar vacío
                if (formData.rol === 'owner' && !formData.domicilio) {
                    setError('Para dueños, el domicilio es obligatorio.');
                    setIsLoading(false);
                    return;
                }

                // *** Lógica para enviar datos a /validar-contacto ***
                const validationPayload = {
                    nro_docu: formData.nro_docu,
                    email: formData.email,
                    numero_domicilio: formData.numero_domicilio,
                    honeypot: formData.honeypot
                };
                console.log('Enviando a /validar-contacto:', validationPayload);
                await axios.post(`${backendUrl}/validar-contacto`, validationPayload);
                
                setMessage('Códigos de verificación enviados. Por favor, revisa tu email y WhatsApp.');
                setStep(3); // Avanza al nuevo Paso 3 (Verificación de Códigos)

            } else if (step === 3) {
                // *** Lógica para enviar datos a /verificar-codigos ***
                if (!emailConfirmationCode || !phoneConfirmationCode) {
                    setError('Por favor, introduce ambos códigos de verificación.');
                    setIsLoading(false);
                    return;
                }

                const verificationPayload = {
                    nro_docu: formData.nro_docu,
                    email: formData.email,
                    numero_domicilio: formData.numero_domicilio,
                    codigo_email: emailConfirmationCode,
                    codigo_numero_domicilio: phoneConfirmationCode,
                    honeypot: formData.honeypot
                };
                console.log('Enviando a /verificar-codigos:', verificationPayload);
                const response = await axios.post(`${backendUrl}/verificar-codigos`, verificationPayload);
                const { check_email, check_numero_domicilio } = response.data;

                if (check_email && check_numero_domicilio) {
                    setMessage('Códigos verificados exitosamente. Ahora puedes establecer tu contraseña.');
                    setStep(4); // Avanza al Paso 4 (Contraseña y Pregunta Secreta)
                } else {
                    setError('Uno o ambos códigos de verificación son incorrectos. Por favor, intenta de nuevo.');
                }

            } else if (step === 4) { // Antiguo Paso 3, ahora es Paso 4 (Final de Registro)
                // Validación básica para el Paso 4
                if (!formData.contrasena || formData.contrasena.length < 6) { // Ejemplo de validación de contraseña
                    setError('La contraseña debe tener al menos 6 caracteres.');
                    setIsLoading(false);
                    return;
                }
                if (!formData.pregunta_secreta || !formData.respuesta) {
                    setError('Por favor, completa la pregunta y respuesta secreta.');
                    setIsLoading(false);
                    return;
                }

                // *** Lógica final de registro ***
                // Envía todos los datos acumulados a la ruta final de registro
                const finalRegisterPayload = {
                    ...formData,
                    // Asegúrate de enviar los códigos si el backend los requiere nuevamente aquí (generalmente no es necesario)
                    // Para tu caso, no se especificó, así que solo se envían los datos del formData
                };
                console.log('Enviando a /register (final):', finalRegisterPayload);
                const response = await axios.post(`${backendUrl}/register`, finalRegisterPayload);

                setMessage(response.data.message || 'Registro exitoso. Serás redirigido al login.');
                setTimeout(() => navigate('/login'), 2000); // Redirigir después de 2 segundos
            }
        } catch (err: any) { // Usamos 'any' para el error por la estructura variable de axios.response
            console.error('Error durante el proceso de registro:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Ocurrió un error. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h3>Paso 1: Datos Personales</h3>
                        <div className="form-group">
                            <label htmlFor="nro_docu">Número de Documento:</label>
                            <input
                                type="text"
                                id="nro_docu"
                                name="nro_docu"
                                value={formData.nro_docu}
                                onChange={handleChange}
                                placeholder="DNI/CE/Pasaporte"
                                required
                                disabled={isLoading}
                            /><button type="button" className="icon-button" title="Buscar DNI">
                                    🔍
                                </button>
                        </div>
                        <div className="form-group">
                            <label htmlFor="nombres">Nombres:</label>
                            <input
                                type="text"
                                id="nombres"
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleChange}
                                placeholder="Tus nombres"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="apellidos">Apellidos:</label>
                            <input
                                type="text"
                                id="apellidos"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleChange}
                                placeholder="Tus apellidos"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="fecha_nacimiento">Fecha de Nacimiento:</label>
                            <input
                                type="date"
                                id="fecha_nacimiento"
                                name="fecha_nacimiento"
                                value={formData.fecha_nacimiento}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            Siguiente
                        </button>
                    </>
                );
            case 2:
                return (
                    <>
                        <h3>Paso 2: Tipo de Usuario y Contacto</h3>
                        <div className="form-group">
                            <label htmlFor="rol">Soy:</label>
                            <select
                                id="rol"
                                name="rol"
                                value={formData.rol}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            >
                                <option value="">Selecciona tu rol</option>
                                <option value="cliente">Cliente</option>
                                <option value="owner">Dueño de Establecimiento</option>
                            </select>
                        </div>
                        {formData.rol === 'owner' && (
                            <div className="form-group">
                                <label htmlFor="domicilio">Domicilio (Dirección Completa):</label>
                                <input
                                    type="text"
                                    id="domicilio"
                                    name="domicilio"
                                    value={formData.domicilio}
                                    onChange={handleChange}
                                    placeholder="Ej. Av. Siempre Viva 123"
                                    required={formData.rol === 'owner'}
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="tu_correo@ejemplo.com"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="numero_domicilio">Número de WhatsApp:</label>
                            <input
                                type="tel" // Usar 'tel' para números de teléfono
                                id="numero_domicilio"
                                name="numero_domicilio"
                                value={formData.numero_domicilio}
                                onChange={handleChange}
                                placeholder="Ej. 9XXXXXXXX"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        {/* Campo Honeypot (mantener oculto) */}
                        <input
                            type="text"
                            name="honeypot"
                            value={formData.honeypot}
                            onChange={handleChange}
                            style={{ display: 'none' }} // Importante: Ocultar visualmente
                            tabIndex={-1} // Evitar que sea accesible por tabulación
                            autoComplete="off" // Evitar autocompletado
                        />
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            Siguiente
                        </button>
                    </>
                );
            case 3: // *** NUEVO PASO: Verificación de Códigos ***
                return (
                    <>
                        <h3>Paso 3: Verificación de Códigos</h3>
                        <p className="instruction-text">
                            Hemos enviado códigos de verificación a tu correo electrónico (<span className="highlight-text">{formData.email}</span>) y número de WhatsApp (<span className="highlight-text">{formData.numero_domicilio}</span>).
                            Por favor, introdúcelos a continuación para continuar.
                        </p>

                        <div className="form-group">
                            <label htmlFor="emailCode">Código de Email:</label>
                            <input
                                type="text"
                                id="emailCode"
                                name="emailConfirmationCode" // Nombre para el input, no para formData
                                value={emailConfirmationCode}
                                onChange={(e) => setEmailConfirmationCode(e.target.value)}
                                placeholder="Introduce el código de email"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phoneCode">Código de WhatsApp:</label>
                            <input
                                type="text"
                                id="phoneCode"
                                name="phoneConfirmationCode" // Nombre para el input, no para formData
                                value={phoneConfirmationCode}
                                onChange={(e) => setPhoneConfirmationCode(e.target.value)}
                                placeholder="Introduce el código de WhatsApp"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Verificando...' : 'Validar Códigos'}
                        </button>
                        {/* Opcional: botón para reenviar códigos si lo necesitas. Requiere lógica adicional. */}
                        {/* <button type="button" onClick={handleResendCodes} disabled={isLoading}>Reenviar Códigos</button> */}
                    </>
                );
            case 4: // *** Antiguo Paso 3, ahora es Paso 4: Contraseña y Pregunta Secreta ***
                return (
                    <>
                        <h3>Paso 4: Contraseña y Pregunta Secreta</h3>
                        <div className="form-group">
                            <label htmlFor="contrasena">Contraseña:</label>
                            <input
                                type="password"
                                id="contrasena"
                                name="contrasena"
                                value={formData.contrasena}
                                onChange={handleChange}
                                placeholder="Mínimo 6 caracteres"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="pregunta_secreta">Pregunta Secreta:</label>
                            <input
                                type="text"
                                id="pregunta_secreta"
                                name="pregunta_secreta"
                                value={formData.pregunta_secreta}
                                onChange={handleChange}
                                placeholder="Ej. ¿Cuál es el nombre de tu primera mascota?"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="respuesta">Respuesta Secreta:</label>
                            <input
                                type="text"
                                id="respuesta"
                                name="respuesta"
                                value={formData.respuesta}
                                onChange={handleChange}
                                placeholder="Tu respuesta"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Registrando...' : 'Finalizar Registro'}
                        </button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="register-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="register-card">
                <img src={logoPichanguita} alt="Logo Pichanguita.pe" className="logo" />
                <h2>Registro de Cuenta</h2>
                
                <div className="step-indicator">
                    <span className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</span>
                    <span className={`step-line ${step >= 2 ? 'active' : ''}`}></span>
                    <span className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</span>
                    <span className={`step-line ${step >= 3 ? 'active' : ''}`}></span> {/* Línea para nuevo paso 3 */}
                    <span className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</span> {/* Nuevo punto para paso 3 */}
                    <span className={`step-line ${step >= 4 ? 'active' : ''}`}></span> {/* Línea para nuevo paso 4 */}
                    <span className={`step-dot ${step >= 4 ? 'active' : ''}`}>4</span> {/* Punto para nuevo paso 4 */}
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    {renderStep()}
                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>} {/* Mostrar mensajes de éxito */}
                </form>

                <p className="back-to-login" style={{ marginTop: '20px' }}>
                    ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión aquí</Link>
                </p>
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

export default RegisterPage;