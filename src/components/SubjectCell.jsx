import React, { useState, useRef } from 'react';
import './SubjectCell.css';

const SubjectCell = ({ materia, status, allStatuses, allSubjectsMap, customName, onToggle, isCursando, isEditMode, showCorrelativasActivo }) => {
    const [isPressed, setIsPressed] = useState(false);
    const pressTimer = useRef(null);

    const handleTouchStart = () => {
        if (!isEditMode && materia && materia.correlativas && materia.correlativas.length > 0) {
            // Iniciar temporizador de long-press (300ms)
            pressTimer.current = setTimeout(() => {
                setIsPressed(true);
            }, 300);
        }
    };

    const handleTouchEnd = () => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
        setIsPressed(false);
    };

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

    if (!isEditMode) {
        statusClass += ' not-editable';
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

    const hasCorrelativas = materia.correlativas && materia.correlativas.length > 0;

    return (
        <td
            className={`subject-cell ${statusClass} ${(showCorrelativasActivo || isPressed) && hasCorrelativas ? 'has-correlativas' : ''}`}
            onClick={() => onToggle(materia.id)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onContextMenu={(e) => {
                // Prevenir menú contextual nativo del celular al mantener presionado en modo no-edición
                if (!isEditMode && hasCorrelativas) e.preventDefault();
            }}
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

            {(showCorrelativasActivo || isPressed) && hasCorrelativas && (
                <>
                    {showCorrelativasActivo && <div className="correlativas-indicator"></div>}
                    <div className={`correlativas-tooltip ${isPressed ? 'force-show' : ''}`}>
                        <div className="tooltip-title">Correlativas Requeridas</div>
                        <ul className="tooltip-list">
                            {materia.correlativas.map((req, idx) => {
                                const reqStatus = allStatuses?.[req.id] || null;
                                const reqName = allSubjectsMap?.[req.id] || `Material ${req.id}`;

                                let estadoCss = 'estado-falta';
                                let icon = (
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                );

                                if (reqStatus === 'aprobada') {
                                    estadoCss = 'estado-aprobada';
                                    icon = (
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    );
                                } else if (reqStatus === 'regularizada') {
                                    estadoCss = 'estado-regularizada';
                                    icon = (
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                    );
                                }

                                return (
                                    <li key={idx} className={`tooltip-item ${estadoCss}`}>
                                        <span className="tooltip-icon">{icon}</span>
                                        <span className="tooltip-text">{reqName}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </>
            )}
        </td>
    );
};

export default SubjectCell;
