import React, { useState } from 'react';
import './MainCliente.css'; // Importa los estilos específicos del cliente
import logoIcon from '../assets/logo-pichanguita-isotipo.png'; // Asegúrate de que esta ruta sea correcta

// Datos de los menús para el Cliente
const menuData = [
    {
        title: "🏟️ Mis Reservas",
        links: [
            { text: "📅 Próximas Reservas", href: "#" },
            { text: "📜 Historial de Reservas", href: "#" },
            { text: "✏️ Modificar Reserva", href: "#" },
            { text: "❌ Cancelar Reserva", href: "#" }
        ]
    },
    {
        title: "⚽ Buscar Canchas",
        links: [
            { text: "🔍 Buscar por Ubicación", href: "#" },
            { text: "⭐ Canchas Favoritas", href: "#" },
            { text: "📊 Canchas Populares", href: "#" },
            { text: "🆕 Nuevas Canchas", href: "#" }
        ]
    },
    {
        title: "👤 Mi Perfil",
        links: [
            { text: "⚙️ Configuración de Cuenta", href: "#" },
            { text: "💳 Métodos de Pago", href: "#" },
            { text: "🔔 Notificaciones", href: "#" },
            { text: "💬 Soporte", href: "#" }
        ]
    },
    {
        title: "🎁 Promociones",
        links: [
            { text: "🎉 Promociones Activas", href: "#" },
            { text: "🎟️ Mis Cupones", href: "#" }
        ]
    }
];

const MainCliente = ({ userName, handleLogout }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    return (
        <div className="client-panel">
            {/* Header */}
            <header className="header-minimal">
                <div className="logo">
                    <img src={logoIcon} alt="Logo" style={{ width: '32px' }} />
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
            <nav className="nav-minimal">
                <ul className="nav-list-minimal">
                    {menuData.map((menu, index) => (
                        <li key={index} className="nav-item-dropdown">
                            <a href="#" className="nav-link-minimal">
                                {menu.title}
                            </a>
                            <div className="dropdown-content">
                                {menu.links.map((link, linkIndex) => (
                                    <a key={linkIndex} href={link.href} className="dropdown-link">{link.text}</a>
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
                                    <li key={linkIndex}><a href={link.href} className="menu-link-mobile">{link.text}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contenido Principal */}
            <main className="container main-content">
                <section className="role-section">
                    <div className="role-header">
                        <span className="role-badge client-badge">ROL 6</span>
                        <h2 className="role-title">⚽ CLIENTE</h2>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                        ¡Bienvenido a Pichanguita.pe! Encuentra y reserva tu cancha favorita.
                    </p>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">3</div>
                            <div>Próximas Reservas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">15</div>
                            <div>Canchas Favoritas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">⭐ 4.8</div>
                            <div>Calificación Promedio</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>¡Reserva tu próxima pichanga!</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            Explora las canchas disponibles, revisa sus horarios y asegura tu espacio.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MainCliente;