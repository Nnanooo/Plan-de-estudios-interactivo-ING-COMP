import React, { useState, useEffect } from 'react';
import PlanGrid from './components/PlanGrid';
import OptativasList from './components/OptativasList';
import AgendaView from './components/AgendaView';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import { supabase } from './utils/supabaseClient';
import { planData, opcionales1, opcionales2, electivas1, electivas2, correlativasOptativas } from './utils/planData';
import './App.css';
import { Toaster, toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

function App() {
  const [paintMode, setPaintMode] = useState('aprobada');
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' o 'agenda'
  const [showOptativas, setShowOptativas] = useState(false);
  const [showMateriasAprobadas, setShowMateriasAprobadas] = useState(false);
  const [showAniosCompletados, setShowAniosCompletados] = useState(false);
  const [aprobadasCount, setAprobadasCount] = useState(0);
  const [aniosCount, setAniosCount] = useState(0);
  const [showTotals, setShowTotals] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Enable/Disable marking
  const [showCorrelativas, setShowCorrelativas] = useState(false);
  const [showDisponiblesModal, setShowDisponiblesModal] = useState(false);
  const [agendaActiveSubjects, setAgendaActiveSubjects] = useState([]);

  // Guardaremos el objeto completo { "nombre_materia": "estado" }
  const [selectedOptativasMap, setSelectedOptativasMap] = useState({});

  // Valores totales del Plan
  const TOTAL_MATERIAS = 50;
  const TOTAL_ANIOS = 5;

  const [showElectivas, setShowElectivas] = useState(false);
  const [showMateriasMenu, setShowMateriasMenu] = useState(false);
  const [showFiltrosMenu, setShowFiltrosMenu] = useState(false);

  // === SISTEMA DE AUTENTICACION Y NUBE ===
  const [session, setSession] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Llave para forzar remontado de componentes y lectura de LocalStorage
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userDni, setUserDni] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadSupabaseData(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadSupabaseData(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSupabaseData = async (activeSession) => {
    try {
      // Extraemos nombre del perfil
      const { data: profileData } = await supabase
        .from('perfiles')
        .select('nombre, dni')
        .eq('id', activeSession.user.id)
        .single();

      if (profileData) {
        if (profileData.nombre) setUserName(profileData.nombre);
        if (profileData.dni) setUserDni(profileData.dni);
      }

      const { data, error } = await supabase
        .from('progreso_plan')
        .select('*')
        .eq('user_id', activeSession.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error cargando de Supabase:", error);
        return;
      }

      if (data) {
        // Sobreescribir LocalStorage con los datos de la nube
        localStorage.setItem('planDinamicoStatuses', JSON.stringify(data.materias_status || {}));
        localStorage.setItem('planDinamicoOptativas', JSON.stringify(data.optativas_status || {}));
        localStorage.setItem('agendaEntries', JSON.stringify(data.agenda_entries || []));

        // Disparar renderizado profundo
        setRefreshKey(prev => prev + 1);

        // Actualizar estados internos de App.jsx
        window.dispatchEvent(new Event('planProgressUpdated'));
        window.dispatchEvent(new Event('planOptativasUpdated'));
        window.dispatchEvent(new Event('agendaUpdated'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const syncToSupabase = async () => {
    // Si no hay sesión, abortar. Todo queda local
    if (!session) return;

    try {
      const materias_status = JSON.parse(localStorage.getItem('planDinamicoStatuses') || '{}');
      const optativas_status = JSON.parse(localStorage.getItem('planDinamicoOptativas') || '{}');
      const agenda_entries = JSON.parse(localStorage.getItem('agendaEntries') || '[]');

      const { error } = await supabase
        .from('progreso_plan')
        .update({
          materias_status,
          optativas_status,
          agenda_entries
        })
        .eq('user_id', session.user.id);

      if (error) console.error("Error sincronizando a Supabase:", error);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Escuchamos a los eventos de App que detonan guardados en Local Storage y los interceptamos
    window.addEventListener('planProgressUpdated', syncToSupabase);
    window.addEventListener('planOptativasUpdated', syncToSupabase);
    window.addEventListener('agendaUpdated', syncToSupabase);

    return () => {
      window.removeEventListener('planProgressUpdated', syncToSupabase);
      window.removeEventListener('planOptativasUpdated', syncToSupabase);
      window.removeEventListener('agendaUpdated', syncToSupabase);
    };
  }, [session]); // Recargar listeners cuando cambie la sesión

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMsg = localStorage.getItem('theme-mode');
    if (savedMsg) {
      return savedMsg === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Efecto para sincronizar la clase dark-mode en el body
  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme-mode', 'light');
    }
  }, [isDarkMode]);

  // Escuchar cambios en localStorage para actualizar los contadores
  React.useEffect(() => {
    const updateCount = () => {
      try {
        const saved = localStorage.getItem('planDinamicoStatuses');
        if (saved) {
          const statuses = JSON.parse(saved);

          // Calculo Materias Aprobadas
          const aprobadas = Object.values(statuses).filter(status => status === 'aprobada').length;
          setAprobadasCount(aprobadas);

          // Calculo Años Completados
          let anios = 0;
          for (let year = 1; year <= 5; year++) {
            const firstSemesterIndex = (year * 2) - 2;
            const secondSemesterIndex = (year * 2) - 1;

            const firstSemester = planData[firstSemesterIndex];
            const secondSemester = planData[secondSemesterIndex];

            if (!firstSemester || !secondSemester) continue;

            const isSemesterApproved = (semester) => {
              const materiasValidas = semester.materias.filter(m => m !== null);
              if (materiasValidas.length === 0) return false;
              return materiasValidas.every(m => statuses[m.id] === 'aprobada');
            };

            if (isSemesterApproved(firstSemester) && isSemesterApproved(secondSemester)) {
              anios++;
            }
          }
          setAniosCount(anios);
        }

        const savedOptativas = localStorage.getItem('planDinamicoOptativas');
        if (savedOptativas) {
          const optativasStorage = JSON.parse(savedOptativas);

          const savedStatuses = localStorage.getItem('planDinamicoStatuses');
          const statusesObj = savedStatuses ? JSON.parse(savedStatuses) : {};

          let mapResult = {};
          // optativasStorage: {"4-1": "Robótica"}
          // statusesObj: {"4-1": "regularizada"}
          Object.entries(optativasStorage).forEach(([id, nombre]) => {
            if (statusesObj[id]) {
              mapResult[nombre] = statusesObj[id]; // Guarda { "Robótica": "regularizada" }
            }
          });

          setSelectedOptativasMap(mapResult);
        }
      } catch (error) {
        console.error("Error leyendo localStorage", error);
      }
    };

    // Ejecutar al inicio
    updateCount();

    window.addEventListener('planProgressUpdated', updateCount);
    window.addEventListener('planOptativasUpdated', updateCount);

    return () => {
      window.removeEventListener('planProgressUpdated', updateCount);
      window.removeEventListener('planOptativasUpdated', updateCount);
    };
  }, []);

  // Efecto para buscar la agenda activa
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

  const getMateriasDisponibles = () => {
    const savedStatusesJSON = localStorage.getItem('planDinamicoStatuses');
    const savedStatuses = savedStatusesJSON ? JSON.parse(savedStatusesJSON) : {};

    const disponibles = [];

    // 1. Materias del plan base
    planData.forEach(cuatri => {
      cuatri.materias.forEach(m => {
        if (!m || m.nombre === 'Asignatura Optativa' || m.nombre === 'Asignatura Electiva') return;
        if (savedStatuses[m.id]) return; // Si ya está regularizada o aprobada

        // Validar correlativas
        let cumple = true;
        if (m.correlativas && m.correlativas.length > 0) {
          cumple = m.correlativas.every(corr => {
            const status = savedStatuses[corr.id];
            if (corr.condicion === 'regularizada') {
              return status === 'regularizada' || status === 'aprobada';
            }
            if (corr.condicion === 'aprobada') {
              return status === 'aprobada';
            }
            return false;
          });
        }

        if (cumple) {
          disponibles.push({
            id: m.id,
            nombre: m.nombre,
            cuatrimestreText: `Cuatrimestre ${cuatri.cuatrimestre}`
          });
        }
      });
    });

    // 2. Optativas y Electivas
    const allOptEles = [
      ...opcionales1.map(n => ({ nombre: n, tipo: 'Optativa (1er Ciclo)' })),
      ...opcionales2.map(n => ({ nombre: n, tipo: 'Optativa (2do Ciclo)' })),
      ...electivas1.map(n => ({ nombre: n, tipo: 'Electiva' })),
      ...electivas2.map(n => ({ nombre: n, tipo: 'Electiva' }))
    ];

    allOptEles.forEach(opt => {
      const optStatus = selectedOptativasMap[opt.nombre];
      if (optStatus) return; // Si ya se tiene estado registrado 

      const correlativas = correlativasOptativas[opt.nombre];
      let cumple = true;
      if (correlativas && correlativas.length > 0) {
        cumple = correlativas.every(corr => {
          const status = savedStatuses[corr.id];
          if (corr.condicion === 'regularizada') {
            return status === 'regularizada' || status === 'aprobada';
          }
          if (corr.condicion === 'aprobada') {
            return status === 'aprobada';
          }
          return false;
        });
      }

      if (cumple) {
        disponibles.push({
          id: opt.nombre,
          nombre: opt.nombre,
          cuatrimestreText: opt.tipo
        });
      }
    });

    return disponibles;
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Generando PDF del Plan...');
    try {
      const element = document.querySelector('.table-wrapper');
      if (!element) throw new Error("Tabla no encontrada");

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      // A4 Horizontal
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, imgHeight);
      pdf.save("Plan_Interactivo_Ing_Computacion.pdf");

      toast.success('¡Descargado correctamente!', { id: toastId });
      setShowExportModal(false);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo realizar la descarga.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    const toastId = toast.loading('Exportando a Excel...');
    try {
      const table = document.querySelector('.plan-table');
      if (!table) throw new Error("Tabla no encontrada");

      // Transforma el HTML de la tabla plana
      const wb = XLSX.utils.table_to_book(table, { sheet: "Plan de Estudio" });
      XLSX.writeFile(wb, "Plan_Interactivo_Ing_Computacion.xlsx");

      toast.success('¡Descargado correctamente!', { id: toastId });
      setShowExportModal(false);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo realizar la descarga.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Agenda virtual de Ingeniería en Computación</h1>
      </header>

      <Toaster position="bottom-center" />

      {/* MODAL DE PANEL DE ADMIN */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* MODALES DE AUTENTICACION */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(newSession) => {
            setShowAuthModal(false);
            // El useEffect de onAuthStateChange ya atrapará esto y llamará a loadSupabaseData
          }}
        />
      )}

      {/* MODAL DE CONFIRMACIÓN LOGOUT */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)} style={{ zIndex: 99999 }}>
          <div className="modal-content export-modal logout-confirm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px', width: '90%', padding: '1.5rem', textAlign: 'center', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1.25rem' }}>Cerrar Sesión</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: '1.4' }}>
              <strong>{userName ? userName : "Usuario"}</strong>, ¿estás seguro que deseas salir de tu cuenta?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-color)', cursor: 'pointer', fontWeight: 600, flex: 1 }}
                onClick={() => setShowLogoutConfirm(false)}
              >
                No
              </button>
              <button
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600, flex: 1 }}
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await supabase.auth.signOut();
                  setUserName('');
                  toast.success('Sesión cerrada. Mostrando progreso local.');
                  setRefreshKey(prev => prev + 1);
                }}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXPORTACIÓN */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => !isExporting && setShowExportModal(false)}>
          <div className="modal-content export-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Exportar Plan de Estudio</h3>
              <button className="modal-close" onClick={() => !isExporting && setShowExportModal(false)} disabled={isExporting}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Selecciona el formato en el que deseas descargar tu progreso actual:</p>
              <div className="export-buttons-container">
                <button
                  className="export-btn pdf-btn"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                >
                  {isExporting ? 'Procesando...' : '📄 Exportar como PDF'}
                </button>
                <button
                  className="export-btn excel-btn"
                  onClick={handleExportExcel}
                  disabled={isExporting}
                >
                  {isExporting ? 'Procesando...' : '📊 Exportar como Excel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MATERIAS DISPONIBLES */}
      {showDisponiblesModal && (
        <div className="modal-overlay" onClick={() => setShowDisponiblesModal(false)} style={{ zIndex: 99999 }}>
          <div className="modal-content export-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3>Materias Disponibles para Cursar</h3>
              <button className="modal-close" onClick={() => setShowDisponiblesModal(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '1rem', textAlign: 'left' }}>
              <p style={{ color: 'var(--text-color)', marginBottom: '1rem', marginTop: '0' }}>Estas son las asignaturas que podés cursar actualmente basado en tus materias aprobadas y regularizadas:</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {getMateriasDisponibles().length > 0 ? (
                  getMateriasDisponibles().map((mat, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--sidebar-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{mat.nombre}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-color)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>{mat.cuatrimestreText}</span>
                    </li>
                  ))
                ) : (
                  <li style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No hay materias disponibles para cursar actualmente.
                  </li>
                )}
              </ul>
            </div>
            <div className="modal-footer" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="export-btn"
                style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setShowDisponiblesModal(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="top-navbar">
        <div className="nav-menu">
          {/* GRUPO IZQUIERDO: Theme y Exportar */}
          <div className="nav-group left">
            <button
              className="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>

            <button
              className="nav-link export-trigger-btn"
              style={{ padding: '0.4rem 0.8rem', border: 'none', backgroundColor: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
              onClick={() => setShowExportModal(true)}
              title="Exportar Plan"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Exportar...
            </button>
          </div>

          {/* GRUPO CENTRAL: Filtros y Menús */}
          <div className="nav-group center">
            <div
              className="dropdown-container"
              onMouseEnter={() => setShowMateriasMenu(true)}
              onMouseLeave={() => setShowMateriasMenu(false)}
            >
              <button
                className="nav-link"
                onClick={(e) => {
                  /* Prevenir comportamiento de un solo toque y permitir mostrar/ocultar el menú */
                  e.stopPropagation();
                  setShowMateriasMenu(!showMateriasMenu);
                  if (!showMateriasMenu) setShowFiltrosMenu(false);
                }}
              >
                Materias <span className="arrow-down">▼</span>
              </button>
              {showMateriasMenu && (
                <div className="dropdown-menu">
                  <button
                    className={`dropdown-item ${showOptativas ? 'active' : ''}`}
                    onClick={() => setShowOptativas(!showOptativas)}
                  >
                    <span className={`toggle-indicator ${showOptativas ? 'dot-active' : ''}`}>{showOptativas ? '●' : '○'}</span>  Optativas
                  </button>
                  <button
                    className={`dropdown-item ${showElectivas ? 'active' : ''}`}
                    onClick={() => setShowElectivas(!showElectivas)}
                  >
                    <span className={`toggle-indicator ${showElectivas ? 'dot-active' : ''}`}>{showElectivas ? '●' : '○'}</span>  Electivas
                  </button>
                  <button
                    className={`dropdown-item ${showMateriasAprobadas ? 'active' : ''}`}
                    onClick={() => setShowMateriasAprobadas(!showMateriasAprobadas)}
                  >
                    <span className={`toggle-indicator ${showMateriasAprobadas ? 'dot-active' : ''}`}>{showMateriasAprobadas ? '●' : '○'}</span> Contador Materias Aprobadas
                  </button>
                  <button
                    className={`dropdown-item ${showCorrelativas ? 'active' : ''}`}
                    onClick={() => setShowCorrelativas(!showCorrelativas)}
                  >
                    <span className={`toggle-indicator ${showCorrelativas ? 'dot-active' : ''}`}>{showCorrelativas ? '●' : '○'}</span> Correlatividades
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowMateriasMenu(false);
                      setShowDisponiblesModal(true);
                    }}
                  >
                    <span className="toggle-indicator">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </span> Disponibles para cursar
                  </button>
                </div>
              )}
            </div>

            <div
              className="dropdown-container"
              onMouseEnter={() => setShowFiltrosMenu(true)}
              onMouseLeave={() => setShowFiltrosMenu(false)}
            >
              <button
                className="nav-link"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFiltrosMenu(!showFiltrosMenu);
                  if (!showFiltrosMenu) setShowMateriasMenu(false);
                }}
              >
                Filtros <span className="arrow-down">▼</span>
              </button>
              {showFiltrosMenu && (
                <div className="dropdown-menu">
                  <button
                    className={`dropdown-item ${showAniosCompletados ? 'active' : ''}`}
                    onClick={() => setShowAniosCompletados(!showAniosCompletados)}
                  >
                    <span className={`toggle-indicator ${showAniosCompletados ? 'dot-active' : ''}`}>{showAniosCompletados ? '●' : '○'}</span> Contador Años Completados
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* GRUPO DERECHO: Vistas y Modos */}
          <div className="nav-group right">
            <button
              className={`nav-link ${isEditMode ? 'active-tab-btn' : ''}`}
              onClick={() => setIsEditMode(!isEditMode)}
              title="Activar o desactivar edición de materias"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span className="nav-text">Modo Edición</span>
            </button>

            <button
              className={`nav-link ${activeTab === 'agenda' ? 'active-tab-btn' : ''}`}
              onClick={() => setActiveTab(activeTab === 'plan' ? 'agenda' : 'plan')}
              title="Agenda Semanal"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="nav-text">Agenda</span>
            </button>

            {/* BOTÓN DE SESIÓN E ICONO ADMIN */}
            {!session ? (
              <button
                className="nav-link auth-nav-btn trigger-login"
                onClick={() => setShowAuthModal(true)}
                title="Iniciar Sesión"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="nav-text">Iniciar Sesión</span>
              </button>
            ) : (
              <>
                {userDni === '45736927' && (
                  <button
                    className="nav-link auth-nav-btn trigger-admin"
                    onClick={() => setShowAdminPanel(true)}
                    title="Panel de Administración"
                    style={{ color: '#a78bfa', borderColor: 'transparent', padding: '0 0.5rem', marginLeft: '0.2rem' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.5))' }}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <path d="M5 16L3 5L8.5 10L12 2L15.5 10L21 5L19 16H5M5 19H19V21H5V19Z" />
                      </svg>
                    </span>
                  </button>
                )}
                <button
                  className="nav-link auth-nav-btn auth-nav-logout"
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Cerrar Sesión"
                  style={{ color: '#ef4444' }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span className="nav-text" style={{ color: '#ef4444' }}>Cerrar Sesión</span>
                </button>
              </>
            )}

          </div>
        </div>
      </nav>

      <div className="views-slider-container">
        <div className={`views-slider ${activeTab === 'agenda' ? 'slide-to-agenda' : ''}`}>

          {/* VISTA 1: PLAN DE ESTUDIOS */}
          <div className="view-panel plan-panel">
            <div className="app-content-wrapper">
              <header className="app-header plan-header" style={{ paddingTop: '0.8rem', marginBottom: '0.2rem' }}>
                <h2 style={{ fontSize: '1.4rem', marginTop: 0, marginBottom: '0.1rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Plan de estudio de Ingeniería en computación</h2>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                  {isEditMode
                    ? `Selecciona materias ${paintMode === 'aprobada' ? 'aprobadas' : 'regularizadas'}`
                    : 'Modo visualización (Activa el Modo Edición para modificar tus progresos)'}
                </p>
              </header>
              <div className="app-layout">
                {(showOptativas || showElectivas) && (
                  <aside className="sidebar left-sidebar">
                    {showOptativas && <OptativasList key={`opt1-${refreshKey}`} title="Optativas de Tecnicaturas" materias={opcionales1} colorClass="style-1" selectedMap={selectedOptativasMap} agendaActiveSubjects={agendaActiveSubjects} showCorrelativasActivo={showCorrelativas} />}
                    {showElectivas && <OptativasList key={`opt2-${refreshKey}`} title="Electivas" materias={electivas1} colorClass="style-1" selectedMap={selectedOptativasMap} agendaActiveSubjects={agendaActiveSubjects} showCorrelativasActivo={showCorrelativas} />}
                  </aside>
                )}

                <main className="main-content">
                  <div className="center-controls">
                    {isEditMode && (
                      <div className="paint-controls">
                        <button
                          className={`paint-btn btn-aprobada ${paintMode === 'aprobada' ? 'active' : ''}`}
                          onClick={() => setPaintMode('aprobada')}
                        >
                          Materia aprobada
                        </button>
                        <button
                          className={`paint-btn btn-regularizada ${paintMode === 'regularizada' ? 'active' : ''}`}
                          onClick={() => setPaintMode('regularizada')}
                        >
                          Materia regularizada
                        </button>
                      </div>
                    )}

                    <div className="counters-container" style={{ marginLeft: isEditMode ? '0' : 'auto', marginRight: isEditMode ? '0' : 'auto' }}>
                      {showMateriasAprobadas && (
                        <div className="aprobadas-counter">
                          <button
                            className={`eye-toggle-btn ${showTotals ? 'active' : ''}`}
                            onClick={() => setShowTotals(!showTotals)}
                            title="Mostrar/Ocultar Totales"
                          >
                            {showTotals ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            )}
                          </button>
                          Materias Aprobadas:
                          <span>
                            {aprobadasCount}
                            {showTotals && <span className="total-slash">/{TOTAL_MATERIAS}</span>}
                          </span>
                        </div>
                      )}
                      {showAniosCompletados && (
                        <div className="aprobadas-counter">
                          <button
                            className={`eye-toggle-btn ${showTotals ? 'active' : ''}`}
                            onClick={() => setShowTotals(!showTotals)}
                            title="Mostrar/Ocultar Totales"
                          >
                            {showTotals ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            )}
                          </button>
                          Años Completados:
                          <span>
                            {aniosCount}
                            {showTotals && <span className="total-slash">/{TOTAL_ANIOS}</span>}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid-wrapper">
                    <PlanGrid
                      key={`plan-${refreshKey}`}
                      paintMode={paintMode}
                      isEditMode={isEditMode}
                      showCorrelativasActivo={showCorrelativas}
                      opcionales1={opcionales1}
                      opcionales2={opcionales2}
                      electivas1={electivas1}
                      electivas2={electivas2}
                      agendaActiveSubjects={agendaActiveSubjects}
                    />
                  </div>
                </main>

                {(showOptativas || showElectivas) && (
                  <aside className="sidebar right-sidebar">
                    {showOptativas && <OptativasList key={`opt3-${refreshKey}`} title="Optativas de Ingenierías" materias={opcionales2} colorClass="style-2" selectedMap={selectedOptativasMap} agendaActiveSubjects={agendaActiveSubjects} showCorrelativasActivo={showCorrelativas} />}
                    {showElectivas && <OptativasList key={`opt4-${refreshKey}`} title="Electivas" materias={electivas2} colorClass="style-2" selectedMap={selectedOptativasMap} agendaActiveSubjects={agendaActiveSubjects} showCorrelativasActivo={showCorrelativas} />}
                  </aside>
                )}
              </div>
            </div>
            <footer className="app-footer">
              <p>WebApp desarrollada por un alumno de la Universidad de Tres de Febrero</p>
            </footer>
          </div>

          {/* VISTA 2: AGENDA SEMANAL */}
          <div className="view-panel agenda-panel">
            <AgendaView key={`agenda-${refreshKey}`} onGoBack={() => setActiveTab('plan')} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
