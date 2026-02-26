import React from 'react';
import './SubjectCell.css';

// status ahora puede ser null, 'aprobada', 'regularizada'
const SubjectCell = ({ materia, status, customName, onToggle, isCursando }) => {
    if (!materia) {
        return <td className="subject-cell empty-cell"></td>;
    }

    // Clases CSS dinámicas según el estado actual
    let statusClass = '';
    if (status === 'aprobada') {
        statusClass = 'status-aprobada';
    } else if (status === 'regularizada') {
        statusClass = 'status-regularizada';
    }

    if (isCursando) {
        statusClass += ' cursando-activa';
    }

    const getHexColor = (colorId) => {
        const colors = {
            ruby: '#f43f5e', indigo: '#6366f1', emerald: '#10b981',
            amber: '#f59e0b', violet: '#8b5cf6', cyan: '#06b6d4',
            blue: '#3b82f6', green: '#22c55e', purple: '#a855f7',
            orange: '#f97316', pink: '#ec4899', teal: '#14b8a6'
        };
        return colors[colorId] || '#38bdf8';
    };

    return (
        <td
            className={`subject-cell ${statusClass}`}
            onClick={() => onToggle(materia.id)}
        >
            <div className={`subject-content ${customName ? 'custom-name' : ''}`}>
                {customName ? customName : materia.nombre}
                {isCursando && (
                    <div className="agenda-subject-icon" style={{ color: getHexColor(isCursando.color) }} title="Cursando en Agenda">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M19 4h-2V2h-2v2H9V2H7v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                        </svg>
                    </div>
                )}
            </div>
        </td>
    );
};

export default SubjectCell;
