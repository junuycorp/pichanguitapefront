import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GestionUsuarios.css'; // Estilos específicos para el CRUD

// Mapeo de perfil_codigo a nombre de rol
const profileCodes = {
    1: 'Administrador',
    3: 'Dueño',
    6: 'Cliente'
};

const secretQuestions = [
    { value: '', label: 'Selecciona una pregunta secreta' },
    { value: 'nombre_papa', label: '¿Cuál es el nombre de tu padre?' },
    { value: 'nombre_mama', label: '¿Cuál es el nombre de tu madre?' },
    { value: 'ultimo_digito_dni', label: '¿Cuál es el último dígito de tu DNI?' },
    { value: 'lugar_nacimiento', label: '¿Cuál es tu lugar de nacimiento?' }
];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Modal para crear/editar
    const [isViewModalOpen, setIsViewModalOpen] = useState(false); // Modal para ver detalles
    const [currentForm, setCurrentForm] = useState('create'); // 'create' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null); // Usuario para editar o ver

    // Estados para búsqueda y filtrado
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProfile, setFilterProfile] = useState('');

    // Estado para el formulario de CREATE/EDIT
    const [formData, setFormData] = useState({
        usuario: '',
        contrasena: '',
        email: '',
        perfil_codigo: '',
        usuario_nombre: '', // Nuevo campo
        pregunta_secreta: '', // Nuevo campo
        respuesta: '', // Nuevo campo
        nro_wp: '', // Nuevo campo
        estado_registro: true, // Nuevo campo, por defecto activo
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const getToken = () => {
        return localStorage.getItem('authToken');
    };

    // --- Cargar Usuarios ---
    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const token = getToken();
            if (!token) {
                setError('No autenticado. Por favor, inicia sesión.');
                setLoading(false);
                return;
            }
            const response = await axios.get(`${backendUrl}/usuario`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Error al obtener usuarios:', err);
            setError('Error al cargar usuarios. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- Lógica de Filtrado y Búsqueda ---
    const filteredUsers = users.filter(user => {
        const matchesSearch = searchTerm ?
            user.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) :
            true;

        const matchesProfile = filterProfile ?
            String(user.perfil_codigo) === filterProfile :
            true;

        return matchesSearch && matchesProfile;
    });

    // --- Manejo del Formulario (Crear/Editar) ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = getToken();
            if (!token) {
                setError('No autenticado.');
                return;
            }
            if (!formData.usuario || !formData.contrasena || !formData.email || !formData.perfil_codigo || !formData.usuario_nombre) {
                setError('Los campos "Usuario", "Contraseña", "Email", "Nombre de Usuario" y "Rol" son requeridos.');
                return;
            }
            // Validación básica de número de WhatsApp
            if (formData.nro_wp && !/^\+?[0-9]{7,15}$/.test(formData.nro_wp)) {
                setError('El número de WhatsApp no es válido.');
                return;
            }

            await axios.post(`${backendUrl}/usuario`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Usuario creado exitosamente!');
            closeFormModal();
            fetchUsers();
        } catch (err) {
            console.error('Error al crear usuario:', err);
            setError(err.response?.data?.message || 'Error al crear usuario.');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = getToken();
            if (!token || !selectedUser) {
                setError('No autenticado o usuario no seleccionado.');
                return;
            }

            // Crear un objeto con solo los campos que se van a enviar para actualizar
            const updatePayload = {
                email: formData.email,
                usuario_nombre: formData.usuario_nombre,
                pregunta_secreta: formData.pregunta_secreta,
                respuesta: formData.respuesta,
                nro_wp: formData.nro_wp,
                perfil_codigo: formData.perfil_codigo,
                estado_registro: formData.estado_registro,
            };

            // Solo incluye la contraseña si se ha modificado (no está vacía)
            if (formData.contrasena) {
                updatePayload.contrasena = formData.contrasena;
            }
            // Validación básica de número de WhatsApp
            if (updatePayload.nro_wp && !/^\+?[0-9]{7,15}$/.test(updatePayload.nro_wp)) {
                setError('El número de WhatsApp no es válido.');
                return;
            }

            await axios.put(`${backendUrl}/usuario/${selectedUser.usuario}`, updatePayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Usuario actualizado exitosamente!');
            closeFormModal();
            fetchUsers();
        } catch (err) {
            console.error('Error al actualizar usuario:', err);
            setError(err.response?.data?.message || 'Error al actualizar usuario.');
        }
    };

    const handleDeleteUser = async (usuarioToDelete) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar a "${usuarioToDelete}"?`)) {
            return;
        }
        setError('');
        try {
            const token = getToken();
            if (!token) {
                setError('No autenticado.');
                return;
            }
            await axios.delete(`${backendUrl}/usuario/${usuarioToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Usuario eliminado exitosamente!');
            fetchUsers();
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            setError(err.response?.data?.message || 'Error al eliminar usuario.');
        }
    };

    // --- Manejo de Modales ---
    const openCreateModal = () => {
        setCurrentForm('create');
        setFormData({
            usuario: '', contrasena: '', email: '', perfil_codigo: '',
            usuario_nombre: '', pregunta_secreta: '', respuesta: '', nro_wp: '', estado_registro: true
        });
        setSelectedUser(null);
        setError('');
        setIsFormModalOpen(true);
    };

    const openEditModal = (user) => {
        setCurrentForm('edit');
        setSelectedUser(user);
        setFormData({
            usuario: user.usuario || '',
            contrasena: '', // No precargar la contraseña por seguridad
            email: user.email || '',
            perfil_codigo: user.perfil_codigo || '',
            usuario_nombre: user.usuario_nombre || '',
            pregunta_secreta: user.pregunta_secreta || '',
            respuesta: user.respuesta || '',
            nro_wp: user.nro_wp || '',
            estado_registro: user.estado_registro === undefined ? true : user.estado_registro,
        });
        setError('');
        setIsFormModalOpen(true);
    };

    const openViewModal = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setError('');
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setError('');
        setSelectedUser(null);
    };

    if (loading) {
        return (
            <div className="user-management-container">
                <p>Cargando usuarios...</p>
            </div>
        );
    }

    return (
        <div className="user-management-container role-section">
            <div className="user-management-header">
                <h2>Gestión de Usuarios</h2>
                <button className="add-user-button" onClick={openCreateModal}>
                    ➕ Añadir Nuevo Usuario
                </button>
            </div>

            <div className="filter-controls">
                <input
                    type="text"
                    placeholder="Buscar por usuario o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={filterProfile}
                    onChange={(e) => setFilterProfile(e.target.value)}
                    className="profile-filter-select"
                >
                    <option value="">Todos los Perfiles</option>
                    <option value="1">Administrador</option>
                    <option value="3">Dueño</option>
                    <option value="6">Cliente</option>
                </select>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="user-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th className="hide-on-mobile">Email</th>
                            <th>Perfil</th>
                            <th>Estado</th> {/* Nueva columna */}
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
<tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5}>No se encontraron usuarios.</td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.usuario} onClick={() => openViewModal(user)} className="table-row-clickable">
                                    <td data-label="Usuario">
                                        <span className="mobile-label">Usuario:</span> {/* Nuevo */}
                                        {user.usuario}
                                    </td>
                                    {/* Email se oculta en móvil, pero mantenemos su estructura si decidieras mostrarlo en el futuro */}
                                    <td data-label="Email" className="hide-on-mobile">
                                        <span className="mobile-label">Email:</span> {/* Nuevo */}
                                        {user.email}
                                    </td>
                                    <td data-label="Perfil">
                                        <span className="mobile-label">Perfil:</span> {/* Nuevo */}
                                        {profileCodes[user.perfil_codigo] || 'Desconocido'}
                                    </td>
                                    <td data-label="Estado">
                                        <span className="mobile-label">Estado:</span> {/* Nuevo */}
                                        <span className={`status-badge ${user.estado_registro ? 'active' : 'inactive'}`}>
                                            {user.estado_registro ? 'Activo' : 'Desactivado'}
                                        </span>
                                    </td>
                                    <td data-label="Acciones" onClick={(e) => e.stopPropagation()}>
                                        <span className="mobile-label">Acciones:</span> {/* Nuevo */}
                                        <div className="action-buttons-wrapper"> {/* Nuevo wrapper */}
                                            <button className="icon-button view-button" onClick={() => openViewModal(user)} title="Ver Detalles">
                                                👁️
                                            </button>
                                            <button className="icon-button edit-button" onClick={() => openEditModal(user)} title="Editar Usuario">
                                                ✏️
                                            </button>
                                            <button className="icon-button delete-button" onClick={() => handleDeleteUser(user.usuario)} title="Eliminar Usuario">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.usuario} onClick={() => openViewModal(user)} className="table-row-clickable">
                                    <td data-label="Usuario">{user.usuario}</td>
                                    <td data-label="Email" className="hide-on-mobile">{user.email}</td>
                                    <td data-label="Perfil">{profileCodes[user.perfil_codigo] || 'Desconocido'}</td>
                                    <td data-label="Estado">
                                        <span className={`status-badge ${user.estado_registro ? 'active' : 'inactive'}`}>
                                            {user.estado_registro ? 'Activo' : 'Desactivado'}
                                        </span>
                                    </td>
                                    <td data-label="Acciones" onClick={(e) => e.stopPropagation()}> {/* Stop propagation for row click */}
                                        <button className="icon-button view-button" onClick={() => openViewModal(user)} title="Ver Detalles">
                                            👁️
                                        </button>
                                        <button className="icon-button edit-button" onClick={() => openEditModal(user)} title="Editar Usuario">
                                            ✏️
                                        </button>
                                        <button className="icon-button delete-button" onClick={() => handleDeleteUser(user.usuario)} title="Eliminar Usuario">
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para Crear/Editar Usuario */}
            {isFormModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{currentForm === 'create' ? 'Crear Nuevo Usuario' : `Editar Usuario: ${selectedUser?.usuario}`}</h3>
                        <form onSubmit={currentForm === 'create' ? handleCreateUser : handleUpdateUser}>
                            {currentForm === 'create' && (
                                <div className="form-group">
                                    <label htmlFor="usuario">Usuario:</label>
                                    <input
                                        type="text"
                                        id="usuario"
                                        name="usuario"
                                        value={formData.usuario}
                                        onChange={handleChange}
                                        required
                                        autoComplete="off"
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="usuario_nombre">Nombre de Usuario:</label>
                                <input
                                    type="text"
                                    id="usuario_nombre"
                                    name="usuario_nombre"
                                    value={formData.usuario_nombre}
                                    onChange={handleChange}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="contrasena">{currentForm === 'create' ? 'Contraseña:' : 'Nueva Contraseña (opcional):'}</label>
                                <input
                                    type="password"
                                    id="contrasena"
                                    name="contrasena"
                                    value={formData.contrasena}
                                    onChange={handleChange}
                                    required={currentForm === 'create'}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="nro_wp">Número de WhatsApp:</label>
                                <input
                                    type="text"
                                    id="nro_wp"
                                    name="nro_wp"
                                    value={formData.nro_wp}
                                    onChange={handleChange}
                                    placeholder="+519XXXXXXXXX"
                                    pattern="^\+?[0-9]{7,15}$" // Validación simple de formato
                                    title="Introduce un número de teléfono válido (ej: +51912345678)"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="perfil_codigo">Rol:</label>
                                <select
                                    id="perfil_codigo"
                                    name="perfil_codigo"
                                    value={formData.perfil_codigo}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Selecciona un Rol</option>
                                    <option value="1">Administrador</option>
                                    <option value="3">Dueño</option>
                                    <option value="6">Cliente</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="pregunta_secreta">Pregunta Secreta:</label>
                                <select
                                    id="pregunta_secreta"
                                    name="pregunta_secreta"
                                    value={formData.pregunta_secreta}
                                    onChange={handleChange}
                                >
                                    {secretQuestions.map(q => (
                                        <option key={q.value} value={q.value}>{q.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="respuesta">Respuesta Secreta:</label>
                                <input
                                    type="text"
                                    id="respuesta"
                                    name="respuesta"
                                    value={formData.respuesta}
                                    onChange={handleChange}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="estado_registro"
                                    name="estado_registro"
                                    checked={formData.estado_registro}
                                    onChange={handleChange}
                                />
                                <label htmlFor="estado_registro">
                                    Estado: <span className={`status-text ${formData.estado_registro ? 'active' : 'inactive'}`}>
                                        {formData.estado_registro ? 'Activo' : 'Desactivado'}
                                    </span>
                                </label>
                            </div>

                            {error && <p className="modal-error-message">{error}</p>}

                            <div className="modal-actions">
                                <button type="submit" className="save-button">
                                    {currentForm === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                                </button>
                                <button type="button" className="cancel-button" onClick={closeFormModal}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Ver Detalles del Usuario */}
            {isViewModalOpen && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content view-modal">
                        <h3>Detalles del Usuario: {selectedUser.usuario}</h3>
                        <div className="user-details-grid">
                            <p><strong>Usuario:</strong> {selectedUser.usuario}</p>
                            <p><strong>Nombre:</strong> {selectedUser.usuario_nombre || 'N/A'}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Rol:</strong> {profileCodes[selectedUser.perfil_codigo] || 'Desconocido'}</p>
                            <p><strong>Nro. WhatsApp:</strong> {selectedUser.nro_wp || 'N/A'}</p>
                            <p><strong>Pregunta Secreta:</strong> {secretQuestions.find(q => q.value === selectedUser.pregunta_secreta)?.label || 'N/A'}</p>
                            <p><strong>Respuesta Secreta:</strong> {selectedUser.respuesta || 'N/A'}</p>
                            <p><strong>Estado:</strong>
                                <span className={`status-badge ${selectedUser.estado_registro ? 'active' : 'inactive'}`}>
                                    {selectedUser.estado_registro ? 'Activo' : 'Desactivado'}
                                </span>
                            </p>
                            {/* Puedes añadir más campos aquí si los recibes del backend */}
                            {/* <p><strong>Contraseña (old):</strong> {selectedUser.contrasena_old || 'N/A'}</p> */}
                            {/* <p><strong>Nro. Documento:</strong> {selectedUser.nro_docu || 'N/A'}</p> */}
                            {/* <p><strong>Fecha Nacimiento:</strong> {selectedUser.fecha_nacimiento ? new Date(selectedUser.fecha_nacimiento).toLocaleDateString() : 'N/A'}</p> */}
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="cancel-button" onClick={closeViewModal}>
                                Retroceder
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;