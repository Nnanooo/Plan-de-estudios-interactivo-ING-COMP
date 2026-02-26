import React, { useState, useEffect } from 'react';
import PlanGrid from './components/PlanGrid';
import OptativasList from './components/OptativasList';
import { planData } from './utils/planData';
import './App.css';
import { Toaster, toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

function App() {
  const [paintMode, setPaintMode] = useState('aprobada');
  const [showOptativas, setShowOptativas] = useState(false);
  const [showMateriasAprobadas, setShowMateriasAprobadas] = useState(false);
  const [showAniosCompletados, setShowAniosCompletados] = useState(false);
  const [aprobadasCount, setAprobadasCount] = useState(0);
  const [aniosCount, setAniosCount] = useState(0);
  const [showTotals, setShowTotals] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // Guardaremos el objeto completo { "nombre_materia": "estado" }
  const [selectedOptativasMap, setSelectedOptativasMap] = useState({});

  // Valores totales del Plan
  const TOTAL_MATERIAS = 50;
  const TOTAL_ANIOS = 5;

  const opcionales1 = [
    "Diseño de Páginas Web",
    "Fundamentos de Computación",
    "Arquitecturas Avanzadas",
    "Inteligencia Artificial",
    "Soberanía y Geopolítica Tecnológica"
  ];

  const opcionales2 = [
    "Sistemas Operativos Avanzados",
    "Ingeniería de Requerimientos",
    "Arquitecturas Avanzadas",
    "Ingeniería de Sotware II",
    "Diseño y Análisis Digital de Objetos y Fenómenos Físicos"
  ];

  const electivas1 = [
    "Sistemas de Información Geográfica II",
    "Gestión de los servicios de Enfermería",
    "Infraestructura de Datos Espaciales"
  ];

  const electivas2 = [
    "Instrumento I",
    "Taller de herramientas SIG II",
    "Teledetección"
  ];

  const [showElectivas, setShowElectivas] = useState(false);
  const [showMateriasMenu, setShowMateriasMenu] = useState(false);
  const [showFiltrosMenu, setShowFiltrosMenu] = useState(false);

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
          const anios = Math.floor(aprobadas / 10);
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
        <h1>Plan de estudio Ingeniería en Computación</h1>
      </header>

      <Toaster position="bottom-center" />

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

      <nav className="top-navbar">
        <div className="nav-menu">
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

          <div
            className="dropdown-container"
            onMouseEnter={() => setShowMateriasMenu(true)}
            onMouseLeave={() => setShowMateriasMenu(false)}
          >
            <button className="nav-link">
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
                <button className="dropdown-item disabled" title="Próximamente">
                  <span className="toggle-indicator">○</span>  Correlatividades
                </button>
              </div>
            )}
          </div>

          <div
            className="dropdown-container"
            onMouseEnter={() => setShowFiltrosMenu(true)}
            onMouseLeave={() => setShowFiltrosMenu(false)}
          >
            <button className="nav-link">
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

          <button
            className="nav-link export-trigger-btn"
            style={{ marginLeft: 'auto', justifySelf: 'flex-end', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '0.4rem 1rem', cursor: 'pointer' }}
            onClick={() => setShowExportModal(true)}
          >
            Exportar como...
          </button>
        </div>
      </nav>

      <div className="app-content-wrapper">
        <header className="app-header">
          <p>Selecciona materias {paintMode === 'aprobada' ? 'aprobadas' : 'regularizadas'}</p>
        </header>
        <div className="app-layout">
          {(showOptativas || showElectivas) && (
            <aside className="sidebar left-sidebar">
              {showOptativas && <OptativasList title="Optativas de Tecnicaturas" materias={opcionales1} colorClass="style-1" selectedMap={selectedOptativasMap} />}
              {showElectivas && <OptativasList title="Electivas" materias={electivas1} colorClass="style-1" selectedMap={selectedOptativasMap} />}
            </aside>
          )}

          <main className="main-content">
            <div className="center-controls">
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

              <div className="counters-container">
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
                paintMode={paintMode}
                opcionales1={opcionales1}
                opcionales2={opcionales2}
                electivas1={electivas1}
                electivas2={electivas2}
              />
            </div>
          </main>

          {(showOptativas || showElectivas) && (
            <aside className="sidebar right-sidebar">
              {showOptativas && <OptativasList title="Optativas de Ingenierías" materias={opcionales2} colorClass="style-1" selectedMap={selectedOptativasMap} />}
              {showElectivas && <OptativasList title="Electivas" materias={electivas2} colorClass="style-1" selectedMap={selectedOptativasMap} />}
            </aside>
          )}
        </div>

        <footer className="app-footer">
          <p>El progreso se guarda automáticamente en tu navegador.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
