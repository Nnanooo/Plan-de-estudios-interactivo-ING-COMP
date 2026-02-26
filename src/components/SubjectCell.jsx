import React from 'react';
import './SubjectCell.css';

// status ahora puede ser null, 'aprobada', 'regularizada'
const SubjectCell = ({ materia, status, customName, onToggle }) => {
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

    return (
        <td
            className={`subject-cell ${statusClass}`}
            onClick={() => onToggle(materia.id)}
        >
            <div className={`subject-content ${customName ? 'custom-name' : ''}`}>
                {customName ? customName : materia.nombre}
            </div>
        </td>
    );
};

export default SubjectCell;
