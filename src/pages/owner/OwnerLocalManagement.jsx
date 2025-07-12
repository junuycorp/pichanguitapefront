import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OwnerLocalManagement.css'; // Asegúrate de crear este archivo CSS

const OwnerLocalManagement = () => {
    const [locals, setLocals] = useState([]);
    const [editingLocal, setEditingLocal] = useState(null); // null para añadir, objeto para editar
    const [showForm, setShowForm] = useState(false); // Controla la visibilidad del formulario de añadir/editar
    const [showPhotosModal, setShowPhotosModal] = useState(false); // Controla la visibilidad del modal de fotos
    const [selectedLocalIdForPhotos, setSelectedLocalIdForPhotos] = useState(null); // ID del local para gestionar fotos
    const [localPhotos, setLocalPhotos] = useState([]); // Fotos del local seleccionado
    const [selectedFile, setSelectedFile] = useState(null); // Archivo seleccionado para subir

    const [formData, setFormData] = useState({
        direccion: '',
        descripcion: '',
        ubicacion: '', 
        ubicacion_Maps: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    // Función para obtener la información del dueño desde localStorage
    const getOwnerInfo = () => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.nro_docu && currentUser.usuario) {
                return { id_owner: currentUser.nro_docu, usuario_owner: currentUser.usuario };
            }
        } catch (e) {
            console.error("Error al parsear currentUser desde localStorage", e);
        }
        setError('No se pudo obtener la información del dueño. Por favor, inicie sesión de nuevo.');
        return null;
    };

    // Efecto para cargar los locales al inicio
    useEffect(() => {
        fetchLocals();
    }, []);

    // FETCH (GET) - Cargar la lista de locales del dueño
    const fetchLocals = async () => {
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${backendUrl}/owner/local/mis-locales`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLocals(response.data);
        } catch (err) {
            console.error('Error al cargar locales:', err.response?.data?.message || err.message);
            setError('Error al cargar tus establecimientos.');
        } finally {
            setIsLoading(false);
        }
    };

    // Manejar cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Añadir nuevo local: Mostrar formulario vacío
    const handleAddLocalClick = () => {
        setEditingLocal(null);
        setFormData({
            direccion: '',
            descripcion: '',
            ubicacion: '',
            ubicacion_Maps: ''
        });
        setShowForm(true);
        setError('');
        setMessage('');
    };

    // Editar local: Cargar datos del local en el formulario
    const handleEditLocalClick = (local) => {
        setEditingLocal(local);
        setFormData({
            direccion: local.direccion,
            descripcion: local.descripcion || '', // Asegurarse de que no sea null
            ubicacion: String(local.ubicacion), // Convertir a string para el input type="number"
            ubicacion_Maps: local.ubicacion_Maps || ''
        });
        setShowForm(true);
        setError('');
        setMessage('');
    };

    // CREATE (POST) / UPDATE (PUT) - Enviar formulario de local
    const handleSubmitLocal = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        const ownerInfo = getOwnerInfo();
        if (!ownerInfo) {
            setIsLoading(false);
            return;
        }
        const { id_owner, usuario_owner } = ownerInfo;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('No autenticado. Por favor, inicie sesión.');
                setIsLoading(false);
                return;
            }

            if (editingLocal) {
                // Actualizar Local existente
                await axios.put(`${backendUrl}/owner/local/${editingLocal.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setMessage('Establecimiento actualizado exitosamente.');
            } else {
                // Crear nuevo Local
                const payload = {
                    ...formData,
                    ubicacion: parseInt(formData.ubicacion), // Convertir a entero para el backend
                    id_owner: id_owner,
                    usuario_owner: usuario_owner
                };
                await axios.post(`${backendUrl}/owner/local`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setMessage('Establecimiento registrado exitosamente. Será revisado por un administrador.');
            }
            setShowForm(false);
            fetchLocals(); // Refrescar la lista de locales
        } catch (err) {
            console.error('Error al guardar establecimiento:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Error al guardar el establecimiento.');
        } finally {
            setIsLoading(false);
        }
    };

    // Cancelar formulario de local
    const handleCancelForm = () => {
        setShowForm(false);
        setEditingLocal(null);
        setError('');
        setMessage('');
    };

    // GESTIÓN DE FOTOS

    // Cargar fotos de un local específico
    const fetchLocalPhotos = async (localId) => {
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await axios.get(`${backendUrl}/owner/local/foto/${localId}`);
            setLocalPhotos(response.data);
        } catch (err) {
            console.error('Error al cargar fotos:', err.response?.data?.message || err.message);
            setError('Error al cargar las fotos del establecimiento.');
        } finally {
            setIsLoading(false);
        }
    };

    // Abrir modal de gestión de fotos
    const handleManagePhotosClick = (localId) => {
        setSelectedLocalIdForPhotos(localId);
        setShowPhotosModal(true);
        fetchLocalPhotos(localId); // Cargar fotos al abrir el modal
        setError('');
        setMessage('');
    };

    // Seleccionar archivo para subir
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // SUBIR (POST) - Subir foto a un local
    const handleUploadPhoto = async (e) => {
        e.preventDefault();
        if (!selectedFile || !selectedLocalIdForPhotos) {
            setError('Selecciona una foto para subir.');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        const photoFormData = new FormData();
        photoFormData.append('foto', selectedFile); // 'foto' debe coincidir con el nombre esperado por el backend

        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`${backendUrl}/owner/local/foto/${selectedLocalIdForPhotos}`, photoFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Importante para subir archivos
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage('Foto subida exitosamente.');
            setSelectedFile(null); // Limpiar archivo seleccionado
            // document.getElementById('photo-upload-input').value = ''; // Limpiar el input file
            e.target.reset(); // Resetear el formulario para limpiar el input file
            fetchLocalPhotos(selectedLocalIdForPhotos); // Refrescar fotos
        } catch (err) {
            console.error('Error al subir foto:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Error al subir la foto.');
        } finally {
            setIsLoading(false);
        }
    };

    // ELIMINAR (DELETE) - Eliminar una foto
    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`${backendUrl}/owner/local/foto/${photoId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage('Foto eliminada exitosamente.');
            fetchLocalPhotos(selectedLocalIdForPhotos); // Refrescar fotos
        } catch (err) {
            console.error('Error al eliminar foto:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Error al eliminar la foto.');
        } finally {
            setIsLoading(false);
        }
    };

    // Cerrar modal de fotos
    const handleClosePhotosModal = () => {
        setShowPhotosModal(false);
        setSelectedLocalIdForPhotos(null);
        setLocalPhotos([]);
        setSelectedFile(null);
        setError('');
        setMessage('');
    };

    return (
        <div className="owner-local-management-container">
            <h2 className="section-title">Mis Establecimientos</h2>
            
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}

            {/* Sección de acciones: Añadir nuevo local */}
            {!showForm && !showPhotosModal && (
                <div className="actions-section">
                    <button className="btn-primary" onClick={handleAddLocalClick} disabled={isLoading}>
                        + Añadir Nuevo Establecimiento
                    </button>
                </div>
            )}

            {/* Formulario para añadir/editar local */}
            {showForm && (
                <div className="local-form-section">
                    <h3>{editingLocal ? 'Editar Establecimiento' : 'Añadir Nuevo Establecimiento'}</h3>
                    <form onSubmit={handleSubmitLocal} className="local-form">
                        <div className="form-group">
                            <label htmlFor="direccion">Dirección:</label>
                            <input
                                type="text"
                                id="direccion"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="descripcion">Descripción (opcional):</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="3"
                                disabled={isLoading}
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="ubicacion">Ubicación (ID):</label> 
                            <input
                                type="number" // Cambiado a 'number' para ubicacion (ID)
                                id="ubicacion"
                                name="ubicacion"
                                value={formData.ubicacion}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="ubicacion_Maps">Ubicación Google Maps (URL opcional):</label>
                            <input
                                type="text"
                                id="ubicacion_Maps"
                                name="ubicacion_Maps"
                                value={formData.ubicacion_Maps}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={isLoading}>
                                {isLoading ? 'Guardando...' : 'Guardar Establecimiento'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={handleCancelForm} disabled={isLoading}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de Establecimientos */}
            {!showForm && !showPhotosModal && (
                <div className="locals-list-section">
                    <h3>Tus Establecimientos Registrados</h3>
                    {isLoading && <p>Cargando establecimientos...</p>}
                    {!isLoading && locals.length === 0 && <p>No tienes establecimientos registrados aún. ¡Añade uno!</p>}
                    
                    <div className="locals-grid">
                        {locals.map(local => (
                            <div key={local.id} className="local-card">
                                <h4>{local.direccion}</h4>
                                <p>{local.descripcion}</p>
                                <p><strong>Ubicación:</strong> {local.ubicacion}</p>
                                {local.ubicacion_Maps && <p><a href={local.ubicacion_Maps} target="_blank" rel="noopener noreferrer">Ver en Google Maps</a></p>}
                                <p className={`status-badge ${local.aceptado ? 'status-accepted' : 'status-pending'}`}>
                                    {local.aceptado ? 'Aceptado' : 'Pendiente de Aprobación'}
                                </p>
                                <div className="local-card-actions">
                                    <button className="btn-edit" onClick={() => handleEditLocalClick(local)} disabled={isLoading}>
                                        Editar
                                    </button>
                                    <button className="btn-manage-photos" onClick={() => handleManagePhotosClick(local.id)} disabled={isLoading}>
                                        Gestionar Fotos
                                    </button>                                    
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de Gestión de Fotos */}
            {showPhotosModal && (
                <div className="photos-modal-overlay">
                    <div className="photos-modal-content">
                        <h3>Fotos del Establecimiento (ID: {selectedLocalIdForPhotos})</h3>
                        <button className="close-modal-btn" onClick={handleClosePhotosModal}>&times;</button>

                        <div className="upload-photo-section">
                            <h4>Subir Nueva Foto</h4>
                            <form onSubmit={handleUploadPhoto} className="upload-form">
                                <input
                                    type="file"
                                    id="photo-upload-input"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                    disabled={isLoading}
                                />
                                <button type="submit" className="btn-upload" disabled={isLoading || !selectedFile}>
                                    {isLoading ? 'Subiendo...' : 'Subir Foto'}
                                </button>
                            </form>
                        </div>

                        <div className="current-photos-grid">
                            <h4>Fotos Actuales</h4>
                            {isLoading && <p>Cargando fotos...</p>}
                            {!isLoading && localPhotos.length === 0 && <p>No hay fotos para este establecimiento aún.</p>}
                            {localPhotos.map(photo => (
                                <div key={photo.id} className="photo-item">
                                    <img src={`${backendUrl}/uploads/locals/${photo.nombre_archivo}`} alt="Local" />
                                    <button className="btn-delete-photo" onClick={() => handleDeletePhoto(photo.id)} disabled={isLoading}>
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerLocalManagement;