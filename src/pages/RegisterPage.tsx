import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css'; // Estilos específicos para esta página
import logoPichanguita from '../assets/logo-pichanguita-isotipo.png'; // Logo
import backgroundImage from '../assets/cancha_noche.jpeg'; // Fondo

// Íconos si los necesitas (puedes usar react-icons o similares si instalas)
// import { FaSearch } from 'react-icons/fa'; // Si usas react-icons

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
        honeypot: '', // Campo honeypot para el backend
        // Nuevos campos para validación
        codigo_email: '',
        codigo_numero_domicilio: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Para mostrar estado de carga

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = async () => {
        setError('');
        setLoading(true);
        
        try {
            // Validaciones para cada paso antes de avanzar
            if (step === 1) {
                const { nro_docu, nombres, apellidos, fecha_nacimiento } = formData;
                if (!nro_docu || !nombres || !apellidos || !fecha_nacimiento) {
                    setError('Por favor, completa todos los campos del Paso 1.');
                    setLoading(false);
                    return;
                }
            }
            
            if (step === 2) {
                const { rol, domicilio, email, numero_domicilio } = formData;
                if (!rol || !email || !numero_domicilio || (rol === 'owner' && !domicilio)) {
                    setError('Por favor, selecciona un rol y completa todos los campos de contacto.');
                    setLoading(false);
                    return;
                }

                // Enviar datos de contacto para validación
                const validationData = {
                    nro_docu: formData.nro_docu,
                    email: formData.email,
                    numero_domicilio: formData.numero_domicilio,
                    honeypot: formData.honeypot
                };

                const response = await fetch(`${backendUrl}/validar-contacto`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(validationData),
                });

                const data = await response.json();

                if (response.ok) {
                    // Guardar los códigos recibidos (solo para referencia en desarrollo)
                    console.log('Códigos recibidos:', data);
                    formData.codigo_email=data.codigo_email;
                    formData.codigo_numero_domicilio= data.codigo_numero_domicilio;
                    setMessage(`Se han enviado códigos de verificación a tu email y WhatsApp.`);
                } else {
                    setError(data.message || 'Error al enviar códigos de verificación. Por favor, intenta de nuevo.');
                    setLoading(false);
                    return;
                }
            }
            
            setStep(prev => prev + 1);
        } catch (err) {
            console.error('Error de red o del servidor:', err);
            setError('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setError('');
        setMessage('');
        setStep(prev => prev - 1);
    };

    const handleValidateCodes = async () => {
        setError('');
        setMessage('');
        setLoading(true);

        const { codigo_email, codigo_numero_domicilio } = formData;
        if (!codigo_email || !codigo_numero_domicilio) {
            setError('Por favor, ingresa ambos códigos de verificación.');
            setLoading(false);
            return;
        }

        try {
            const verificationData = {
                nro_docu: formData.nro_docu,
                email: formData.email,
                numero_domicilio: formData.numero_domicilio,
                codigo_email: formData.codigo_email,
                codigo_numero_domicilio: formData.codigo_numero_domicilio,
                honeypot: formData.honeypot
            };

            const response = await fetch(`${backendUrl}/verificar-codigos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(verificationData),
            });

            const data = await response.json();

            if (response.ok) {
                const { check_email, check_numero_domicilio } = data;
                
                if (check_email && check_numero_domicilio) {
                    setMessage('¡Códigos verificados correctamente!');
                    setTimeout(() => {
                        setStep(4); // Ir al paso de seguridad (contraseña)
                    }, 1500);
                } else {
                    let errorMsg = 'Códigos incorrectos:';
                    if (!check_email) errorMsg += ' Email inválido.';
                    if (!check_numero_domicilio) errorMsg += ' WhatsApp inválido.';
                    setError(errorMsg);
                }
            } else {
                setError(data.message || 'Error al verificar códigos. Por favor, intenta de nuevo.');
            }
        } catch (err) {
            console.error('Error de red o del servidor:', err);
            setError('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        const { contrasena, pregunta_secreta, respuesta } = formData;
        if (!contrasena || !pregunta_secreta || !respuesta) {
            setError('Por favor, completa todos los campos de seguridad.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/registro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`¡Bienvenido ${formData.nombres} ${formData.apellidos}! Tu cuenta ha sido creada exitosamente. Se ha enviado un correo para activar tu cuenta.`);
                setStep(5); // Ir a la pantalla de éxito
            } else {
                setError(data.message || 'Error en el registro. Por favor, intenta de nuevo.');
            }
        } catch (err) {
            console.error('Error de red o del servidor:', err);
            setError('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h3>Paso 1: Datos Personales</h3>
                        <div className="form-group">
                            <label htmlFor="nro_docu">DNI:</label>
                            <div className="input-with-button">
                                <input
                                    type="text"
                                    id="nro_docu"
                                    name="nro_docu"
                                    value={formData.nro_docu}
                                    onChange={handleChange}
                                    required
                                    placeholder="Número de documento"
                                />
                                <button type="button" className="icon-button" title="Buscar DNI">
                                    {/* <FaSearch />  // Si usas react-icons */}
                                    🔍
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="nombres">Nombres:</label>
                            <input
                                type="text"
                                id="nombres"
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleChange}
                                required
                                placeholder="Tus nombres"
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
                                required
                                placeholder="Tus apellidos"
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
                            />
                        </div>
                        <button type="button" className="next-button" onClick={handleNext} disabled={loading}>
                            {loading ? 'Cargando...' : 'Siguiente'}
                        </button>
                    </>
                );
            case 2:
                return (
                    <>
                        <h3>Paso 2: Tipo de Usuario y Contacto</h3>
                        <div className="form-group">
                            <label>Soy:</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="rol"
                                        value="owner"
                                        checked={formData.rol === 'owner'}
                                        onChange={handleChange}
                                    /> Dueño de Establecimiento
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="rol"
                                        value="cliente"
                                        checked={formData.rol === 'cliente'}
                                        onChange={handleChange}
                                    /> Cliente
                                </label>
                            </div>
                        </div>
                        {formData.rol === 'owner' && (
                            <div className="form-group">
                                <label htmlFor="domicilio">Dirección del Establecimiento:</label>
                                <input
                                    type="text"
                                    id="domicilio"
                                    name="domicilio"
                                    value={formData.domicilio}
                                    onChange={handleChange}
                                    required={formData.rol === 'owner'}
                                    placeholder="Dirección completa del local"
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
                                required
                                placeholder="tu@correo.com"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="numero_domicilio">Número Celular / WhatsApp:</label>
                            <input
                                type="text"
                                id="numero_domicilio"
                                name="numero_domicilio"
                                value={formData.numero_domicilio}
                                onChange={handleChange}
                                required
                                placeholder="Ej: 987654321"
                            />
                        </div>
                        <div className="form-buttons">
                            <button type="button" className="back-button" onClick={handleBack}>Atrás</button>
                            <button type="button" className="next-button" onClick={handleNext} disabled={loading}>
                                {loading ? 'Enviando códigos...' : 'Siguiente'}
                            </button>
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <h3>Paso 3: Verificación de Contacto</h3>
                        {message && <p className="success-message">{message}</p>}
                        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '20px' }}>
                            Hemos enviado códigos de verificación a tu email y WhatsApp. Por favor, ingrésalos a continuación:
                        </p>
                        
                        <div className="form-group">
                            <label htmlFor="codigo_email">Código de Email:</label>
                            <input
                                type="text"
                                id="codigo_email"
                                name="codigo_email"
                                value={formData.codigo_email}
                                onChange={handleChange}
                                required
                                placeholder="Ingresa el código de tu email"
                                maxLength="6"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="codigo_numero_domicilio">Código de WhatsApp:</label>
                            <input
                                type="text"
                                id="codigo_numero_domicilio"
                                name="codigo_numero_domicilio"
                                value={formData.codigo_numero_domicilio}
                                onChange={handleChange}
                                required
                                placeholder="Ingresa el código de WhatsApp"
                                maxLength="6"
                            />
                        </div>
                        
                        <div className="form-buttons">
                            <button type="button" className="back-button" onClick={handleBack}>Atrás</button>
                            <button type="button" className="next-button" onClick={handleValidateCodes} disabled={loading}>
                                {loading ? 'Verificando...' : 'Validar Códigos'}
                            </button>
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <h3>Paso 4: Seguridad de la Cuenta</h3>
                        <div className="form-group">
                            <label htmlFor="contrasena">Contraseña:</label>
                            <input
                                type="password"
                                id="contrasena"
                                name="contrasena"
                                value={formData.contrasena}
                                onChange={handleChange}
                                required
                                placeholder="Mínimo 8 caracteres"
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
                                required
                                placeholder="Ej: ¿Nombre de tu primera mascota?"
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
                                required
                                placeholder="Tu respuesta"
                            />
                        </div>
                        {/* Campo Honeypot para anti-robot. Mantenerlo oculto con CSS */}
                        <div className="form-group honeypot-field">
                            <label htmlFor="honeypot" className="visually-hidden">No llenar este campo:</label>
                            <input
                                type="text"
                                id="honeypot"
                                name="honeypot"
                                value={formData.honeypot}
                                onChange={handleChange}
                                tabIndex={-1}
                                autoComplete="off"
                                className="visually-hidden"
                            />
                        </div>
                        {/* Aquí iría el componente "No soy un robot" (reCAPTCHA u otro) */}
                        <div className="recaptcha-placeholder" style={{ margin: '20px 0', padding: '15px', border: '1px dashed var(--color-border)', borderRadius: '8px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                            <span>[Aquí va el componente "No soy un robot" - Ej: reCAPTCHA]</span>
                        </div>
                        <div className="form-buttons">
                            <button type="button" className="back-button" onClick={handleBack}>Atrás</button>
                            <button type="submit" className="submit-button" disabled={loading}>
                                {loading ? 'Registrando...' : 'Registrarse'}
                            </button>
                        </div>
                    </>
                );
            case 5:
                return (
                    <>
                        <h3 className="success-title">¡Bienvenido {formData.nombres} {formData.apellidos}!</h3>
                        <p className="success-message">{message}</p>
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            Por favor, revisa tu correo electrónico para activar tu cuenta antes de iniciar sesión.
                        </p>
                        <button type="button" className="submit-button" onClick={() => navigate('/login')}>
                            Finalizar (Ir al Login)
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
                    <span className={`step-line ${step >= 3 ? 'active' : ''}`}></span>
                    <span className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</span>
                    <span className={`step-line ${step >= 4 ? 'active' : ''}`}></span>
                    <span className={`step-dot ${step >= 4 ? 'active' : ''}`}>4</span>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    {renderStep()}
                    {error && <p className="error-message">{error}</p>}
                </form>

                <p className="back-to-login" style={{ marginTop: '20px' }}>
                    ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;