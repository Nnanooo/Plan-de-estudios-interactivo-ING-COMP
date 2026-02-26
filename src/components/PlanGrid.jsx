import React, { useState, useEffect } from 'react';
import { planData } from '../utils/planData';
import SubjectCell from './SubjectCell';
import './PlanGrid.css';

const PlanGrid = ({ paintMode, opcionales1, opcionales2, electivas1, electivas2 }) => {
    // Ahora guardamos un objeto { id_materia: 'estado' } en lugar de un array
    // Donde 'estado' será 'aprobada' o 'regularizada'
    const [subjectStatuses, setSubjectStatuses] = useState(() => {
        try {
            const saved = localStorage.getItem('planDinamicoStatuses');
            // Migración temporal: Si existe el viejo array "planDinamicoProgress", lo migramos a verde y lo borramos
            const oldSaved = localStorage.getItem('planDinamicoProgress');

            if (saved) {
                return JSON.parse(saved);
            } else if (oldSaved) {
                const parsedOld = JSON.parse(oldSaved);
                const migratedObj = {};
                parsedOld.forEach(id => { migratedObj[id] = 'aprobada'; });
                localStorage.removeItem('planDinamicoProgress');
                return migratedObj;
            }
            return {};
        } catch (error) {
            console.error("Error leyendo de localStorage", error);
            return {};
        }
    });

    const [optativasChoices, setOptativasChoices] = useState(() => {
        try {
            const saved = localStorage.getItem('planDinamicoOptativas');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            return {};
        }
    });

    const [activeModal, setActiveModal] = useState(null); // guardará el ID de la materia optativa clickeada
    const [tempOption, setTempOption] = useState(null); // opcion seleccionada en el form del modal

    // Estado local para materias en curso desde la Agenda
    const [agendaActiveSubjects, setAgendaActiveSubjects] = useState([]);

    useEffect(() => {
        const fetchAgenda = () => {
            try {
                const saved = localStorage.getItem('agendaEntries');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Quedarse con materias únicas y su color asignado
                    const activeSet = new Map();
                    parsed.filter(e => e.type === 'Materia').forEach(e => {
                        if (!activeSet.has(e.name)) {
                            activeSet.set(e.name, { name: e.name, color: e.color });
                        }
                    });
                    setAgendaActiveSubjects(Array.from(activeSet.values()));
                } else {
                    setAgendaActiveSubjects([]);
                }
            } catch (err) { }
        };

        fetchAgenda();
        window.addEventListener('agendaUpdated', fetchAgenda);
        return () => window.removeEventListener('agendaUpdated', fetchAgenda);
    }, []);

    useEffect(() => {
        localStorage.setItem('planDinamicoStatuses', JSON.stringify(subjectStatuses));
        window.dispatchEvent(new Event('planProgressUpdated'));
    }, [subjectStatuses]);

    useEffect(() => {
        localStorage.setItem('planDinamicoOptativas', JSON.stringify(optativasChoices));
        window.dispatchEvent(new Event('planOptativasUpdated'));
    }, [optativasChoices]);

    const handleToggle = (materia) => {
        const id = materia.id;

        // Si es una asignatura optativa o electiva
        if (materia.nombre === 'Asignatura Optativa' || materia.nombre === 'Asignatura Electiva') {
            if (!subjectStatuses[id]) {
                // No tiene estado, abrimos modal para elegir
                setTempOption(null); // reset selected radio
                setActiveModal({ id, isElectiva: materia.nombre === 'Asignatura Electiva' });
                return;
            } else {
                // Ya tiene estado, evaluamos si la despintan o si solo cambian el color
                if (subjectStatuses[id] === paintMode) {
                    // La desmarcan
                    setSubjectStatuses(prev => {
                        const newObj = { ...prev };
                        delete newObj[id];
                        return newObj;
                    });
                    setOptativasChoices(prev => {
                        const newObj = { ...prev };
                        delete newObj[id];
                        return newObj;
                    });
                } else {
                    // Solo cambia de color
                    setSubjectStatuses(prev => ({ ...prev, [id]: paintMode }));
                }
                return;
            }
        }

        // Lógica normal para materias no optativas
        setSubjectStatuses(prev => {
            const currentStatus = prev[id];
            const newObj = { ...prev };

            if (currentStatus === paintMode) {
                delete newObj[id];
            } else {
                newObj[id] = paintMode;
            }

            return newObj;
        });
    };

    const handleModalAccept = () => {
        if (tempOption && activeModal) {
            setOptativasChoices(prev => ({ ...prev, [activeModal.id]: tempOption }));
            setSubjectStatuses(prev => ({ ...prev, [activeModal.id]: paintMode }));
            setActiveModal(null);
        }
    };

    const handleModalCancel = () => {
        setActiveModal(null);
    };

    const isCuatrimestreAprobado = (materiasRow) => {
        // Obtenemos todas las materias que NO son null en esta fila
        const materiasValidas = materiasRow.filter(m => m !== null);
        if (materiasValidas.length === 0) return false;

        // Verificamos si TODAS las materias validas de la fila tienen status 'aprobada'
        return materiasValidas.every(materia => subjectStatuses[materia.id] === 'aprobada');
    };

    return (
        <div className="plan-container">
            <div className="table-wrapper">
                <table className="plan-table">
                    <colgroup>
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '14.6%' }} />
                        <col style={{ width: '14.6%' }} />
                        <col style={{ width: '14.6%' }} />
                        <col style={{ width: '14.6%' }} />
                        <col style={{ width: '14.6%' }} />
                        <col style={{ width: '14.6%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="cuatrimestre-header">Cuatrimestre</th>
                            <th colSpan="6" className="asignaturas-header">Asignaturas/actividades curriculares</th>
                        </tr>
                    </thead>
                    <tbody>
                        {planData.map((row) => {
                            const cuatrimestreCompleto = isCuatrimestreAprobado(row.materias);

                            return (
                                <tr key={`cuatrimestre-${row.cuatrimestre}`}>
                                    <td className={`cuatrimestre-cell ${cuatrimestreCompleto ? 'cuatrimestre-aprobado' : ''}`}>
                                        {cuatrimestreCompleto ? (
                                            <div className="check-container">
                                                <svg className="cuatrimestre-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                        ) : (
                                            row.cuatrimestre
                                        )}
                                    </td>

                                    {row.materias.map((materia, index) => {
                                        let isCursando = null;
                                        if (materia) {
                                            const optName = ((materia.nombre === 'Asignatura Optativa' || materia.nombre === 'Asignatura Electiva') && optativasChoices[materia.id]) ? optativasChoices[materia.id] : materia.nombre;
                                            isCursando = agendaActiveSubjects.find(s => s.name === optName);
                                        }

                                        return materia ? (
                                            <SubjectCell
                                                key={materia.id}
                                                materia={materia}
                                                status={subjectStatuses[materia.id] || null}
                                                customName={optativasChoices[materia.id]}
                                                onToggle={() => handleToggle(materia)}
                                                isCursando={isCursando}
                                            />
                                        ) : (
                                            <td key={`empty-${row.cuatrimestre}-${index}`} className="empty-cell"></td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal de Optativas / Electivas */}
            {activeModal && (() => {
                const modalId = activeModal.id;
                const isElect = activeModal.isElectiva;
                const title = isElect ? 'Electiva' : 'Optativa';
                let listLabel = '';
                let optionsList = [];

                if (isElect) {
                    listLabel = 'Electivas';
                    // Se unen ambas listas de electivas sin discriminar el cuatrimestre seleccionado
                    // Y filtramos las que YA han sido seleccionadas previamente en el plan (guardadas en optativasChoices)
                    const yaElegidas = Object.values(optativasChoices);
                    optionsList = [...electivas1, ...electivas2].filter(opt => !yaElegidas.includes(opt));
                } else {
                    const yaElegidas = Object.values(optativasChoices);
                    if (modalId.startsWith('4')) {
                        listLabel = 'Optativas de Tecnicaturas';
                        optionsList = opcionales1.filter(opt => !yaElegidas.includes(opt));
                    } else if (modalId.startsWith('6')) {
                        listLabel = 'Optativas de Ingenierías';
                        optionsList = opcionales2.filter(opt => !yaElegidas.includes(opt));
                    }
                }

                // Asegurar caso en el que ya agotó todas las opciones
                if (optionsList.length === 0) {
                    return (
                        <div className="modal-overlay" onClick={handleModalCancel}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Sin Opciones Disponibles</h3>
                                    <button className="modal-close" onClick={handleModalCancel}>&times;</button>
                                </div>
                                <div className="modal-body">
                                    <p>Ya has seleccionado todas las materias {listLabel} disponibles para este plan.</p>
                                </div>
                                <div className="modal-footer">
                                    <button className="modal-btn-cancel" onClick={handleModalCancel}>Aceptar</button>
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="modal-overlay" onClick={handleModalCancel}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Seleccionar Materia {title}</h3>
                                <button className="modal-close" onClick={handleModalCancel}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <p>Elige una materia de las {listLabel}:</p>
                                <div className="optativas-radio-list">
                                    {optionsList.map((opt, idx) => (
                                        <label key={idx} className="radio-label">
                                            <input
                                                type="radio"
                                                name="materiaElegida"
                                                value={opt}
                                                checked={tempOption === opt}
                                                onChange={() => setTempOption(opt)}
                                            />
                                            <span className="radio-custom"></span>
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="modal-btn-cancel" onClick={handleModalCancel}>Cancelar</button>
                                <button
                                    className="modal-btn-accept"
                                    onClick={handleModalAccept}
                                    disabled={!tempOption}
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default PlanGrid;
