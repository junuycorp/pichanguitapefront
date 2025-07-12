import React, { useState, useEffect, useRef } from 'react';
import './MainAdmin.css'; // Asegúrate que esta ruta es correcta
import logoIcon from '../assets/logo-pichanguita-isotipo.png'; // Ruta de tu logo
import UserManagement from './admin/GestionUsuarios'; // NUEVA IMPORTACIÓN
import GestionEstablecimientosPendientes from './admin/GestionEstablecimientosPendientes';
// Datos de los menús para no repetir código
const menuData = [
    {
        title: "Gestión de Usuarios",
        links: [
            { text: "👥 Usuarios Registrados", component: "UserManagement" }, // Enlazar a un componente
            { text: "🔑 Roles y Permisos", component: null },
            { text: "🏢 Gestión de Dueños", component: null },
            { text: "🔒 Usuarios Bloqueados", component: null }
        ]
    },
    {
        title: "Gestión de Establecimientos",
        links: [
            { text: "🏟️ Todos los Establecimientos", component: null },
            { text: "⚽ Todas las Canchas", component: null },
            { text: "➕ Aprobación de Nuevos", component: "GestionEstablecimientosPendientes" },
            { text: "📋 Auditoría de Establecimientos", component: null }
        ]
    },
    {
        title: "Gestión Financiera",
        links: [
            { text: "💰 Comisiones del Sistema", component: null },
            { text: "💳 Métodos de Pago", component: null },
            { text: "💸 Todas las Transacciones", component: null },
            { text: "📊 Facturación Global", component: null }
        ]
    }
];

const MainAdmin = ({ userName, handleLogout }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [activeComponent, setActiveComponent] = useState("welcome"); // Estado para el componente activo
    const navRef = useRef(null);

    // Lógica para cerrar el menú desplegable si se hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event) {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setActiveDropdown(null); // Cierra el menú activo
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleNavLinkClick = (componentName, event, isMobile = false) => {
        if (componentName) {
            setActiveComponent(componentName);
            if (isMobile) {
                setMobileMenuOpen(false); // Cierra el menú móvil al seleccionar
            }
        } else {
            // Manejar si el link no tiene un componente asociado (por ahora)
            alert("Esta funcionalidad aún no está implementada.");
            if (isMobile) {
                setMobileMenuOpen(false);
            }
        }
        setActiveDropdown(null); // Cierra cualquier dropdown activo
    };

    const toggleTheme = () => {
        const root = document.documentElement;
        root.classList.add('theme-animating');
        setTimeout(() => {
            root.classList.remove('theme-animating');
        }, 400);

        if (root.getAttribute('data-theme') === 'dark') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', 'dark');
        }
    };

    const handleDropdownClick = (index, event) => {
        event.preventDefault(); // Previene la navegación
        setActiveDropdown(activeDropdown === index ? null : index);
    };

    const renderActiveComponent = () => {
        switch (activeComponent) {
            case "UserManagement":
                return <UserManagement />;
            case "GestionEstablecimientosPendientes":
                return <GestionEstablecimientosPendientes />;
            // Agrega otros casos aquí para futuros componentes
            default:
                return (
                    <section className="role-section">
                        <h2 className="role-title" style={{ marginBottom: '1rem' }}>
                            Bienvenido, {userName}!
                        </h2>
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            Selecciona una opción del menú para gestionar el sistema.
                        </p>

                        <div className="stats-grid" style={{ marginTop: '2rem' }}>
                            <div className="stat-card">
                                <div className="stat-number">120</div>
                                <div>Usuarios Activos</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">45</div>
                                <div>Establecimientos</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">$15K</div>
                                <div>Ingresos (Mes)</div>
                            </div>
                        </div>
                    </section>
                );
        }
    };

    return (
        <div className="admin-panel">
            {/* Header */}
            <header className="header-minimal">
                <div className="logo" title="Reserva tu cancha ya">
                    <img src={logoIcon} alt="Logo Pichanguita.pe" style={{ width: '32px' }} />
                    <span>Pichanguita.pe</span>
                </div>
                {/* Botón de Hamburguesa para Móvil */}
                <button className="hamburger-menu" onClick={() => setMobileMenuOpen(true)}>☰</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={toggleTheme} className="theme-toggle" title="Cambiar tema">🌙</button>
                    <button onClick={handleLogout} className="logout-button">Salir</button>
                </div>
            </header>

            {/* Navegación para Escritorio con Desplegables - Se abre con HOVER */}
            <nav className="nav-minimal" ref={navRef}>
                <ul className="nav-list-minimal">
                    {menuData.map((menu, index) => (
                        <li key={index} className={`nav-item-dropdown ${activeDropdown === index ? 'active' : ''}`}>
                            <a href="#" className="nav-link-minimal" onClick={(e) => handleDropdownClick(index, e)}>
                                {menu.title}
                            </a>
                            <div className="dropdown-content">
                                {menu.links.map((link, linkIndex) => (
                                    <a
                                        key={linkIndex}
                                        href="#"
                                        className="dropdown-link"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavLinkClick(link.component, e);
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
                <div className="menu-vertical" onClick={(e) => e.stopPropagation()}>
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
                                                e.preventDefault();
                                                handleNavLinkClick(link.component, e, true);
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

            {/* Contenido Principal */}
            <main className="container main-content">
                {renderActiveComponent()}
            </main>
        </div>
    );
};

export default MainAdmin;