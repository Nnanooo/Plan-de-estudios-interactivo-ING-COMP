import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { planData, opcionales1, opcionales2, electivas1, electivas2, correlativasOptativas } from '../utils/planData';
import './AgendaView.css';

const PREDEFINED_COLORS = [
    { id: 'ruby', hex: '#f43f5e', label: 'Cereza' },
    { id: 'indigo', hex: '#6366f1', label: 'Índigo' },
    { id: 'emerald', hex: '#10b981', label: 'Esmeralda' },
    { id: 'amber', hex: '#f59e0b', label: 'Ámbar' },
    { id: 'cyan', hex: '#06b6d4', label: 'Cian' }
];

const EXTRA_COLORS = [
    { id: 'violet', hex: '#8b5cf6', label: 'Violeta' },
    { id: 'fuchsia', hex: '#d946ef', label: 'Fucsia' },
    { id: 'sky', hex: '#0ea5e9', label: 'Cielo' },
    { id: 'lime', hex: '#84cc16', label: 'Lima' },
    { id: 'orange', hex: '#f97316', label: 'Naranja' }
];

const AgendaView = ({ onGoBack }) => {
    const [gridMode, setGridMode] = useState(() => localStorage.getItem('agendaGridMode') || '2hs');
    const [isGridDropdownOpen, setIsGridDropdownOpen] = useState(false);
    const gridDropdownRef = useRef(null);

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    const blocks1h = Array.from({ length: 14 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00 - ${String(9 + i).padStart(2, '0')}:00`);
    const blocks2h = [
        '08:00 - 10:00',
        '10:00 - 12:00',
        '12:00 - 14:00',
        '14:00 - 16:00',
        '16:00 - 18:00',
        '18:00 - 20:00',
        '20:00 - 22:00'
    ];

    const timeBlocks = gridMode === '1hs' ? blocks1h : blocks2h;

    const parseTimeBlock = (blockStr) => {
        const [start, end] = blockStr.split(' - ');
        return [parseInt(start.split(':')[0]), parseInt(end.split(':')[0])];
    };

    const getEntrySpan = (blocks, realTimeStr = null) => {
        if (realTimeStr) {
            const match = realTimeStr.match(/(\d{1,2})[^\d]*?-[^\d]*?(\d{1,2})/);
            if (match) {
                return [parseInt(match[1]), parseInt(match[2])];
            }
        }
        if (!blocks || blocks.length === 0) return [0, 0];
        let minStart = 24;
        let maxEnd = 0;
        blocks.forEach(b => {
            const [s, e] = parseTimeBlock(b);
            if (s < minStart) minStart = s;
            if (e > maxEnd) maxEnd = e;
        });
        return [minStart, maxEnd];
    };

    const defaultClassBlocks = [
        { label: '08:00 - 10:00', start: 8, end: 10 },
        { label: '10:00 - 12:00', start: 10, end: 12 },
        { label: '12:00 - 14:00', start: 12, end: 14 },
        { label: '14:00 - 16:00', start: 14, end: 16 },
        { label: '16:00 - 18:00', start: 16, end: 18 },
        { label: '18:00 - 20:00', start: 18, end: 20 },
        { label: '20:00 - 22:00', start: 20, end: 22 }
    ];

    const materiaStartBlocks = [timeBlocks[0], timeBlocks[2], timeBlocks[4]];

    // Estados persistentes
    const [entries, setEntries] = useState(() => {
        const savedMap = localStorage.getItem('agendaEntries');
        return savedMap ? JSON.parse(savedMap) : [];
    });

    useEffect(() => {
        localStorage.setItem('agendaGridMode', gridMode);
    }, [gridMode]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (gridDropdownRef.current && !gridDropdownRef.current.contains(event.target)) {
                setIsGridDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Estados del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState(1); // 1 = Elegir Tipo, 2 = Completar Formulario
    const [isColorPopupOpen, setIsColorPopupOpen] = useState(false); // Para colores extras en creacion

    // Estados de Formulario
    const [formData, setFormData] = useState({
        type: '',        // 'Materia' o 'Curso'
        name: '',        // Nombre ingresado
        day: 'Lunes',    // Día de cursada
        isDouble: false, // isDouble ahora significa "Lapso Personalizado"
        startBlock: 8,
        endBlock: 10,
        hasSecondDay: false,
        day2: 'Martes',
        isDouble2: false,
        startBlock2: 8,
        endBlock2: 10,
        realTime: '',
        realTime2: '',
        color: PREDEFINED_COLORS[0].id
    });

    // Estados de Configuración de Materia
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [selectedEntryData, setSelectedEntryData] = useState(null);
    const [isEditingTime, setIsEditingTime] = useState(false); // Toggle para zona horaria en modal avanzado
    const [isEditingColor, setIsEditingColor] = useState(false);
    const [dayEditingMode, setDayEditingMode] = useState(1); // 1 = Dia Principal, 2 = Dia "Hermano"
    const [siblingEntryData, setSiblingEntryData] = useState(null); // Guarda los datos temp. del hermano para editarlo a la vez

    // Guardar en sistema
    useEffect(() => {
        localStorage.setItem('agendaEntries', JSON.stringify(entries));
        window.dispatchEvent(new Event('agendaUpdated'));
    }, [entries]);

    // Extraer materias de planData (Excluyendo Aprobadas o Regularizadas)
    const savedStatusesJSON = localStorage.getItem('planDinamicoStatuses');
    const savedStatuses = savedStatusesJSON ? JSON.parse(savedStatusesJSON) : {};

    let materiasBase = planData.flatMap(cuatri => cuatri.materias)
        .filter(m => m !== null && m.nombre !== 'Asignatura Optativa' && m.nombre !== 'Asignatura Electiva')
        .filter(m => !savedStatuses[m.id]) // Filtrar las que ya tienen estado (no se pueden volver a cursar si se aprobaron/regularizaron)
        .filter(m => {
            // Validar correlatividades
            if (!m.correlativas || m.correlativas.length === 0) return true;

            return m.correlativas.every(corr => {
                const status = savedStatuses[corr.id];
                // Si la condicion es regularizada, basta con que esté regular o aprobada.
                if (corr.condicion === 'regularizada') {
                    return status === 'regularizada' || status === 'aprobada';
                }
                // Si requiere aprobada, sólo pasa si está aprobada.
                if (corr.condicion === 'aprobada') {
                    return status === 'aprobada';
                }
                return false;
            });
        })
        .map(m => m.nombre);

    const todasLasOptativasElectivas = [...opcionales1, ...opcionales2, ...electivas1, ...electivas2];

    // Filtrar optativas y electivas por sus correlativas
    const optativasElectivasFiltradas = todasLasOptativasElectivas.filter(optNombre => {
        const correlativas = correlativasOptativas[optNombre];
        if (!correlativas || correlativas.length === 0) return true; // Si no tiene reglas, se permite

        return correlativas.every(corr => {
            const status = savedStatuses[corr.id];
            if (corr.condicion === 'regularizada') {
                return status === 'regularizada' || status === 'aprobada';
            }
            if (corr.condicion === 'aprobada') {
                return status === 'aprobada';
            }
            return false;
        });
    });

    materiasBase = [...materiasBase, ...optativasElectivasFiltradas];

    const materiasDeduplicadas = Array.from(new Set(materiasBase));

    // Filtrar las que ya estan cursando en Agenda
    const materiasEnAgenda = entries.filter(e => e.type === 'Materia').map(e => e.name);

    const todasLasMaterias = materiasDeduplicadas
        .filter(nombre => !materiasEnAgenda.includes(nombre))
        .sort((a, b) => a.localeCompare(b));

    // Cargar si las tuvieramos en localStorage options extra (Excluyendo tmb aprobadas y agenda)
    const savedOptativasJSON = localStorage.getItem('planDinamicoOptativas');
    const savedOptativas = savedOptativasJSON ? JSON.parse(savedOptativasJSON) : {};
    Object.entries(savedOptativas).forEach(([id, optName]) => {
        if (!savedStatuses[id] && !materiasEnAgenda.includes(optName) && !todasLasMaterias.includes(optName)) {
            todasLasMaterias.push(optName);
            todasLasMaterias.sort((a, b) => a.localeCompare(b));
        }
    });

    const handleOpenModal = () => {
        setIsColorPopupOpen(false); // Reseteo de popup
        setModalStep(1);
        setFormData({
            type: '',
            name: '',
            day: 'Lunes',
            isDouble: false,
            startBlock: 8,
            endBlock: 10,
            hasSecondDay: false,
            day2: 'Martes',
            isDouble2: false,
            startBlock2: 8,
            endBlock2: 10,
            realTime: '',
            realTime2: '',
            color: PREDEFINED_COLORS[0].id
        });
        setIsModalOpen(true);
    };

    const handleTypeSelect = (type) => {
        setFormData(prev => ({
            ...prev,
            type,
            name: type === 'Materia' ? todasLasMaterias[0] : ''
        }));
        setModalStep(2);
    };

    const handleSaveEntry = (e) => {
        e.preventDefault();

        // Validación básica
        if (!formData.name.trim()) return alert("Debe ingresar un nombre");

        // Helper generador de granularidad 1hs
        const generate1hBlocks = (startH, endH) => {
            const blocks = [];
            for (let i = startH; i < endH; i++) {
                blocks.push(`${String(i).padStart(2, '0')}:00 - ${String(i + 1).padStart(2, '0')}:00`);
            }
            return blocks;
        };

        const blocksOccupied = generate1hBlocks(formData.startBlock, formData.endBlock);

        // --- Verificación de Colisiones Día 1 ---
        const hasCollision1 = entries.some(entry => {
            if (entry.day === formData.day) {
                const [entryStart, entryEnd] = getEntrySpan(entry.blocks, entry.realTime);
                return Math.max(formData.startBlock, entryStart) < Math.min(formData.endBlock, entryEnd);
            }
            return false;
        });

        if (hasCollision1) {
            toast.error(`Ya hay una materia que colisiona en el rango del día ${formData.day}`);
            return; // Bloquear guardado
        }

        // --- Manejo del Segundo Día (Día 2) ---
        let blocksOccupied2 = [];
        if (formData.hasSecondDay) {
            if (formData.day === formData.day2) return alert("El segundo día debe ser diferente al primero");

            blocksOccupied2 = generate1hBlocks(formData.startBlock2, formData.endBlock2);

            // --- Verificación de Colisiones Día 2 ---
            const hasCollision2 = entries.some(entry => {
                if (entry.day === formData.day2) {
                    const [entryStart, entryEnd] = getEntrySpan(entry.blocks, entry.realTime);
                    return Math.max(formData.startBlock2, entryStart) < Math.min(formData.endBlock2, entryEnd);
                }
                return false;
            });

            if (hasCollision2) {
                toast.error(`Ya hay una actividad que colisiona en el rango del día ${formData.day2}`);
                return;
            }
        }

        const baseGroupId = Date.now().toString();

        const entryDay1 = {
            id: baseGroupId + '-1',
            type: formData.type,
            name: formData.name.trim(),
            day: formData.day,
            blocks: blocksOccupied,
            realTime: formData.type === 'Curso' ? formData.realTime.trim() : '',
            color: formData.color
        };

        let newEntries = [entryDay1];

        if (formData.hasSecondDay) {
            const entryDay2 = {
                id: baseGroupId + '-2',
                type: formData.type,
                name: formData.name.trim(),
                day: formData.day2,
                blocks: blocksOccupied2,
                realTime: formData.type === 'Curso' ? formData.realTime2.trim() : '',
                color: formData.color
            };
            newEntries.push(entryDay2);
        }

        setEntries(prev => [...prev, ...newEntries]);
        setIsModalOpen(false);
        toast.success("Se ha creado correctamente");
    };

    const isCellOccupied = (day, block) => {
        const [bStart, bEnd] = parseTimeBlock(block);
        return entries.find(entry => {
            if (entry.day !== day) return false;
            const [eStart, eEnd] = getEntrySpan(entry.blocks, entry.realTime);
            return Math.max(bStart, eStart) < Math.min(bEnd, eEnd);
        });
    };

    const handleOpenConfig = (entry) => {
        setIsEditingTime(false); // Reiniciar estado
        setIsEditingColor(false);
        setIsColorPopupOpen(false); // Reiniciar popup de colores
        setDayEditingMode(1); // Reinicia selector a dia 1

        const configBase = {
            ...entry,
            modality: entry.modality || 'Presencial',
            room: entry.room || '',
            ppDate: entry.ppDate || '',
            spDate: entry.spDate || '',
            tpDate: entry.tpDate || '',
            comments: entry.comments || '',
            displayPreference: entry.displayPreference || 'none'
        };

        setSelectedEntryData(configBase);

        // Buscar si existe un hermano (Día 2 o Día 1 respectivamente) y precargarlo
        const sibling = entries.find(e => e.name === entry.name && e.id !== entry.id);
        if (sibling) {
            setSiblingEntryData({ ...sibling });
        } else {
            setSiblingEntryData(null);
        }

        setIsConfigModalOpen(true);
    };

    const handleSaveConfig = (e) => {
        e.preventDefault();

        // Validación de largo del aula
        if (selectedEntryData.room && selectedEntryData.room.length > 3) {
            toast.error("El número de Aula no puede exceder los 3 caracteres.");
            return;
        }

        // Validación global de fechas de parciales
        const isValidDate = (dateStr) => {
            if (!dateStr) return true;
            const dateObj = new Date(dateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalizar al inicio del día actual
            // Debe ser desde hoy hacia adelante, y límite máximo año 2030 (inclusive)
            return dateObj >= today && dateObj.getFullYear() <= 2030;
        };

        if (!isValidDate(selectedEntryData.ppDate) || !isValidDate(selectedEntryData.spDate) || !isValidDate(selectedEntryData.tpDate)) {
            toast.error("Fecha inválida: Debe ser posterior a hoy y sin superar el año 2030.");
            return;
        }

        // Arrays para guardar datos procesados
        let blocksToUpdate1 = selectedEntryData.blocks;
        let blocksToUpdate2 = siblingEntryData ? siblingEntryData.blocks : [];

        // --- CALCULO Y VERIFICACIÓN DE COLISIONES SÓLO SI SE EDITÓ HORARIO ---
        if (isEditingTime) {
            // Helper generador de granularidad 1hs (reused local)
            const generate1hBlocksLocal = (startH, endH) => {
                const blocks = [];
                for (let i = startH; i < endH; i++) {
                    blocks.push(`${String(i).padStart(2, '0')}:00 - ${String(i + 1).padStart(2, '0')}:00`);
                }
                return blocks;
            };

            // DIA 1 (Selected)
            blocksToUpdate1 = generate1hBlocksLocal(selectedEntryData.startBlock, selectedEntryData.endBlock);

            const col1 = entries.some(entry => {
                if (entry.id !== selectedEntryData.id && entry.id !== (siblingEntryData?.id) && entry.day === selectedEntryData.day) {
                    const [entryStart, entryEnd] = getEntrySpan(entry.blocks, entry.realTime);
                    return Math.max(selectedEntryData.startBlock, entryStart) < Math.min(selectedEntryData.endBlock, entryEnd);
                }
                return false;
            });
            if (col1) return toast.error(`Colisión de horario detectada en el día ${selectedEntryData.day}`);

            // DIA 2 (Sibling)
            if (siblingEntryData) {
                blocksToUpdate2 = generate1hBlocksLocal(siblingEntryData.startBlock, siblingEntryData.endBlock);

                const col2 = entries.some(entry => {
                    if (entry.id !== siblingEntryData.id && entry.id !== selectedEntryData.id && entry.day === siblingEntryData.day) {
                        const [entryStart, entryEnd] = getEntrySpan(entry.blocks, entry.realTime);
                        return Math.max(siblingEntryData.startBlock, entryStart) < Math.min(siblingEntryData.endBlock, entryEnd);
                    }
                    return false;
                });
                if (col2) return toast.error(`Colisión de horario detectada en el día ${siblingEntryData.day}`);
            }

            if (siblingEntryData && selectedEntryData.day === siblingEntryData.day) {
                return toast.error("El Día 1 y el Día 2 no pueden ser el mismo día.");
            }
        }

        // --- ACTUALIZACION EN MASA ---
        setEntries(prev => prev.map(entry => {
            if (entry.id === selectedEntryData.id) {
                return { ...selectedEntryData, name: selectedEntryData.name.trim(), blocks: blocksToUpdate1 };
            } else if (siblingEntryData && entry.id === siblingEntryData.id) {
                // Actualiza hermano con datos cruzados de metadatos del selected + sus propios horaros guardados en setState de hermano
                return {
                    ...siblingEntryData,
                    name: selectedEntryData.name.trim(),
                    modality: selectedEntryData.modality,
                    room: selectedEntryData.room,
                    ppDate: selectedEntryData.ppDate,
                    spDate: selectedEntryData.spDate,
                    tpDate: selectedEntryData.tpDate,
                    comments: selectedEntryData.comments,
                    displayPreference: selectedEntryData.displayPreference,
                    color: selectedEntryData.color,
                    blocks: blocksToUpdate2
                };
            } else if (entry.name === selectedEntryData.name) {
                // Malla de seguridad por si hay algún clon triple
                return {
                    ...entry,
                    modality: selectedEntryData.modality,
                    room: selectedEntryData.room,
                    ppDate: selectedEntryData.ppDate,
                    spDate: selectedEntryData.spDate,
                    tpDate: selectedEntryData.tpDate,
                    comments: selectedEntryData.comments,
                    displayPreference: selectedEntryData.displayPreference,
                    color: selectedEntryData.color
                };
            }
            return entry;
        }));
        setIsConfigModalOpen(false);
        toast.success("Horario modificado correctamente");
    };

    // Helper para formatear fecha (YYYY-MM-DD a DD/MM)
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        return `${parts[2]}/${parts[1]}`;
    };

    return (
        <div className="agenda-container">
            {/* Header Unificado */}
            <div className="agenda-header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 1.5rem 0', position: 'relative' }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                    <button onClick={onGoBack} className="btn-go-back" title="Volver al Plan de Estudios" style={{ position: 'relative', top: 0, transform: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Volver
                    </button>
                </div>

                <div style={{ flex: 2, textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Mi Agenda Semanal</h2>
                    <p style={{ color: '#64748b', margin: 0 }}>Organiza tus horarios de cursada y estudio</p>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '8px', position: 'relative' }}>

                    <div ref={gridDropdownRef} className="grid-dropdown-container">
                        <button
                            className="grid-dropdown-btn"
                            onClick={() => setIsGridDropdownOpen(!isGridDropdownOpen)}
                        >
                            <span>Lapsos {gridMode === '2hs' ? '2hs' : '1hs'}</span>
                            <svg className={`chevron ${isGridDropdownOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        {isGridDropdownOpen && (
                            <div className="grid-dropdown-menu animate-fade-in-down">
                                <div
                                    className={`grid-dropdown-item ${gridMode === '2hs' ? 'active' : ''}`}
                                    onClick={() => { setGridMode('2hs'); setIsGridDropdownOpen(false); }}
                                >
                                    Lapsos 2hs
                                </div>
                                <div
                                    className={`grid-dropdown-item ${gridMode === '1hs' ? 'active' : ''}`}
                                    onClick={() => { setGridMode('1hs'); setIsGridDropdownOpen(false); }}
                                >
                                    Lapsos 1hs
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="add-agenda-btn" onClick={handleOpenModal}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Agregar...
                    </button>
                </div>
            </div>

            <div className="agenda-wrapper">
                <table className="agenda-table">
                    <thead>
                        <tr>
                            <th className="time-header">Horario</th>
                            {days.map(day => (
                                <th key={day} className="day-header">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeBlocks.map((block, index) => (
                            <tr key={index}>
                                <td className="time-cell">{block}</td>
                                {days.map(day => {
                                    const entry = isCellOccupied(day, block);

                                    let isFirstBlock = false;
                                    let customStyle = {};

                                    if (entry) {
                                        const [eStart, eEnd] = getEntrySpan(entry.blocks, entry.realTime);
                                        const [bStart, bEnd] = parseTimeBlock(block);

                                        isFirstBlock = bStart <= eStart && eStart < bEnd;
                                    }

                                    return (
                                        <td key={`${day}-${index}`} className="agenda-cell">
                                            <div
                                                className={`cell-content ${entry ? ('theme-' + (['blue', 'green', 'purple', 'orange', 'pink', 'teal'].includes(entry.color) ? { blue: 'indigo', green: 'emerald', purple: 'violet', orange: 'amber', pink: 'ruby', teal: 'cyan' }[entry.color] : entry.color)) : ''} ${entry && !isFirstBlock ? 'continued-block' : ''}`}
                                                style={{ ...customStyle }}
                                            >
                                                {entry ? (
                                                    <div className="entry-card clickable" onClick={() => handleOpenConfig(entry)}>
                                                        {isFirstBlock && <span className="entry-type">{entry.type}</span>}
                                                        <span className="entry-name" style={{ marginTop: isFirstBlock ? '0' : 'auto', opacity: isFirstBlock ? 1 : 0.9 }}>
                                                            {entry.name}
                                                        </span>
                                                        {isFirstBlock && (entry.realTime || (entry.displayPreference && entry.displayPreference !== 'none')) && (
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginTop: 'auto' }}>
                                                                {entry.realTime && (
                                                                    <span className="entry-info-tag" style={{ margin: 0, color: '#fff', backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.7rem' }}>
                                                                        {entry.realTime}
                                                                    </span>
                                                                )}
                                                                {entry.displayPreference && entry.displayPreference !== 'none' && (
                                                                    <span className="entry-info-tag" style={{ margin: 0, fontSize: '0.7rem' }}>
                                                                        {entry.displayPreference === 'aula' && `Aula: ${entry.room || '-'}`}
                                                                        {entry.displayPreference === 'pp' && `PP: ${formatDate(entry.ppDate)}`}
                                                                        {entry.displayPreference === 'sp' && `SP: ${formatDate(entry.spDate)}`}
                                                                        {entry.displayPreference === 'tp' && `TP: ${formatDate(entry.tpDate)}`}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="empty-placeholder"></span>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* LEYENDA MOBILE (Y general) */}
            <div className="agenda-mobile-legend">
                <h3 className="legend-title">Detalle de Materias</h3>
                <div className="legend-grid">
                    {entries.length === 0 ? (
                        <div className="legend-empty">No hay actividades en la agenda.</div>
                    ) : (
                        Object.values(entries.reduce((acc, entry) => {
                            if (!acc[entry.name]) {
                                acc[entry.name] = { ...entry, allBlocks: [{ day: entry.day, blocks: entry.blocks }] };
                            } else {
                                acc[entry.name].allBlocks.push({ day: entry.day, blocks: entry.blocks });
                            }
                            return acc;
                        }, {})).map(entry => {
                            const baseColor = ['blue', 'green', 'purple', 'orange', 'pink', 'teal'].includes(entry.color) ?
                                { blue: 'indigo', green: 'emerald', purple: 'violet', orange: 'amber', pink: 'ruby', teal: 'cyan' }[entry.color] : entry.color;

                            const colorClass = 'theme-' + baseColor;

                            return (
                                <div key={entry.id} className="legend-item" onClick={() => handleOpenConfig(entry)}>
                                    <div className={`legend-color-box ${colorClass}`}></div>
                                    <div className="legend-info">
                                        <div className="legend-name">{entry.name}</div>
                                        <div className="legend-details">
                                            {entry.allBlocks.map((b, i) => {
                                                const start = b.blocks[0] ? b.blocks[0].split(' - ')[0] : '';
                                                const end = b.blocks[b.blocks.length - 1] ? b.blocks[b.blocks.length - 1].split(' - ')[1] : '';
                                                return (
                                                    <span key={i} className="legend-time">
                                                        {b.day}, {entry.realTime ? entry.realTime + ' (Real)' : `${start} - ${end}`}{i < entry.allBlocks.length - 1 ? ' | ' : ''}
                                                    </span>
                                                );
                                            })}
                                            {entry.displayPreference && entry.displayPreference !== 'none' && (
                                                <span className="legend-annotation">
                                                    {' • '}
                                                    {entry.displayPreference === 'aula' && `Aula: ${entry.room || '-'}`}
                                                    {entry.displayPreference === 'pp' && `PP: ${formatDate(entry.ppDate)}`}
                                                    {entry.displayPreference === 'sp' && `SP: ${formatDate(entry.spDate)}`}
                                                    {entry.displayPreference === 'tp' && `TP: ${formatDate(entry.tpDate)}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* MODAL MULTISTEP */}
            {
                isModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="modal-content agenda-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{modalStep === 1 ? '¿Qué deseas agregar?' : 'Agregar ' + formData.type}</h3>
                                <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
                            </div>

                            {modalStep === 1 ? (
                                <div className="modal-body step-1">
                                    <p>Selecciona el tipo de actividad para tu agenda:</p>
                                    <div className="type-buttons">
                                        <button className="type-btn" onClick={() => handleTypeSelect('Materia')}>
                                            <div className="type-icon book-icon">📚</div>
                                            <span className="type-label">Materia</span>
                                        </button>
                                        <button className="type-btn" onClick={() => handleTypeSelect('Curso')}>
                                            <div className="type-icon course-icon">💻</div>
                                            <span className="type-label">Curso Extra</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="modal-body step-2">
                                    <form onSubmit={handleSaveEntry}>
                                        <div className="form-group">
                                            <label>Nombre {formData.type === 'Materia' ? 'de la materia' : 'del curso'}</label>
                                            {formData.type === 'Materia' ? (
                                                <select
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                >
                                                    {todasLasMaterias.map(mat => <option key={mat} value={mat}>{mat}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    placeholder="Ej: Curso de React"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            )}
                                        </div>

                                        <div className="form-group checkbox-group" style={{ marginTop: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem' }}>
                                            <label className="checkbox-label" style={{ fontWeight: 'bold' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.hasSecondDay}
                                                    onChange={e => setFormData({ ...formData, hasSecondDay: e.target.checked })}
                                                />
                                                Doble carga horaria
                                            </label>
                                        </div>

                                        <div className="days-flex-container" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                            {/* --- COLUMNA DÍA 1 --- */}
                                            <div className="day-column" style={{ flex: '1', minWidth: '200px' }}>
                                                {formData.hasSecondDay && <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>Día 1</h4>}
                                                <div className="form-row">
                                                    <div className="form-group half" style={{ width: formData.hasSecondDay ? '100%' : '' }}>
                                                        <label>Día de cursada</label>
                                                        <select
                                                            value={formData.day}
                                                            onChange={e => setFormData({ ...formData, day: e.target.value })}
                                                        >
                                                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                                                        </select>
                                                    </div>
                                                    {!formData.hasSecondDay && (
                                                        <div className="form-group half checkbox-group">
                                                            <label className="checkbox-label">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.isDouble}
                                                                    onChange={e => setFormData({ ...formData, isDouble: e.target.checked })}
                                                                />
                                                                Lapso personalizado
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>

                                                {formData.hasSecondDay && (
                                                    <div className="form-group checkbox-group" style={{ marginBottom: '1rem' }}>
                                                        <label className="checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.isDouble}
                                                                onChange={e => setFormData({ ...formData, isDouble: e.target.checked })}
                                                            />
                                                            Lapso personalizado
                                                        </label>
                                                    </div>
                                                )}

                                                <div className="form-row">
                                                    <div className="form-group half" style={{ width: formData.hasSecondDay ? '100%' : '' }}>
                                                        <label>Horario {formData.isDouble ? 'Inicio' : ''}</label>
                                                        {formData.isDouble ? (
                                                            <select
                                                                value={formData.startBlock}
                                                                onChange={e => setFormData({ ...formData, startBlock: parseInt(e.target.value) })}
                                                            >
                                                                {Array.from({ length: 14 }, (_, i) => 8 + i).map(h => (
                                                                    <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <select
                                                                value={`${formData.startBlock}-${formData.endBlock}`}
                                                                onChange={e => {
                                                                    const [s, eVal] = e.target.value.split('-');
                                                                    setFormData({ ...formData, startBlock: parseInt(s), endBlock: parseInt(eVal) });
                                                                }}
                                                            >
                                                                {defaultClassBlocks.map(b => (
                                                                    <option key={b.label} value={`${b.start}-${b.end}`}>{b.label}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                    {formData.isDouble && (
                                                        <div className="form-group half" style={{ width: formData.hasSecondDay ? '100%' : '' }}>
                                                            <label>Horario Fin</label>
                                                            <select
                                                                value={formData.endBlock}
                                                                onChange={e => setFormData({ ...formData, endBlock: parseInt(e.target.value) })}
                                                            >
                                                                {Array.from({ length: 14 }, (_, i) => 9 + i).filter(h => h > formData.startBlock).map(h => (
                                                                    <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                                {formData.type === 'Curso' && (
                                                    <div className="form-row">
                                                        <div className="form-group" style={{ width: '100%' }}>
                                                            <label>Horario Real (Opcional)</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Ej: 19:00 - 21:00 hs"
                                                                value={formData.realTime}
                                                                onChange={e => setFormData({ ...formData, realTime: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* --- COLUMNA DÍA 2 --- */}
                                            {formData.hasSecondDay && (
                                                <div className="day-column" style={{ flex: '1', minWidth: '200px', borderLeft: '1px dashed #e2e8f0', paddingLeft: '1.5rem' }}>
                                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>Día 2</h4>
                                                    <div className="form-row">
                                                        <div className="form-group" style={{ width: '100%' }}>
                                                            <label>Día de cursada</label>
                                                            <select
                                                                value={formData.day2}
                                                                onChange={e => setFormData({ ...formData, day2: e.target.value })}
                                                            >
                                                                {days.filter(d => d !== formData.day).map(d => <option key={d} value={d}>{d}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="form-group checkbox-group" style={{ marginBottom: '1rem' }}>
                                                        <label className="checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.isDouble2}
                                                                onChange={e => setFormData({ ...formData, isDouble2: e.target.checked })}
                                                            />
                                                            Lapso personalizado
                                                        </label>
                                                    </div>

                                                    <div className="form-row">
                                                        <div className="form-group" style={{ width: '100%' }}>
                                                            <label>Horario {formData.isDouble2 ? 'Inicio' : ''}</label>
                                                            {formData.isDouble2 ? (
                                                                <select
                                                                    value={formData.startBlock2}
                                                                    onChange={e => setFormData({ ...formData, startBlock2: parseInt(e.target.value) })}
                                                                >
                                                                    {Array.from({ length: 14 }, (_, i) => 8 + i).map(h => (
                                                                        <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <select
                                                                    value={`${formData.startBlock2}-${formData.endBlock2}`}
                                                                    onChange={e => {
                                                                        const [s, eVal] = e.target.value.split('-');
                                                                        setFormData({ ...formData, startBlock2: parseInt(s), endBlock2: parseInt(eVal) });
                                                                    }}
                                                                >
                                                                    {defaultClassBlocks.map(b => (
                                                                        <option key={b.label} value={`${b.start}-${b.end}`}>{b.label}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                        {formData.isDouble2 && (
                                                            <div className="form-group" style={{ width: '100%' }}>
                                                                <label>Horario Fin</label>
                                                                <select
                                                                    value={formData.endBlock2}
                                                                    onChange={e => setFormData({ ...formData, endBlock2: parseInt(e.target.value) })}
                                                                >
                                                                    {Array.from({ length: 14 }, (_, i) => 9 + i).filter(h => h > formData.startBlock2).map(h => (
                                                                        <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {formData.type === 'Curso' && (
                                                        <div className="form-row">
                                                            <div className="form-group" style={{ width: '100%' }}>
                                                                <label>Horario Real del Día 2 (Opcional)</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Ej: 19:00 - 21:00 hs"
                                                                    value={formData.realTime2}
                                                                    onChange={e => setFormData({ ...formData, realTime2: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group color-picker-group" style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                            <label>Color en la Agenda</label>
                                            <div className="colors-container colors-wrapper">
                                                {PREDEFINED_COLORS.map(color => (
                                                    <button
                                                        key={color.id}
                                                        type="button"
                                                        className={`color-swatch flex-center ${formData.color === color.id ? 'selected' : ''}`}
                                                        style={{ backgroundColor: color.hex }}
                                                        onClick={() => { setFormData({ ...formData, color: color.id }); setIsColorPopupOpen(false); }}
                                                        title={color.label}
                                                    >
                                                        {formData.color === color.id && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                    </button>
                                                ))}

                                                {/* Botón de Extra Colores (Creación) */}
                                                <button
                                                    type="button"
                                                    className={`color-swatch color-swatch-more flex-center ${EXTRA_COLORS.some(c => c.id === formData.color) ? 'selected' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); setIsColorPopupOpen(!isColorPopupOpen); }}
                                                    title="Más Colores"
                                                >
                                                    {EXTRA_COLORS.some(c => c.id === formData.color)
                                                        ? <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="18" height="18"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        : "+"}
                                                </button>

                                                {/* Menú Flotante de Extra Colores (Creación) */}
                                                {isColorPopupOpen && (
                                                    <div className="extra-colors-popup" onClick={e => e.stopPropagation()}>
                                                        {EXTRA_COLORS.map(color => (
                                                            <button
                                                                key={color.id}
                                                                type="button"
                                                                className={`color-swatch flex-center ${formData.color === color.id ? 'selected' : ''}`}
                                                                style={{ backgroundColor: color.hex }}
                                                                onClick={() => { setFormData({ ...formData, color: color.id }); setIsColorPopupOpen(false); }}
                                                                title={color.label}
                                                            >
                                                                {formData.color === color.id && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="18" height="18"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="modal-actions-footer">
                                            <button type="button" className="btn-secondary" onClick={() => setModalStep(1)}>Atrás</button>
                                            <button type="submit" className="btn-primary">Guardar en Agenda</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* MODAL CONFIGURACION DE MATERIA */}
            {
                isConfigModalOpen && selectedEntryData && (
                    <div className="modal-overlay" onClick={() => setIsConfigModalOpen(false)}>
                        <div className="modal-content agenda-modal config-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Configuración</h3>
                                <button className="modal-close" onClick={() => setIsConfigModalOpen(false)}>&times;</button>
                            </div>
                            <div className="modal-body step-2">
                                <form onSubmit={handleSaveConfig} className="config-form-layout">
                                    <div className="config-main-pane">
                                        <div className="form-group" style={{ marginBottom: '1rem', position: 'relative' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                {selectedEntryData.type === 'Materia' ? (
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center', padding: '0.5rem', color: 'var(--text-color)' }}>
                                                        {selectedEntryData.name}
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={selectedEntryData.name}
                                                        onChange={e => setSelectedEntryData({ ...selectedEntryData, name: e.target.value })}
                                                        style={{ fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center', backgroundColor: 'transparent', border: 'none', borderBottom: '2px dashed #cbd5e1', padding: '0.5rem', outline: 'none', width: '100%' }}
                                                    />
                                                )}
                                                <button type="button" className="color-edit-btn" onClick={() => setIsEditingColor(!isEditingColor)} title="Cambiar color">
                                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
                                                </button>
                                            </div>

                                            {isEditingColor && (
                                                <div className="inline-color-picker colors-wrapper">
                                                    {PREDEFINED_COLORS.map(color => (
                                                        <button
                                                            key={color.id}
                                                            type="button"
                                                            className={`color-swatch flex-center ${selectedEntryData.color === color.id ? 'selected' : ''}`}
                                                            style={{ backgroundColor: color.hex, width: '24px', height: '24px' }}
                                                            onClick={() => {
                                                                setSelectedEntryData({ ...selectedEntryData, color: color.id });
                                                                setIsEditingColor(false);
                                                                setIsColorPopupOpen(false);
                                                            }}
                                                            title={color.label}
                                                        >
                                                            {selectedEntryData.color === color.id && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                        </button>
                                                    ))}

                                                    {/* Botón de Extra Colores (Config) */}
                                                    <button
                                                        type="button"
                                                        className={`color-swatch color-swatch-more flex-center ${EXTRA_COLORS.some(c => c.id === selectedEntryData.color) ? 'selected' : ''}`}
                                                        style={{ width: '24px', height: '24px', fontSize: '1rem' }}
                                                        onClick={(e) => { e.stopPropagation(); setIsColorPopupOpen(!isColorPopupOpen); }}
                                                        title="Más Colores"
                                                    >
                                                        +
                                                    </button>

                                                    {/* Menú Flotante de Extra Colores (Config) */}
                                                    {isColorPopupOpen && (
                                                        <div className="extra-colors-popup" style={{ top: '35px', left: '0px' }} onClick={e => e.stopPropagation()}>
                                                            {EXTRA_COLORS.map(color => (
                                                                <button
                                                                    key={color.id}
                                                                    type="button"
                                                                    className={`color-swatch flex-center ${selectedEntryData.color === color.id ? 'selected' : ''}`}
                                                                    style={{ backgroundColor: color.hex, width: '24px', height: '24px' }}
                                                                    onClick={() => {
                                                                        setSelectedEntryData({ ...selectedEntryData, color: color.id });
                                                                        setIsColorPopupOpen(false);
                                                                        setIsEditingColor(false);
                                                                    }}
                                                                    title={color.label}
                                                                >
                                                                    {selectedEntryData.color === color.id && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group half">
                                                <label>Modalidad</label>
                                                <select
                                                    value={selectedEntryData.modality}
                                                    onChange={e => setSelectedEntryData({ ...selectedEntryData, modality: e.target.value })}
                                                >
                                                    <option value="Presencial">Presencial</option>
                                                    <option value="Híbrido">Híbrido</option>
                                                    <option value="Virtual">Virtual</option>
                                                </select>
                                            </div>
                                            {(selectedEntryData.modality === 'Presencial' || selectedEntryData.modality === 'Híbrido') && (
                                                <div className="form-group half">
                                                    <label>Aula (Opcional)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej: 412"
                                                        value={selectedEntryData.room}
                                                        onChange={e => setSelectedEntryData({ ...selectedEntryData, room: e.target.value })}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group third">
                                                <label>1er Parcial</label>
                                                <input
                                                    type="date"
                                                    value={selectedEntryData.ppDate}
                                                    onChange={e => setSelectedEntryData({ ...selectedEntryData, ppDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group third">
                                                <label>2do Parcial</label>
                                                <input
                                                    type="date"
                                                    value={selectedEntryData.spDate}
                                                    onChange={e => setSelectedEntryData({ ...selectedEntryData, spDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group third">
                                                <label>Trabajo Pr.</label>
                                                <input
                                                    type="date"
                                                    value={selectedEntryData.tpDate}
                                                    onChange={e => setSelectedEntryData({ ...selectedEntryData, tpDate: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Comentarios breves ({selectedEntryData.comments.length}/50)</label>
                                            <textarea
                                                maxLength="50"
                                                rows="2"
                                                placeholder="Ej: Avisar asistencia al profesor..."
                                                value={selectedEntryData.comments}
                                                onChange={e => setSelectedEntryData({ ...selectedEntryData, comments: e.target.value })}
                                                className="config-textarea"
                                            />
                                        </div>

                                        <div className="form-group display-preference-group">
                                            <label>Mostrar en Grilla (Activar UNO)</label>
                                            <div className="toggle-group">
                                                <label className={`toggle-option ${selectedEntryData.displayPreference === 'none' ? 'active' : ''}`}>
                                                    <input type="radio" name="displayPref" value="none" checked={selectedEntryData.displayPreference === 'none'} onChange={() => setSelectedEntryData({ ...selectedEntryData, displayPreference: 'none' })} />
                                                    Nada
                                                </label>
                                                <label className={`toggle-option ${selectedEntryData.displayPreference === 'aula' ? 'active' : ''}`}>
                                                    <input type="radio" name="displayPref" value="aula" checked={selectedEntryData.displayPreference === 'aula'} onChange={() => setSelectedEntryData({ ...selectedEntryData, displayPreference: 'aula' })} />
                                                    Aula
                                                </label>
                                                <label className={`toggle-option ${selectedEntryData.displayPreference === 'pp' ? 'active' : ''}`}>
                                                    <input type="radio" name="displayPref" value="pp" checked={selectedEntryData.displayPreference === 'pp'} onChange={() => setSelectedEntryData({ ...selectedEntryData, displayPreference: 'pp' })} />
                                                    PP
                                                </label>
                                                <label className={`toggle-option ${selectedEntryData.displayPreference === 'sp' ? 'active' : ''}`}>
                                                    <input type="radio" name="displayPref" value="sp" checked={selectedEntryData.displayPreference === 'sp'} onChange={() => setSelectedEntryData({ ...selectedEntryData, displayPreference: 'sp' })} />
                                                    SP
                                                </label>
                                                <label className={`toggle-option ${selectedEntryData.displayPreference === 'tp' ? 'active' : ''}`}>
                                                    <input type="radio" name="displayPref" value="tp" checked={selectedEntryData.displayPreference === 'tp'} onChange={() => setSelectedEntryData({ ...selectedEntryData, displayPreference: 'tp' })} />
                                                    TP
                                                </label>
                                            </div>
                                        </div>

                                        <div className="modal-actions-footer config-actions" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button type="button" className="btn-delete" onClick={() => {
                                                if (window.confirm('¿Eliminar esta materia de la agenda?')) {
                                                    setEntries(prev => prev.filter(e => e.name !== selectedEntryData.name));
                                                    setIsConfigModalOpen(false);
                                                }
                                            }}>Borrar</button>

                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {!isEditingTime ? (
                                                    <button type="button" className="btn-gray" onClick={() => {
                                                        setIsEditingTime(true);
                                                        // Init states para Dia 1
                                                        setSelectedEntryData(prev => {
                                                            const [s, eVal] = getEntrySpan(prev.blocks, prev.realTime);
                                                            const matchesPredefined = defaultClassBlocks.some(b => b.start === s && b.end === eVal);
                                                            return {
                                                                ...prev,
                                                                isDouble: !matchesPredefined,
                                                                startBlock: s,
                                                                endBlock: eVal
                                                            };
                                                        });
                                                        // Init states para Dia 2 si existe
                                                        if (siblingEntryData) {
                                                            setSiblingEntryData(prev => {
                                                                const [s, eVal] = getEntrySpan(prev.blocks, prev.realTime);
                                                                const matchesPredefined = defaultClassBlocks.some(b => b.start === s && b.end === eVal);
                                                                return {
                                                                    ...prev,
                                                                    isDouble: !matchesPredefined,
                                                                    startBlock: s,
                                                                    endBlock: eVal
                                                                };
                                                            });
                                                        }
                                                    }}>
                                                        Cambiar horario
                                                    </button>
                                                ) : (
                                                    <button type="button" className="btn-gray" onClick={() => setIsEditingTime(false)}>
                                                        Ocultar Horario
                                                    </button>
                                                )}
                                                <button type="submit" className="btn-primary">Guardar</button>
                                            </div>
                                        </div>
                                    </div> {/* Cierra config-main-pane */}

                                    {/* SECCIÓN EDITAR HORARIO (SIDE PANEL) */}
                                    {isEditingTime && (
                                        <div className="config-side-pane">
                                            <div className="edit-time-section dark-edit-section" style={{ padding: '1.5rem', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#f8fafc', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <h4 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    Modificar Horarios
                                                </h4>

                                                {/* SWITCHERS DIA 1 / DIA 2 SI TIENE HERMANO */}
                                                {siblingEntryData && (
                                                    <div className="day-switchers" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDayEditingMode(1)}
                                                            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', backgroundColor: dayEditingMode === 1 ? 'var(--primary-color)' : '#334155', color: dayEditingMode === 1 ? 'white' : '#94a3b8', cursor: 'pointer', fontWeight: 'bold' }}>
                                                            Día 1
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDayEditingMode(2)}
                                                            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', backgroundColor: dayEditingMode === 2 ? 'var(--primary-color)' : '#334155', color: dayEditingMode === 2 ? 'white' : '#94a3b8', cursor: 'pointer', fontWeight: 'bold' }}>
                                                            Día 2
                                                        </button>
                                                    </div>
                                                )}

                                                {dayEditingMode === 1 ? (
                                                    <div className="edit-form-day-wrapper animate-fade-in" key="d1">
                                                        <div className="form-group">
                                                            <label>Día de cursada {siblingEntryData && '(1)'}</label>
                                                            <select
                                                                value={selectedEntryData.day}
                                                                onChange={e => setSelectedEntryData({ ...selectedEntryData, day: e.target.value })}
                                                            >
                                                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="form-group checkbox-group">
                                                            <label className="checkbox-label" style={{ color: '#cbd5e1' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedEntryData.isDouble}
                                                                    onChange={e => setSelectedEntryData({ ...selectedEntryData, isDouble: e.target.checked })}
                                                                />
                                                                Lapso personalizado
                                                            </label>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Horario {selectedEntryData.isDouble ? 'Inicio' : ''}</label>
                                                            {selectedEntryData.isDouble ? (
                                                                <select
                                                                    value={selectedEntryData.startBlock}
                                                                    onChange={e => setSelectedEntryData({ ...selectedEntryData, startBlock: parseInt(e.target.value) })}
                                                                >
                                                                    {Array.from({ length: 14 }, (_, i) => 8 + i).map(h => (
                                                                        <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <select
                                                                    value={`${selectedEntryData.startBlock}-${selectedEntryData.endBlock}`}
                                                                    onChange={e => {
                                                                        const [s, eVal] = e.target.value.split('-');
                                                                        setSelectedEntryData({ ...selectedEntryData, startBlock: parseInt(s), endBlock: parseInt(eVal) });
                                                                    }}
                                                                >
                                                                    {defaultClassBlocks.map(b => (
                                                                        <option key={b.label} value={`${b.start}-${b.end}`}>{b.label}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                        {selectedEntryData.isDouble && (
                                                            <div className="form-group">
                                                                <label>Horario Fin</label>
                                                                <select
                                                                    value={selectedEntryData.endBlock}
                                                                    onChange={e => setSelectedEntryData({ ...selectedEntryData, endBlock: parseInt(e.target.value) })}
                                                                >
                                                                    {Array.from({ length: 14 }, (_, i) => 9 + i).filter(h => h > selectedEntryData.startBlock).map(h => (
                                                                        <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : siblingEntryData && (
                                                    <div className="edit-form-day-wrapper animate-fade-in" key="d2">
                                                        <div className="form-group">
                                                            <label>Día de cursada (2)</label>
                                                            <select
                                                                value={siblingEntryData.day}
                                                                onChange={e => setSiblingEntryData({ ...siblingEntryData, day: e.target.value })}
                                                            >
                                                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="form-group checkbox-group">
                                                            <label className="checkbox-label" style={{ color: '#cbd5e1' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={siblingEntryData.isDouble}
                                                                    onChange={e => setSiblingEntryData({ ...siblingEntryData, isDouble: e.target.checked })}
                                                                />
                                                                Lapso personalizado
                                                            </label>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Horario {siblingEntryData.isDouble ? 'Inicio' : ''}</label>
                                                            {siblingEntryData.isDouble ? (
                                                                <select
                                                                    value={siblingEntryData.startBlock}
                                                                    onChange={e => setSiblingEntryData({ ...siblingEntryData, startBlock: parseInt(e.target.value) })}
                                                                >
                                                                    {Array.from({ length: 14 }, (_, i) => 8 + i).map(h => (
                                                                        <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <select
                                                                    value={`${siblingEntryData.startBlock}-${siblingEntryData.endBlock}`}
                                                                    onChange={e => {
                                                                        const [s, eVal] = e.target.value.split('-');
                                                                        setSiblingEntryData({ ...siblingEntryData, startBlock: parseInt(s), endBlock: parseInt(eVal) });
                                                                    }}
                                                                >
                                                                    {defaultClassBlocks.map(b => (
                                                                        <option key={b.label} value={`${b.start}-${b.end}`}>{b.label}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                        {siblingEntryData.isDouble && (
                                                            <div className="form-group">
                                                                <label>Horario Fin</label>
                                                                <select
                                                                    value={siblingEntryData.endBlock}
                                                                    onChange={e => setSiblingEntryData({ ...siblingEntryData, endBlock: parseInt(e.target.value) })}
                                                                >
                                                                    {Array.from({ length: 14 }, (_, i) => 9 + i).filter(h => h > siblingEntryData.startBlock).map(h => (
                                                                        <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AgendaView;
