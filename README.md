# 🎓 Plan de Estudio Dinámico e Interactivo

Una aplicación web diseñada para que los estudiantes universitarios puedan organizar su carrera, hacer seguimiento del estado de sus materias (Aprobadas, Regularizadas, Libres), gestionar el cumplimiento automático de correlatividades y estructurar su semana con una Agenda Interactiva configurable.

## 🚀 Cómo Funciona

El sistema está compuesto por herramientas clave para la vida académica:
1. **Grilla Interactiva:** Un tablero visual (PlanGrid) con todas las materias de la carrera organizadas por cuatrimestre, año y tipo (Obligatorias, Optativas, Electivas). El sistema impide seleccionar, cursar o aprobar materias si no se cumple con el requerimiento lógico de sus correlativas previas.
2. **Agenda Semanal Dinámica:** Un calendario donde el alumno puede organizar las materias que cursa actualmente o añadir "Cursos Extra". Soporta cursadas de múltiples días, control automático de colisiones de horarios para evitar superposiciones, y personalización visual mediante temas cromáticos integrados.
3. **Gestión de Usuarios y Seguridad:** El acceso está protegido mediante cuentas individuales donde cada usuario guarda su propio progreso y agenda de forma remota. Adicionalmente, cuenta con un sistema interno de roles que incluye un "Panel de Administración" oculto para gestionar altas, bajas y modificaciones de cuentas directamente desde la interfaz de forma segura.

## 🛠️ Tecnologías Utilizadas

El proyecto está construido bajo una arquitectura web moderna, orientada a componentes y soportada por un backend Serverless:

- **Frontend (Interfaz de Usuario)**
  - **React.js:** Framework base utilizado para construir toda la interfaz de forma declarativa, gestionando el estado global y local de manera eficiente.
  - **Vite:** Herramienta de compilación ultrarrápida (Bundler) elegida por su velocidad en desarrollo y rápida optimización para entornos de producción.
  - **Vanilla CSS:** Todos los estilos visuales, overlays, diseño responsivo y animaciones fueron desarrollados con código CSS puro. Se evitó el uso de librerías de estilos prefabricadas para lograr un control total sobre el diseño y mantener una estética cuidada, dinámica y original (*Rich Aesthetics*).
  - **React-Hot-Toast:** Implementado para brindar notificaciones de éxito y error no invasivas y en tiempo real.

- **Backend & Base de Datos**
  - **Supabase:** Plataforma utilizada como ecosistema integral de servidor (Backend-as-a-Service).
  - **PostgreSQL:** Base de datos relacional robusta encargada de persistir los perfiles, el progreso académico de los alumnos y las entradas personalizadas de cada agenda temporal.
  - **Supabase Auth:** Módulo de autenticación manejado para garantizar accesos seguros, registro de cuentas y validación de sesiones.
  - **RLS (Row Level Security), Funciones RPC y Triggers:** Lógica de negocio y seguridad programada nativamente en código SQL. Esto asegura que la privacidad de los datos esté estrictamente protegida a nivel de fila y que las acciones administrativas (como la eliminación de usuarios o blanqueo de contraseñas) se ejecuten en la base de datos sin necesidad de levantar servidores middleware convencionales.

## 🤖 El Proceso de Desarrollo: "Vibecoding"

El desarrollo de esta aplicación se llevó a cabo bajo el paradigma de **Vibecoding** (también conocido como *AI Pair Programming*). El código no fue estructurado mediante los métodos tradicionales de ingeniería en solitario, sino que es el resultado de una colaboración directa, iterativa y conversacional entre un creador humano y una Inteligencia Artificial asistente.

**División de responsabilidades en el proyecto:**

- **El Creador (Director del Proyecto):** Asumió el rol de Product Manager, Arquitecto y Lead de UX. Se encargó de definir el alcance y las funcionalidades clave de la aplicación, delimitar las reglas lógicas y de negocio (como el estricto funcionamiento de las correlatividades), y concebir la experiencia de usuario general. A su vez, fue el encargado de dirigir y supervisar puntillosamente el control de calidad visual y responsivo, garantizando que mecánicas finas como los hovers de tarjetas, los modales superpuestos y la adaptabilidad fluida en dispositivos móviles se lograran satisfactoriamente. Su dirección estratégica e instrucciones marcaron el criterio de qué necesitaba existir y cómo debía sentirse usar producto final.
- **La Inteligencia Artificial (AI Coder):** Funcionó como el músculo técnico y desarrollador de código. Se encargó de traducir las directrices, arquitecturas visuales y requisitos dados iterativamente en bloques de código estructurado: desde la topología de los componentes funcionales en React o la ingeniería de estilos precisos en Vanilla CSS, hasta el modelado atómico de políticas de lectura (RLS) y Triggers automatizados de la infraestructura Backend en PostgreSQL.

Este flujo de trabajo permitió materializar una plataforma completa, altamente funcional y estéticamente atractiva, demostrando el potencial del desarrollo auxiliado e iterativo en en la arquitectura de software contemporánea.
