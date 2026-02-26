import React from 'react';
import './OptativasList.css';

const OptativasList = ({ title, materias, colorClass, selectedMap = {} }) => {
    return (
        <div className={`optativas-group ${colorClass}`}>
            <h3 className="group-title">{title}</h3>
            <ul className="optativas-list">
                {materias.map((materia, index) => {
                    const status = selectedMap[materia]; // 'aprobada', 'regularizada' o undefined
                    const isAprobada = status === 'aprobada';
                    const isRegularizada = status === 'regularizada';
                    const isSelected = isAprobada || isRegularizada;

                    return (
                        <li key={index} className={`optativa-item ${isSelected ? 'selected' : ''} ${isRegularizada ? 'regularizada' : ''}`}>
                            <div className={`checkbox-placeholder ${isAprobada ? 'checked' : ''} ${isRegularizada ? 'checked-reg' : ''}`}>
                                {isAprobada && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                                {isRegularizada && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                )}
                            </div>
                            <span className="materia-name">{materia}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default OptativasList;
