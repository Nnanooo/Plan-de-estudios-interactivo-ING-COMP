import React, { useState, useEffect, useMemo } from 'react';
import { planData, correlativasOptativas } from '../utils/planData';
import './OptativasList.css';

const OptativasList = ({ title, materias, colorClass, selectedMap = {}, agendaActiveSubjects = [], showCorrelativasActivo = false }) => {
    const [allStatuses, setAllStatuses] = useState(() => {
        try {
            const saved = localStorage.getItem('planDinamicoStatuses');
            return saved ? JSON.parse(saved) : {};
        } catch (e) { return {}; }
    });

    useEffect(() => {
        const updateStatuses = () => {
            const saved = localStorage.getItem('planDinamicoStatuses');
            setAllStatuses(saved ? JSON.parse(saved) : {});
        };
        window.addEventListener('planProgressUpdated', updateStatuses);
        return () => window.removeEventListener('planProgressUpdated', updateStatuses);
    }, []);

    const allSubjectsMap = useMemo(() => {
        const map = {};
        planData.forEach(row => {
            row.materias.forEach(mat => {
                if (mat) {
                    map[mat.id] = mat.nombre;
                }
            });
        });
        return map;
    }, []);

    return (
        <div className={`optativas-group ${colorClass}`}>
            <h3 className="group-title">{title}</h3>
            <ul className="optativas-list">
                {materias.map((materia, index) => {
                    const status = selectedMap[materia]; // 'aprobada', 'regularizada' o undefined
                    const isAprobada = status === 'aprobada';
                    const isRegularizada = status === 'regularizada';
                    const isSelected = isAprobada || isRegularizada;

                    // Chequear si está en agenda
                    const cursandoInfo = agendaActiveSubjects.find(s => s.name === materia);
                    const correlativasList = correlativasOptativas[materia];
                    const hasCorrelativas = correlativasList && correlativasList.length > 0;

                    const getHexColor = (colorId) => {
                        const colors = {
                            ruby: '#f43f5e', indigo: '#6366f1', emerald: '#10b981',
                            amber: '#f59e0b', violet: '#8b5cf6', cyan: '#06b6d4',
                            blue: '#3b82f6', green: '#22c55e', purple: '#a855f7',
                            orange: '#f97316', pink: '#ec4899', teal: '#14b8a6'
                        };
                        return colors[colorId] || '#38bdf8';
                    };

                    let isCursando = false;
                    let agendaColor = null;
                    if (cursandoInfo) {
                        isCursando = true;
                        agendaColor = getHexColor(cursandoInfo.color);
                    }

                    return (
                        <li key={index} className={`optativa-item ${isSelected ? 'selected' : ''} ${isRegularizada ? 'regularizada' : ''} ${isAprobada ? 'aprobada' : ''}`}>
                            <span className={`materia-name ${isCursando ? 'is-cursando' : ''}`}>
                                {materia}
                            </span>
                            {isCursando && (
                                <div className="optativa-icon-cursando" style={{ color: agendaColor }} title="Cursando en Agenda">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                        <path d="M19 4h-2V2h-2v2H9V2H7v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                                    </svg>
                                </div>
                            )}

                            {showCorrelativasActivo && hasCorrelativas && (
                                <div className="optativa-correlativas-wrapper">
                                    <div className="correlativas-info-icon">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                        </svg>
                                    </div>
                                    <div className="correlativas-tooltip optativa-tooltip">
                                        <div className="tooltip-title">Correlativas Requeridas</div>
                                        <ul className="tooltip-list">
                                            {correlativasList.map((req, idx) => {
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
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default OptativasList;
