import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../admin/GestionUsuarios.css'; // Reutilizamos los estilos de GestionUsuarios

// Mapeo de estados de aceptación
const acceptanceStatus = {
    true: 'Aceptado',
    false: 'Pendiente',
    null: 'Sin revisar'
};

// Mapeo de ubicaciones (puedes expandir según tu sistema)
const ubicaciones = [
    { value: '', label: 'Selecciona una ubicación' },
    { value: '070705', label: 'Lima - Centro' },
    { value: 2, label: 'Lima - Norte' },
    { value: 3, label: 'Lima - Sur' },
    { value: 4, label: 'Lima - Este' },
    { value: 5, label: 'Callao' },
    // Añade más ubicaciones según tu sistema
];

const GestionEstablecimientos = () => {
    const [establecimientos, setEstablecimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [currentForm, setCurrentForm] = useState('create'); // 'create' or 'edit'
    const [selectedEstablecimiento, setSelectedEstablecimiento] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    // Estados para búsqueda y filtrado
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Estado para el formulario de CREATE/EDIT
    const [formData, setFormData] = useState({
        direccion: '',
        descripcion: '',
        ubicacion: '',
        ubicacion_google_maps: '',
        id_owner: '',
        usuario_owner: ''
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const getToken = () => {
        return localStorage.getItem('authToken');
    };

    const getUserInfo = () => {
        // Obtener información del usuario desde localStorage o token
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    };

    // --- Cargar Establecimientos ---
    const fetchEstablecimientos = async () => {
        setLoading(true);
        setError('');
        try {
            const token = getToken();
            if (!token) {
                setError('No autenticado. Por favor, inicia sesión.');
                setLoading(false);
                return;
            }
            const response = await axios.get(`${backendUrl}/owner/local/mis-locales`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEstablecimientos(response.data);
        } catch (err) {
            console.error('Error al obtener establecimientos:', err);
            setError('Error al cargar establecimientos. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // --- Cargar fotos de un establecimiento ---
    const fetchPhotos = async (idLocal) => {
        try {
            const response = await axios.get(`${backendUrl}/foto-local/${idLocal}`);
            setPhotos(response.data);
        } catch (err) {
            console.error('Error al cargar fotos:', err);
            setPhotos([]);
        }
    };

    useEffect(() => {
        fetchEstablecimientos();
    }, []);

    // --- Lógica de Filtrado y Búsqueda ---
    const filteredEstablecimientos = establecimientos.filter(establecimiento => {
        const matchesSearch = searchTerm ?
            establecimiento.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (establecimiento.descripcion && establecimiento.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) :
            true;

        const matchesStatus = filterStatus ?
            String(establecimiento.aceptado) === filterStatus :
            true;

        return matchesSearch && matchesStatus;
    });

    // --- Manejo del Formulario (Crear/Editar) ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateEstablecimiento = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = getToken();
            const userInfo = getUserInfo();
            
            if (!token) {
                setError('No autenticado.');
                return;
            }
            
            if (!formData.direccion || !formData.ubicacion) {
                setError('Los campos "Dirección" y "Ubicación" son requeridos.');
                return;
            }

            // Preparar datos con información del usuario
            const createData = {
                ...formData,
                id_owner: userInfo?.nro_docu || formData.id_owner,
                usuario_owner: userInfo?.usuario || formData.usuario_owner
            };

            await axios.post(`${backendUrl}/owner/local`, createData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Establecimiento creado exitosamente!');
            closeFormModal();
            fetchEstablecimientos();
        } catch (err) {
            console.error('Error al crear establecimiento:', err);
            setError(err.response?.data?.message || 'Error al crear establecimiento.');
        }
    };

    const handleUpdateEstablecimiento = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = getToken();
            if (!token || !selectedEstablecimiento) {
                setError('No autenticado o establecimiento no seleccionado.');
                return;
            }

            const updatePayload = {
                direccion: formData.direccion,
                descripcion: formData.descripcion,
                ubicacion: formData.ubicacion,
                ubicacion_google_maps: formData.ubicacion_google_maps
            };

            await axios.put(`${backendUrl}/owner/local/${selectedEstablecimiento.id_local}`, updatePayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Establecimiento actualizado exitosamente!');
            closeFormModal();
            fetchEstablecimientos();
        } catch (err) {
            console.error('Error al actualizar establecimiento:', err);
            setError(err.response?.data?.message || 'Error al actualizar establecimiento.');
        }
    };

    // --- Manejo de fotos ---
    const handleFileSelect = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUploadPhoto = async () => {
        if (!selectedFile || !selectedEstablecimiento) {
            setError('Selecciona una foto primero.');
            return;
        }

        setError('');
        try {
            const token = getToken();
            if (!token) {
                setError('No autenticado.');
                return;
            }

            const formData = new FormData();
            formData.append('foto', selectedFile);

            await axios.post(`${backendUrl}/owner/fotos/${selectedEstablecimiento.id_local}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            alert('Foto subida exitosamente!');
            setSelectedFile(null);
            fetchPhotos(selectedEstablecimiento.id_local);
        } catch (err) {
            console.error('Error al subir foto:', err);
            setError(err.response?.data?.message || 'Error al subir foto.');
        }
    };

    const handleDeletePhoto = async (idFoto) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
            return;
        }

        setError('');
        try {
            const token = getToken();
            if (!token) {
                setError('No autenticado.');
                return;
            }

            await axios.delete(`${backendUrl}/foto-local/${idFoto}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('Foto eliminada exitosamente!');
            fetchPhotos(selectedEstablecimiento.id_local);
        } catch (err) {
            console.error('Error al eliminar foto:', err);
            setError(err.response?.data?.message || 'Error al eliminar foto.');
        }
    };

    // --- Manejo de Modales ---
    const openCreateModal = () => {
        setCurrentForm('create');
        setFormData({
            direccion: '', descripcion: '', ubicacion: '', 
            ubicacion_google_maps: '', id_owner: '', usuario_owner: ''
        });
        setSelectedEstablecimiento(null);
        setError('');
        setIsFormModalOpen(true);
    };

    const openEditModal = (establecimiento) => {
        setCurrentForm('edit');
        setSelectedEstablecimiento(establecimiento);
        setFormData({
            direccion: establecimiento.direccion || '',
            descripcion: establecimiento.descripcion || '',
            ubicacion: establecimiento.ubicacion || '',
            ubicacion_google_maps: establecimiento.ubicacion_google_maps || '',
            id_owner: establecimiento.id_owner || '',
            usuario_owner: establecimiento.usuario_owner || ''
        });
        setError('');
        setIsFormModalOpen(true);
    };

    const openViewModal = (establecimiento) => {
        setSelectedEstablecimiento(establecimiento);
        setIsViewModalOpen(true);
    };

    const openPhotoModal = (establecimiento) => {
        setSelectedEstablecimiento(establecimiento);
        fetchPhotos(establecimiento.id_local);
        setIsPhotoModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setError('');
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setError('');
        setSelectedEstablecimiento(null);
    };

    const closePhotoModal = () => {
        setIsPhotoModalOpen(false);
        setError('');
        setSelectedEstablecimiento(null);
        setPhotos([]);
        setSelectedFile(null);
    };

    if (loading) {
        return (
            <div className="user-management-container">
                <p>Cargando establecimientos...</p>
            </div>
        );
    }

    return (
        <div className="user-management-container role-section">
            <div className="user-management-header">
                <h2>🏢 Gestión de Mis Establecimientos</h2>
                <button className="add-user-button" onClick={openCreateModal}>
                    ➕ Añadir Nuevo Establecimiento
                </button>
            </div>

            <div className="filter-controls">
                <input
                    type="text"
                    placeholder="Buscar por dirección o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="profile-filter-select"
                >
                    <option value="">Todos los Estados</option>
                    <option value="true">Aceptados</option>
                    <option value="false">Pendientes</option>
                </select>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="user-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Dirección</th>
                            <th className="hide-on-mobile">Descripción</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEstablecimientos.length === 0 ? (
                            <tr>
                                <td colSpan={4}>No se encontraron establecimientos.</td>
                            </tr>
                        ) : (
                            filteredEstablecimientos.map((establecimiento) => (
                                <tr key={establecimiento.id_local} onClick={() => openViewModal(establecimiento)} className="table-row-clickable">
                                    <td data-label="Dirección">
                                        <span className="mobile-label">Dirección:</span>
                                        {establecimiento.direccion}
                                    </td>
                                    <td data-label="Descripción" className="hide-on-mobile">
                                        <span className="mobile-label">Descripción:</span>
                                        {establecimiento.descripcion || 'N/A'}
                                    </td>
                                    <td data-label="Estado">
                                        <span className="mobile-label">Estado:</span>
                                        <span className={`status-badge ${establecimiento.aceptado === true ? 'active' : 'inactive'}`}>
                                            {acceptanceStatus[establecimiento.aceptado]}
                                        </span>
                                    </td>
                                    <td data-label="Acciones" onClick={(e) => e.stopPropagation()}>
                                        <span className="mobile-label">Acciones:</span>
                                        <div className="action-buttons-wrapper">
                                            <button className="icon-button view-button" onClick={() => openViewModal(establecimiento)} title="Ver Detalles">
                                                👁️
                                            </button>
                                            <button className="icon-button edit-button" onClick={() => openEditModal(establecimiento)} title="Editar Establecimiento">
                                                ✏️
                                            </button>
                                            <button className="icon-button" onClick={() => openPhotoModal(establecimiento)} title="Gestionar Fotos" style={{background: 'rgba(106, 17, 203, 0.1)', color: '#6a11cb'}}>
                                                📷
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para Crear/Editar Establecimiento */}
            {isFormModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{currentForm === 'create' ? 'Crear Nuevo Establecimiento' : `Editar Establecimiento`}</h3>
                        <form onSubmit={currentForm === 'create' ? handleCreateEstablecimiento : handleUpdateEstablecimiento}>
                            <div className="form-group">
                                <label htmlFor="direccion">Dirección:</label>
                                <input
                                    type="text"
                                    id="direccion"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="descripcion">Descripción:</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        color: 'var(--color-text)',
                                        backgroundColor: 'var(--color-surface-alt)',
                                        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                                        boxSizing: 'border-box',
                                        resize: 'vertical'
                                    }}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="ubicacion">Ubicación:</label>
                                <select
                                    id="ubicacion"
                                    name="ubicacion"
                                    value={formData.ubicacion}
                                    onChange={handleChange}
                                    required
                                >
                                    {ubicaciones.map(ubicacion => (
                                        <option key={ubicacion.value} value={ubicacion.value}>{ubicacion.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="ubicacion_google_maps">Enlace de Google Maps:</label>
                                <input
                                    type="url"
                                    id="ubicacion_google_maps"
                                    name="ubicacion_google_maps"
                                    value={formData.ubicacion_google_maps}
                                    onChange={handleChange}
                                    placeholder="https://maps.google.com/..."
                                    autoComplete="off"
                                />
                            </div>
                            {currentForm === 'create' && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="id_owner">ID Owner (DNI):</label>
                                        <input
                                            type="text"
                                            id="id_owner"
                                            name="id_owner"
                                            value={formData.id_owner}
                                            onChange={handleChange}
                                            placeholder="Se completará automáticamente"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="usuario_owner">Usuario Owner:</label>
                                        <input
                                            type="text"
                                            id="usuario_owner"
                                            name="usuario_owner"
                                            value={formData.usuario_owner}
                                            onChange={handleChange}
                                            placeholder="Se completará automáticamente"
                                            autoComplete="off"
                                        />
                                    </div>
                                </>
                            )}

                            {error && <p className="modal-error-message">{error}</p>}

                            <div className="modal-actions">
                                <button type="submit" className="save-button">
                                    {currentForm === 'create' ? 'Crear Establecimiento' : 'Guardar Cambios'}
                                </button>
                                <button type="button" className="cancel-button" onClick={closeFormModal}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Ver Detalles del Establecimiento */}
            {isViewModalOpen && selectedEstablecimiento && (
                <div className="modal-overlay">
                    <div className="modal-content view-modal">
                        <h3>Detalles del Establecimiento</h3>
                        <div className="user-details-grid">
                            <p><strong>Dirección:</strong> {selectedEstablecimiento.direccion}</p>
                            <p><strong>Descripción:</strong> {selectedEstablecimiento.descripcion || 'N/A'}</p>
                            <p><strong>Ubicación:</strong> {ubicaciones.find(u => u.value === selectedEstablecimiento.ubicacion)?.label || 'N/A'}</p>
                            <p><strong>Google Maps:</strong> 
                                {selectedEstablecimiento.ubicacion_google_maps ? (
                                    <a href={selectedEstablecimiento.ubicacion_google_maps} target="_blank" rel="noopener noreferrer">
                                        Ver en Maps
                                    </a>
                                ) : 'N/A'}
                            </p>
                            <p><strong>Estado:</strong>
                                <span className={`status-badge ${selectedEstablecimiento.aceptado === true ? 'active' : 'inactive'}`}>
                                    {acceptanceStatus[selectedEstablecimiento.aceptado]}
                                </span>
                            </p>
                            <p><strong>ID Owner:</strong> {selectedEstablecimiento.id_owner || 'N/A'}</p>
                            <p><strong>Usuario Owner:</strong> {selectedEstablecimiento.usuario_owner || 'N/A'}</p>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="cancel-button" onClick={closeViewModal}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Gestionar Fotos */}
            {isPhotoModalOpen && selectedEstablecimiento && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '700px'}}>
                        <h3>Fotos del Establecimiento: {selectedEstablecimiento.direccion}</h3>
                        
                        {/* Sección para subir nueva foto */}
                        <div style={{marginBottom: '2rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px'}}>
                            <h4>Subir Nueva Foto</h4>
                            <div className="form-group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    style={{marginBottom: '1rem'}}
                                />
                                <button 
                                    type="button" 
                                    onClick={handleUploadPhoto}
                                    className="save-button"
                                    disabled={!selectedFile}
                                >
                                    Subir Foto
                                </button>
                            </div>
                        </div>

                        {/* Galería de fotos */}
                        <div>
                            <h4>Fotos Actuales ({photos.length})</h4>
                            {photos.length === 0 ? (
                                <p style={{color: 'var(--color-text-secondary)', textAlign: 'center'}}>
                                    No hay fotos para este establecimiento.
                                </p>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '1rem',
                                    marginTop: '1rem'
                                }}>
                                    {photos.map((photo) => (
                                        <div key={photo.id_foto} style={{
                                            position: 'relative',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            overflow: 'hidden'
                                        }}>
                                            <img 
                                                src={photo.url_foto} 
                                                alt="Foto del establecimiento"
                                                style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <button
                                                onClick={() => handleDeletePhoto(photo.id_foto)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '5px',
                                                    right: '5px',
                                                    background: 'rgba(220, 53, 69, 0.9)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '25px',
                                                    height: '25px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                                title="Eliminar foto"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && <p className="modal-error-message">{error}</p>}

                        <div className="modal-actions">
                            <button type="button" className="cancel-button" onClick={closePhotoModal}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionEstablecimientos;