# 🎓 Plan de Estudio Dinámico e Interactivo

Una aplicación web diseñada para que los estudiantes universitarios puedan organizar su carrera, hacer seguimiento del estado de sus materias (Aprobadas, Regularizadas, Libres), gestionar el cumplimiento automático de correlatividades y estructurar su semana con una Agenda Interactiva configurable.

## 🚀 Cómo Funciona

El sistema está compuesto por herramientas clave para la vida académica:
1. **Grilla Interactiva:** Un tablero visual (PlanGrid) con todas las materias de la carrera organizadas por cuatrimestre, año y tipo (Obligatorias, Optativas, Electivas). El sistema no te permite cursar o aprobar materias si no cumples con el candado lógico de sus correlativas.
2. **Agenda Semanal Dinámica:** Un calendario donde el alumno puede desplegar las materias que cursa actualmente o "Cursos Extra". Soporta días múltiples, control automático de colisiones de horarios, y personalización visual mediante temas cromáticos.
3. **Roles y Autenticación:** Cuentas individuales donde cada usuario guarda su propio progreso y agenda de forma remota. Cuenta con un sistema interno de privilegios con un "Panel de Administración" oculto para gestionar altas, bajas y modificaciones de cuentas directamente desde la interfaz.

## 🛠️ Tecnologías Usadas

El proyecto está construido bajo una arquitectura moderna orientada a componentes y Serverless Backend:

- **Frontend (Interfaz de Usuario)**
  - **React.js:** Framework base para construir toda la interfaz de forma declarativa y atada a estados lógicos.
  - **Vite:** Herramienta de compilación ultrarrápida (Bundler).
  - **Vanilla CSS:** Todos los estilos visuales, overlays, responsive design y animaciones se hicieron con código CSS puro, sin depender de librerías de estilos prefabricadas como Tailwind o Bootstrap, logrando una estética cuidada y original ("Rich Aesthetics").
  - **React-Hot-Toast:** Para las notificaciones de éxito/error en vivo.

- **Backend & Base de Datos**
  - **Supabase:** Actúa como nuestro ecosistema de servidor central.
  - **PostgreSQL:** Base de datos relacional para resguardar los `perfiles`, el `progreso_plan` de los alumnos y las entradas de su `agenda`.
  - **Supabase Auth:** Para la validación de logueo seguro.
  - **RLS (Row Level Security), Funciones RPC y Triggers:** Programados nativamente en SQL para asegurar que nadie vea datos de otros y que el administrador pueda borrar usuarios/pines de manera segura sin lidiar con servidores intermediarios (Node.js/Python).

## 🤖 La Filosofía "Vibecoding"

El proceso de desarrollo de esta aplicación fue un experimento completo y exitoso de **Vibecoding** (también conocido como *AI Pair Programming*). El código no se escribió de la manera tradicional, sino mediante una colaboración directa y fluida entre un humando y una IA.

**¿Cómo nos dividimos el trabajo?**

- **El Director de Proyecto (El Usuario):** Llevó el sombrero arquitectónico y estratégico. Definiste el alcance de la aplicación, marcaste estrictamente cómo querías que funcionaran los bordes interactivos de la aplicación, evaluaste obsesivamente los errores visuales (como las animaciones por hover o qué iconos eran confusos), detectaste qué características de la base de datos se rompían y exigiste un código responsivo que no se deformara en celular. Básicamente, tú eras el Product Manager y el Lead de UX diciéndole a las máquinas "qué tiene que existir y cómo debe sentirse al usarlo".
- **El AI Coder (Antigravity):** Funcionó como el "teclado experto". Tradujo tu dirección e indicaciones verbales en rutinas complejas de React, enganchó la lógica de estados de JavaScript, forjó a mano las hojas CSS y diseñó el comportamiento de los Triggers/Políticas en la base PostgreSQL de Supabase.

Cualquier parecido con un sistema hecho por un equipo de programadores durante un mes, es pura magia del Vibecoding.
