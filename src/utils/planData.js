export const planData = [
    {
        cuatrimestre: 1,
        materias: [
            { id: '1-1', nombre: 'Introducción a la Ingeniería en Computación' },
            { id: '1-2', nombre: 'Introducción a la Problemática del Mundo Contemporáneo' },
            { id: '1-3', nombre: 'Algoritmos y Programación I' },
            { id: '1-4', nombre: 'Algebra I' },
            { id: '1-5', nombre: 'Matemática Discreta' },
            null
        ]
    },
    {
        cuatrimestre: 2,
        materias: [
            { id: '2-1', nombre: 'Problemas de Historia del Siglo XX' },
            {
                id: '2-2',
                nombre: 'Algoritmos y Programación II',
                correlativas: [
                    { id: '1-3', condicion: 'regularizada' }
                ]
            },
            {
                id: '2-3',
                nombre: 'Programación de bajo nivel',
                correlativas: [
                    { id: '1-1', condicion: 'regularizada' }
                ]
            },
            {
                id: '2-4',
                nombre: 'Algebra II',
                correlativas: [
                    { id: '1-4', condicion: 'regularizada' }
                ]
            },
            {
                id: '2-5',
                nombre: 'Diseño Lógico',
                correlativas: [
                    { id: '1-3', condicion: 'regularizada' },
                    { id: '1-1', condicion: 'regularizada' },
                    { id: '1-5', condicion: 'regularizada' }
                ]
            },
            null
        ]
    },
    {
        cuatrimestre: 3,
        materias: [
            {
                id: '3-1',
                nombre: 'Análisis Matemático I',
                correlativas: [
                    { id: '1-4', condicion: 'regularizada' }
                ]
            },
            { id: '3-2', nombre: 'Cuestiones de Sociología, Economía y Política' },
            {
                id: '3-3',
                nombre: 'Estructura de Datos',
                correlativas: [
                    { id: '2-2', condicion: 'regularizada' }
                ]
            },
            {
                id: '3-4',
                nombre: 'Arquitecturas de Computadoras I',
                correlativas: [
                    { id: '2-5', condicion: 'regularizada' }
                ]
            },
            { id: '3-5', nombre: 'Ingles básico' },
            null
        ]
    },
    {
        cuatrimestre: 4,
        materias: [
            { id: '4-1', nombre: 'Asignatura Optativa' },
            {
                id: '4-2',
                nombre: 'Análisis Matemático II',
                correlativas: [
                    { id: '3-1', condicion: 'regularizada' }
                ]
            },
            { id: '4-3', nombre: 'Cultura Contemporánea' },
            {
                id: '4-4',
                nombre: 'Sistemas Operativos',
                correlativas: [
                    { id: '3-3', condicion: 'regularizada' },
                    { id: '2-3', condicion: 'regularizada' }
                ]
            },
            {
                id: '4-5',
                nombre: 'Inglés técnico',
                correlativas: [
                    { id: '3-5', condicion: 'regularizada' }
                ]
            },
            { id: '4-6', nombre: 'Taller de lectoescritura' }
        ]
    },
    {
        cuatrimestre: 5,
        materias: [
            {
                id: '5-1',
                nombre: 'Ingeniería de Software',
                correlativas: [
                    { id: '2-1', condicion: 'regularizada' },
                    { id: '4-5', condicion: 'regularizada' }
                ]
            },
            {
                id: '5-2',
                nombre: 'Física I',
                correlativas: [
                    { id: '3-1', condicion: 'regularizada' }
                ]
            },
            {
                id: '5-3',
                nombre: 'Comunicación de Datos',
                correlativas: [
                    { id: '4-4', condicion: 'regularizada' }
                ]
            },
            {
                id: '5-4',
                nombre: 'Base de Datos',
                correlativas: [
                    { id: '3-3', condicion: 'regularizada' },
                    { id: '4-5', condicion: 'regularizada' }
                ]
            },
            null,
            null
        ]
    },
    {
        cuatrimestre: 6,
        materias: [
            { id: '6-1', nombre: 'Asignatura Optativa' },
            {
                id: '6-2',
                nombre: 'Física II',
                correlativas: [
                    { id: '4-2', condicion: 'regularizada' },
                    { id: '5-2', condicion: 'regularizada' }
                ]
            },
            {
                id: '6-3',
                nombre: 'Redes de Computadoras',
                correlativas: [
                    { id: '5-3', condicion: 'regularizada' }
                ]
            },
            {
                id: '6-4',
                nombre: 'Diseño y Arquitectura de Sistemas de Computación',
                correlativas: [
                    { id: '5-1', condicion: 'regularizada' },
                    { id: '4-4', condicion: 'regularizada' }
                ]
            },
            {
                id: '6-5',
                nombre: 'Probabilidad y Estadística',
                correlativas: [
                    { id: '4-2', condicion: 'regularizada' }
                ]
            },
            null
        ]
    },
    {
        cuatrimestre: 7,
        materias: [
            {
                id: '7-1',
                nombre: 'Trayecto formativo alternativo',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            {
                id: '7-2',
                nombre: 'Matemáticas Especiales',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            {
                id: '7-3',
                nombre: 'Dispositivos electrónicos',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '6-2', condicion: 'regularizada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            {
                id: '7-4',
                nombre: 'Algebra III',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            {
                id: '7-5',
                nombre: 'Ingeniería de Calidad',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '5-2', condicion: 'regularizada' },
                    { id: '6-5', condicion: 'regularizada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            null
        ]
    },
    {
        cuatrimestre: 8,
        materias: [
            {
                id: '8-1',
                nombre: 'Trayecto formativo alternativo',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            { id: '8-2', nombre: 'Asignatura Electiva' },
            {
                id: '8-3',
                nombre: 'Laboratorio de electrónica',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '7-3', condicion: 'regularizada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            {
                id: '8-4',
                nombre: 'Construcción de Sistemas de Computación',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '6-4', condicion: 'regularizada' },
                    { id: '6-3', condicion: 'regularizada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            {
                id: '8-5',
                nombre: 'Procesamiento de Señales',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '7-4', condicion: 'regularizada' },
                    { id: '7-2', condicion: 'regularizada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            { id: '8-6', nombre: 'Metodología de la investigación' }
        ]
    },
    {
        cuatrimestre: 9,
        materias: [
            {
                id: '9-1',
                nombre: 'Trayecto formativo alternativo',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            { id: '9-2', nombre: 'Asignatura Electiva' },
            {
                id: '9-3',
                nombre: 'Sistemas Embebidos',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '8-4', condicion: 'regularizada' },
                    { id: '7-3', condicion: 'regularizada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            {
                id: '9-4',
                nombre: 'Sistemas Ciberfísicos',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '8-4', condicion: 'regularizada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            {
                id: '9-5',
                nombre: 'Control Automático',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '7-2', condicion: 'regularizada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            null
        ]
    },
    {
        cuatrimestre: 10,
        materias: [
            {
                id: '10-1',
                nombre: 'Ética y Legislación',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '7-5', condicion: 'regularizada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            {
                id: '10-2',
                nombre: 'Higiene y Seguridad',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '7-5', condicion: 'regularizada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            {
                id: '10-3',
                nombre: 'Práctica Profesional Supervisada',
                correlativas: [
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '7-4', condicion: 'regularizada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '5-4', condicion: 'regularizada' },
                    { id: '5-3', condicion: 'regularizada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '6-4', condicion: 'regularizada' },
                    { id: '7-3', condicion: 'regularizada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '5-2', condicion: 'regularizada' },
                    { id: '6-2', condicion: 'regularizada' },
                    { id: '7-5', condicion: 'regularizada' },
                    { id: '5-1', condicion: 'regularizada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '7-2', condicion: 'regularizada' },
                    { id: '6-5', condicion: 'regularizada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '6-3', condicion: 'regularizada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' },
                    { id: '7-1', condicion: 'regularizada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' }
                ]
            },
            {
                id: '10-4',
                nombre: 'Trabajo Final Integrador',
                correlativas: [
                    { id: '8-6', condicion: 'regularizada' },
                    { id: '1-4', condicion: 'aprobada' },
                    { id: '2-4', condicion: 'aprobada' },
                    { id: '1-3', condicion: 'aprobada' },
                    { id: '2-2', condicion: 'aprobada' },
                    { id: '3-1', condicion: 'aprobada' },
                    { id: '4-2', condicion: 'aprobada' },
                    { id: '3-4', condicion: 'aprobada' },
                    { id: '3-2', condicion: 'aprobada' },
                    { id: '4-3', condicion: 'aprobada' },
                    { id: '2-5', condicion: 'aprobada' },
                    { id: '3-3', condicion: 'aprobada' },
                    { id: '3-5', condicion: 'aprobada' },
                    { id: '4-5', condicion: 'aprobada' },
                    { id: '1-1', condicion: 'aprobada' },
                    { id: '1-2', condicion: 'aprobada' },
                    { id: '1-5', condicion: 'aprobada' },
                    { id: '2-1', condicion: 'aprobada' },
                    { id: '2-3', condicion: 'aprobada' },
                    { id: '4-4', condicion: 'aprobada' },
                    { id: '4-6', condicion: 'aprobada' }
                ]
            },
            null,
            null
        ]
    }
];

export const opcionales1 = [
    "Diseño de Páginas Web",
    "Fundamentos de Computación",
    "Arquitecturas Avanzadas",
    "Inteligencia Artificial",
    "Soberanía y Geopolítica Tecnológica"
];

export const opcionales2 = [
    "Sistemas Operativos Avanzados",
    "Ingeniería de Requerimientos",
    "Arquitecturas Avanzadas",
    "Ingeniería de Software II",
    "Diseño y Análisis Digital de Objetos y Fenómenos Físicos"
];

export const electivas1 = [
    "Sistemas de Información Geográfica II",
    "Gestión de los servicios de Enfermería",
    "Infraestructura de Datos Espaciales"
];

export const electivas2 = [
    "Instrumento I",
    "Taller de herramientas SIG II",
    "Teledetección"
];

const reqPrimerosDosAnios = [
    { id: '1-4', condicion: 'aprobada' },
    { id: '2-4', condicion: 'aprobada' },
    { id: '1-3', condicion: 'aprobada' },
    { id: '2-2', condicion: 'aprobada' },
    { id: '3-1', condicion: 'aprobada' },
    { id: '4-2', condicion: 'aprobada' },
    { id: '3-4', condicion: 'aprobada' },
    { id: '3-2', condicion: 'aprobada' },
    { id: '4-3', condicion: 'aprobada' },
    { id: '2-5', condicion: 'aprobada' },
    { id: '3-3', condicion: 'aprobada' },
    { id: '1-1', condicion: 'aprobada' },
    { id: '1-2', condicion: 'aprobada' },
    { id: '1-5', condicion: 'aprobada' },
    { id: '2-1', condicion: 'aprobada' },
    { id: '2-3', condicion: 'aprobada' },
    { id: '4-4', condicion: 'aprobada' },
    { id: '4-6', condicion: 'aprobada' },
    { id: '3-5', condicion: 'aprobada' },
    { id: '4-5', condicion: 'aprobada' }
];

export const correlativasOptativas = {
    "Diseño de Páginas Web": [
        { id: '2-2', condicion: 'regularizada' }
    ],
    "Arquitecturas Avanzadas": [
        { id: '3-4', condicion: 'regularizada' }
    ],
    "Fundamentos de Computación": [
        { id: '1-5', condicion: 'regularizada' }
    ],
    "Sistemas de Información Geográfica II": reqPrimerosDosAnios,
    "Gestión de los servicios de Enfermería": reqPrimerosDosAnios,
    "Infraestructura de Datos Espaciales": reqPrimerosDosAnios,
    "Instrumento I": reqPrimerosDosAnios,
    "Taller de herramientas SIG II": reqPrimerosDosAnios,
    "Teledetección": reqPrimerosDosAnios
};
