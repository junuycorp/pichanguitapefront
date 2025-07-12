import React, { useState, useEffect, useRef } from 'react';
import './MainOwner.css'; // Importa los estilos específicos del dueño
import logoIcon from '../assets/logo-pichanguita-isotipo.png'; // Asegúrate de que esta ruta sea correcta

// Importar el nuevo componente de gestión de locales
import GestionEstablecimientos from './owner/GestionEstablecimientos'; // NUEVA IMPORTACIÓN

// Datos de los menús para el Owner
const menuData = [
    {
        title: "🏠 Mi Establecimiento",
        links: [
            { text: "📊 Dashboard de Mi Negocio", component: null },
            { text: "🏢 Mis Establecimientos", component: "GestionEstablecimientos" },
            { text: "📷 Galería de Fotos", component: null },
            { text: "⏰ Horarios de Atención", component: null }
        ]
    },
    {
        title: "⚽ Gestión de Canchas",
        links: [
            { text: "🏟️ Mis Canchas", component: null },
            { text: "💰 Precios y Tarifas", component: null },
            { text: "🔧 Mantenimiento de Canchas", component: null },
            { text: "📅 Disponibilidad", component: null }
        ]
    },
    {
        title: "📋 Gestión de Reservas",
        links: [
            { text: "📅 Calendario de Reservas", component: null },
            { text: "➕ Nueva Reserva Manual", component: null },
            { text: "✏️ Modificar Reservas", component: null },
            { text: "❌ Cancelar Reservas", component: null },
            { text: "🔔 Notificaciones de Reservas", component: null }
        ]
    },
    {
        title: "💰 Finanzas",
        links: [
            { text: "💵 Ingresos del Día", component: null },
            { text: "📊 Reportes Financieros", component: null },
            { text: "🧾 Historial de Pagos", component: null },
            { text: "💳 Métodos de Cobro", component: null }
        ]
    },
    {
        title: "👥 Clientes",
        links: [
            { text: "📝 Lista de Clientes", component: null },
            { text: "⭐ Reseñas y Calificaciones", component: null },
            { text: "🎯 Promociones y Descuentos", component: null }
        ]
    }
];

const MainOwner = ({ userName, handleLogout }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [activeComponent, setActiveComponent] = useState(null); // Estado para el componente a renderizar
    const navRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Función para renderizar el componente activo
    const renderActiveComponent = () => {
        switch (activeComponent) {
            case "GestionEstablecimientos":
                return <GestionEstablecimientos />;
            // Agrega más casos aquí a medida que crees nuevos componentes
            default:
                // Dashboard por defecto
                return (
                    <section className="role-section">
                        <div className="role-header">
                            <span className="role-badge owner-badge">ROL 2</span>
                            <h2 className="role-title">🏢 DUEÑO DE ESTABLECIMIENTO</h2>
                        </div>
                        <h2 className="role-title" style={{ marginBottom: '1rem' }}>
                            ¡Bienvenido, {userName}!
                        </h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                            Aquí puedes gestionar todos los aspectos de tu establecimiento y canchas.
                        </p>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-number">3</div>
                                <div>Canchas Activas</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">12</div>
                                <div>Reservas Hoy</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">$500</div>
                                <div>Ingresos Hoy</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '3rem' }}>
                            <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>Dashboard de Mi Negocio</h3>
                            <p style={{ color: 'var(--color-text-secondary)' }}>
                                Vista general de tus métricas clave: reservas, ingresos y ocupación de canchas.
                            </p>
                        </div>
                    </section>
                );
        }
    };

    // Lógica para cerrar menús desplegables y el menú móvil si se hace clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            // Cerrar dropdowns de escritorio
            if (navRef.current && !navRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
            // Cerrar menú móvil
            if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && event.target.className !== 'hamburger-menu') {
                setMobileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    // Función para alternar el menú móvil
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    // Función para alternar los dropdowns del menú de escritorio
    const toggleDropdown = (title) => {
        setActiveDropdown(activeDropdown === title ? null : title);
    };

    // Función para manejar el click en un enlace de navegación
    const handleNavLinkClick = (componentName, event, isMobile = false) => {
        event.preventDefault();
        console.log('Clic en:', componentName); // Para debugging
        setActiveComponent(componentName);

        if (isMobile) {
            setMobileMenuOpen(false);
        } else {
            setActiveDropdown(null);
        }
    };

    // Función para cambiar el tema (oscuro/claro)
    const toggleTheme = () => {
        const root = document.documentElement;
        root.setAttribute(
            'data-theme',
            root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
        );
    };
    
    return (
        <div className="owner-panel">

            {/* Header */}
            <header className="header-minimal">
                <div className="logo">
                    <img src={logoIcon} alt="Logo" style={{ width: '32px' }} />
                    <span>Reservas de Fútbol</span>
                </div>
                <button className="hamburger-menu" onClick={() => setMobileMenuOpen(true)}>☰</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={toggleTheme} className="theme-toggle" title="Cambiar tema">🌙</button>
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid white', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Salir</button>
                </div>
            </header>

            {/* Navegación para Escritorio con Desplegables */}
            <nav className="nav-minimal" ref={navRef}>
                <ul className="nav-list-minimal">
                    {menuData.map((menu, index) => (
                        <li key={index} className="nav-item-dropdown">
                            <a href="#" className="nav-link-minimal">
                                {menu.title}
                            </a>
                            <div className="dropdown-content">
                                {menu.links.map((link, linkIndex) => (
                                    <a
                                        key={linkIndex}
                                        href="#"
                                        className="dropdown-link"
                                        onClick={(e) => {
                                            if (link.component) {
                                                handleNavLinkClick(link.component, e);
                                            } else {
                                                e.preventDefault();
                                                alert(`Funcionalidad "${link.text}" en desarrollo`);
                                            }
                                        }}
                                    >
                                        {link.text}
                                    </a>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Menú Overlay para Móvil */}
            <div className={`menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <div className="menu-vertical" ref={mobileMenuRef} onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>&times;</button>
                    <div style={{ padding: '1rem 0', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                        <h3>Hola, {userName}</h3>
                    </div>
                    {menuData.map((category, index) => (
                        <div key={index} className="menu-category-mobile">
                            <h3 className="category-title-mobile">{category.title}</h3>
                            <ul className="menu-list-mobile">
                                {category.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a 
                                            href="#" 
                                            className="menu-link-mobile"
                                            onClick={(e) => {
                                                if (link.component) {
                                                    handleNavLinkClick(link.component, e, true);
                                                } else {
                                                    e.preventDefault();
                                                    alert(`Funcionalidad "${link.text}" en desarrollo`);
                                                }
                                            }}
                                        >
                                            {link.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contenido Principal - SOLO renderiza el componente activo */}
            <main className="container main-content">
                {renderActiveComponent()}
            </main>
        </div>
    );
};

export default MainOwner;