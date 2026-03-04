import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import toast from 'react-hot-toast';
import './AdminPanel.css';

const AdminPanel = ({ onClose }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    // Fetch inicial
    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        setLoading(true);
        // Gracias a la Policy RLS añadida, el admin puede ver todos
        const { data, error } = await supabase
            .from('perfiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Error al cargar usuarios: ' + error.message);
            console.error(error);
        } else {
            setUsuarios(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (user) => {
        if (user.dni === '45736927') {
            toast.error('No puedes eliminar al Super Administrador.');
            return;
        }

        const confirmacion = window.confirm(`¿Estás SEGURO de eliminar al usuario ${user.nombre || user.dni}? Esta acción es irreversible y borrará todo su progreso y cuenta.`);
        if (!confirmacion) return;

        const loadingToast = toast.loading('Eliminando usuario...');
        try {
            // Llamamos a la función RPC segura en Supabase
            const { error } = await supabase.rpc('admin_delete_user', { target_user_id: user.id });

            if (error) throw error;

            toast.success('Usuario eliminado permanentemente.', { id: loadingToast });
            setUsuarios(usuarios.filter(u => u.id !== user.id));
        } catch (error) {
            toast.error('Error al eliminar: ' + error.message, { id: loadingToast });
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();

        if (editingUser.dni === '45736927' && editingUser.dni !== editingUser.originalDni) {
            toast.error("No cambies el DNI maestro.");
            return;
        }

        const loadingToast = toast.loading('Aplicando cambios...');
        try {
            const { error } = await supabase.rpc('admin_update_user', {
                target_user_id: editingUser.id,
                new_dni: editingUser.dni,
                new_nombre: editingUser.nombre || '',
                new_pin: editingUser.nuevoPin || '0000' // Por si queda en blanco, un fallback temporal aunque no debería
            });

            if (error) throw error;

            toast.success('Credenciales actualizadas exitosamente.', { id: loadingToast });
            setEditingUser(null);
            fetchUsuarios(); // Recargar lista para reflejar visualmente
        } catch (error) {
            toast.error('Error al editar: ' + error.message, { id: loadingToast });
            console.error(error);
        }
    };

    const filteredUsers = usuarios.filter(u =>
        (u.nombre && u.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.dni && u.dni.includes(searchTerm))
    );

    return (
        <div className="admin-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-header">
                    <div className="admin-title">
                        <span className="crown-icon">
                            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                                <path d="M5 16L3 5L8.5 10L12 2L15.5 10L21 5L19 16H5M5 19H19V21H5V19Z" />
                            </svg>
                        </span>
                        <h2>Panel de Administración</h2>
                    </div>
                    <button className="admin-close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="admin-body">
                    <div className="admin-controls">
                        <div className="search-bar-container">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar por DNI o Nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="admin-search-input"
                            />
                            <div className="admin-stats-inline">
                                <span>{usuarios.length}</span> usuarios
                            </div>
                        </div>
                    </div>

                    <div className="admin-table-container">
                        {loading ? (
                            <div className="admin-loading">Cargando base de datos...</div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>DNI</th>
                                        <th>Nombre</th>
                                        <th>Fecha Registro</th>
                                        <th className="action-col">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map(user => (
                                            <tr key={user.id} className={user.dni === '45736927' ? 'admin-row' : ''}>
                                                <td className="font-mono">{user.dni}</td>
                                                <td>
                                                    {user.nombre || <span className="text-muted">Sin nombre</span>}{' '}
                                                    {user.dni === '45736927' && (
                                                        <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: '4px', color: '#a78bfa', filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.5))' }}>
                                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                                <path d="M5 16L3 5L8.5 10L12 2L15.5 10L21 5L19 16H5M5 19H19V21H5V19Z" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-muted">{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td className="action-col">
                                                    <button
                                                        className="admin-btn-edit"
                                                        onClick={() => setEditingUser({ ...user, originalDni: user.dni, nuevoPin: '' })}
                                                        title="Editar Credenciales"
                                                    >
                                                        ✏️
                                                    </button>
                                                    {user.dni !== '45736927' && (
                                                        <button
                                                            className="admin-btn-delete"
                                                            onClick={() => handleDelete(user)}
                                                            title="Eliminar Usuario"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="admin-empty">No se encontraron usuarios</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>

            {/* MODAL DE EDICIÓN FLOTANTE (SEPARADO DEL FLOTANTE PRINCIPAL) */}
            {editingUser && (
                <div className="admin-edit-overlay">
                    <div className="admin-edit-modal">
                        <h3>Editar Usuario</h3>
                        <form onSubmit={handleSaveEdit}>
                            <div className="admin-form-group">
                                <label>DNI</label>
                                <input
                                    type="text"
                                    value={editingUser.dni}
                                    onChange={e => setEditingUser({ ...editingUser, dni: e.target.value })}
                                    required
                                    maxLength="8"
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={editingUser.nombre || ''}
                                    onChange={e => setEditingUser({ ...editingUser, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="admin-form-group warning-group">
                                <label>Nuevo Pin de seguridad (obligatorio cambiarlo/reforzarlo en edición)</label>
                                <input
                                    type="text"
                                    placeholder="Mínimo 4 dígitos..."
                                    value={editingUser.nuevoPin}
                                    onChange={e => setEditingUser({ ...editingUser, nuevoPin: e.target.value })}
                                    required
                                    minLength="4"
                                />
                                <small>Al guardar, el usuario deberá usar este nuevo PIN.</small>
                            </div>
                            <div className="admin-edit-actions">
                                <button type="button" className="admin-btn-cancel" onClick={() => setEditingUser(null)}>Cancelar</button>
                                <button type="submit" className="admin-btn-save">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
