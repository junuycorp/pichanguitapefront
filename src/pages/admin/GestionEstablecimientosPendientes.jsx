import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../admin/GestionUsuarios.css';

const acceptanceStatus = {
    true: 'Aceptado',
    false: 'Pendiente',
    null: 'Sin revisar'
};

const GestionEstablecimientos = () => {
    const [establecimientos, setEstablecimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEstablecimiento, setSelectedEstablecimiento] = useState(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const getToken = () => localStorage.getItem('authToken');

    useEffect(() => {
        fetchEstablecimientos();
    }, []);

    const fetchEstablecimientos = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await axios.get(`${backendUrl}/admin/local`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEstablecimientos(res.data.filter(est => est.aceptado === false));
        } catch (err) {
            console.error(err);
            setError('No se pudieron recuperar los establecimientos.');
        } finally {
            setLoading(false);
        }
    };

    const openAcceptModal = (establecimiento) => {
        setSelectedEstablecimiento(establecimiento);
        setShowAcceptModal(true);
    };

    const openDeleteModal = (establecimiento) => {
        setSelectedEstablecimiento(establecimiento);
        setShowDeleteModal(true);
    };

    const closeModals = () => {
        setShowAcceptModal(false);
        setShowDeleteModal(false);
        setSelectedEstablecimiento(null);
    };

    const filteredEstablecimientos = establecimientos.filter(est => {
        return searchTerm
            ? est.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (est.descripcion && est.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
            : true;
    });

    const handleAceptarEstablecimiento = async () => {
        if (!selectedEstablecimiento) return;

        try {
            const token = getToken();
            if (!token) {
                setError('No autenticado.');
                return;
            }

            await axios.patch(`${backendUrl}/admin/local/aceptar/${selectedEstablecimiento.id_local}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Establecimiento aceptado correctamente.');
            closeModals();
            fetchEstablecimientos(); // Recarga la lista
        } catch (err) {
            console.error('Error al aceptar establecimiento:', err);
            setError('No se pudo aceptar el establecimiento.');
        }
    };
        return (
        <div className="user-management-container">
            <div className="user-management-header">
                <h2>Establecimientos Pendientes</h2>
            </div>

            <div className="filter-controls">
                <input
                    type="text"
                    placeholder="Buscar por dirección o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div className="user-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Dirección</th>
                                <th>Descripción</th>
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
                                filteredEstablecimientos.map(est => (
                                    <tr key={est.id_local}>
                                        <td>{est.direccion}</td>
                                        <td className="hide-on-mobile">{est.descripcion || 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge ${est.aceptado === true ? 'active' : 'inactive'}`}>
                                                {acceptanceStatus[est.aceptado]}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons-wrapper">
                                                <button className="icon-button edit-button" onClick={() => openAcceptModal(est)} title="Aceptar">
                                                    ✅
                                                </button>
                                                <button className="icon-button delete-button" onClick={() => openDeleteModal(est)} title="Eliminar">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showAcceptModal && selectedEstablecimiento && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Aceptar Establecimiento</h3>
                        <p style={{textAlign: 'center'}}>
                            ¿Estás seguro de aceptar el establecimiento " <br></br> 
                            {selectedEstablecimiento.descripcion}"?</p>
                        <div className="modal-actions">
                            <button className="save-button" onClick={handleAceptarEstablecimiento}>Aceptar</button>
                            <button className="cancel-button" onClick={closeModals}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && selectedEstablecimiento && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Eliminar Establecimiento</h3>
                        <p>¿Estás seguro de eliminar el establecimiento "{selectedEstablecimiento.direccion}"?</p>
                        <div className="modal-actions">
                            <button className="save-button">Eliminar</button>
                            <button className="cancel-button" onClick={closeModals}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionEstablecimientos;