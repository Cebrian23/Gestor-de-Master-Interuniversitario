# Gestor de Máster Interuniversitario

Aplicación full stack para administrar titulaciones de máster interuniversitario: personas, asignaturas, cursos académicos, convocatorias, TFMs y métricas de calidad. Combina un cliente **Vite + React + TypeScript** y una **API REST en TypeScript ejecutada con Deno**.

## Índice

- [Resumen](#resumen)
- [Arquitectura](#arquitectura)
- [Frontend — Vite + React](#frontend--vite--react)
- [Backend — API REST TypeScript](#backend--api-rest-typescript)
- [Componentes y módulos](#componentes-y-módulos)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
- [Variables de entorno](#variables-de-entorno)
- [API REST](#api-rest)
- [Estructura](#estructura)
- [Despliegue](#despliegue)

## Resumen

El sistema centraliza la gestión académica de un máster compartido entre universidades. Permite dar de alta titulaciones, personal administrativo, profesorado, coordinación y estudiantes; definir asignaturas y sus cursos académicos; registrar calificaciones por convocatoria; consultar indicadores de calidad y notas por universidad.

Los perfiles identificables son administrativo, profesor, coordinador/coordinador general y estudiante. La interfaz muestra acciones distintas por rol: administración de titulaciones y asignaturas, docencia y calificación, y consulta de información académica. Destacan los tipos TypeScript compartidos conceptualmente entre ambos lados, MongoDB como persistencia documental y formularios que validan datos antes de invocar la API.

## Arquitectura

```mermaid
flowchart LR
  U[Usuario] --> FE[Front End:<br/>React + TypeScript]
  FE -->|Peticiones HTTPS| API[Back End:<br/>Deno + TypeScript]
  API --> |Envío de datos| DB[(MongoDB)]
  API --> |Petición de datos| DB
  DB --> |Devolución de datos| API
  API --> |Devolución de datos| FE
  API -->|Validación email/teléfono| N[API Ninjas]
  FE -->|Validación email/teléfono| N[API Ninjas]
```

El frontend es una SPA enrutada con `react-router-dom`; cada vista consulta el backend con `fetch` y conserva el identificador de la sesión y la selección actual en cookies. El backend concentra el enrutado en `main.ts`, valida datos, transforma documentos MongoDB a DTOs y opera sobre tres colecciones. `utilities/` contiene transformaciones y validaciones reutilizables.

## Frontend — Vite + React

- **Stack:** Vite 8, React 19, TypeScript 5.9, React Router 7 y CSS propio.
- **Estado y navegación:** `useState`/`useEffect`, `BrowserRouter` y navegación imperativa con `globalThis.location.href`.
- **Sesión visual:** `js-cookie` guarda `authTFG` y las selecciones de titulación, asignatura, curso, convocatoria y TFM durante siete días.
- **UX:** `NProgress` durante operaciones, alertas para errores, formularios controlados, comprobaciones locales de campos y utilidades para DNI, email, teléfono y cifrado.
- **Informes:** `ControlCalidad` usa Recharts; `AsignaturaDocentePage` y `ShowNotasUniversidad` usan jsPDF y `jspdf-autotable` para documentos.

Las rutas incluyen inicio de sesión (`/login`), altas de persona, titulación, asignatura, curso, curso TFM y calificaciones; páginas de detalle de titulación/asignatura/curso/TFM; listados; perfil y actualización. `Header` es común y los sidebars `SidebarAdministrativo`, `SidebarCoordinador` y `SidebarProfesor` definen las acciones visibles por perfil.

## Backend — API REST TypeScript

La API se sirve con `Deno.serve` en `0.0.0.0:4000` por defecto. Acepta `GET`, `POST`, `PUT` y `OPTIONS` y emite JSON.

MongoDB se accede mediante el driver oficial. Las colecciones son `Personas`, `Titulaciones` y `Asignaturas` de la base `TFM`. Los tipos modelan personas, asignaturas/cursos/convocatorias, bloques/defensas de TFM y titulaciones. Las funciones `Transform_*` resuelven referencias de `ObjectId` para devolver los datos requeridos.

Las validaciones cubren DNI, email y teléfono. Email y teléfono delegan en API Ninjas; el DNI se valida localmente. El servidor responde principalmente con `400`, `404`, `406` y `409` ante datos ausentes, referencias inválidas, validaciones o conflictos; las respuestas correctas usan `200`. La ruta desconocida retorna `404`.

**Seguridad actual:** Las contraseñas y DNI se cifran simétricamente con CryptoJS/AES usando `DNI_KEY`.

## Componentes y módulos

| Área | Elementos | Responsabilidad |
|---|---|---|
| Formularios | `Login`, `NewPersona`, `NewTitulacion`, `NewAsignatura`, `NewCurso`, `NewCursoTFM`, `NewNotas`, `NewTFM`, `UpdateUser` | Captura, comprobación local y envío de altas/actualizaciones |
| Vistas | `UserPage`, `TitulacionPage`, `AsignaturaTitulacionPage`, `AsignaturaDocentePage`, `CursoPage`, `CursoTFMPage`, `TFM_BlockPage` | Consulta y presenta entidades y detalles |
| Listados/informes | `Show*`, `ControlCalidad` | Navegación por entidades, gráficas de calidad, notas y PDF |
| UI | `Header`, tres `Sidebar*`, CSS | Cabecera y acciones condicionadas por perfil |
| Backend | `main.ts` | Handler HTTP y reglas de negocio principal |
| Backend | `db/connection.ts` | Conexión y colecciones MongoDB |
| Backend | `types/` | Tipos de datos |
| Backend | `utilities/Personas`, `Asignaturas`, `Titulacion` | Transformación de referencias y objetos resumidos |
| Backend | `utilities/Validaciones`, `Transforms` | Validaciones y cifrado |

## Instalación y ejecución local

### Requisitos

- Node.js compatible con Vite 8 (recomendable Node 20.19+ o 22.12+).
- Deno (el backend usa Deno y `deno.json`).
- Una instancia accesible de MongoDB.
- Claves de API Ninjas para las validaciones activas.

```bash
git clone <URL_DEL_REPOSITORIO>
cd "Gestor de Máster Interuniversitario"

cd Back_End
deno task dev

cd Front_End
npm install
npm run dev
```

El backend escucha en `http://localhost:4000`.

Para generar el cliente de producción:

```bash
cd Front_End
npm run build
npm run preview
```

El backend solo define `deno task dev`.

## Variables de entorno

| Servicio | Variable | Obligatoria | Propósito | Ejemplo ficticio |
|---|---|---:|---|---|
| Backend | `MONGO_URL` | Sí | Cadena de conexión MongoDB | `mongodb+srv://usuario:clave@cluster.example/` |
| Backend | `DNI_KEY` | Sí | Clave AES empleada para encriptar DNI y contraseñas | `clave-local-de-desarrollo` |
| Backend | `API_KEY` | Sí | Cabecera `X-Api-Key` de API Ninjas para validación de email y teléfono | `api_ninjas_key_de_ejemplo` |
| Frontend | `DNI_KEY` | Sí | Clave AES empleada para encriptar DNI y contraseñas | `clave-local-de-desarrollo` |
| Frontend | `API_KEY` | Sí | Cabecera `X-Api-Key` de API Ninjas para validación de email y teléfono | `api_ninjas_key_de_ejemplo` |

## API REST

Base local: `http://localhost:4000`. Todas las rutas responden JSON en caso de éxito y, habitualmente, `{ "error": "..." }` en caso de error.

### Consultas (`GET`)

| Ruta | Consulta obligatoria | Respuesta / finalidad | Estados observados |
|---|---|---|---|
| `/login` | `email`, `password` | Persona transformada tras validar credenciales | 200, 400, 404, 406 |
| `/persona/id` | `id` | Persona por ID | 200, 400, 404, 406 |
| `/persona/email` | `email` | Persona por email | 200, 400, 404 |
| `/personas/alumnos` | `titulacion` | Estudiantes resumidos de una titulación | 200, 404, 406 |
| `/personas/alumnos_para_asignatura` | `titulacion`, `asignatura` | Estudiantes elegibles para asignatura | 200, 404, 406 |
| `/personas/alumnos_para_TFM` | `titulacion` | Estudiantes sin TFM aprobado | 200, 404, 406 |
| `/personas/docentes` | `titulacion` | Profesorado/coordinación de una titulación | 200, 404, 406 |
| `/personas/coordinadores` | `titulacion` | Coordinadores de una titulación | 200, 404, 406 |
| `/docente/titulaciones` | `docente` | Titulaciones asignadas a docente | 200, 400 |
| `/docente/asignaturas` | `docente`, `titulacion` | Cursos/asignaturas impartidos | 200, 400, 404, 406 |
| `/administrativo/titulaciones` | `admin` | Titulaciones administradas | 200, 400 |
| `/asignatura` | `id` | Asignatura o bloque por ID | 200, 400, 404, 406 |
| `/curso` | `asignatura`, `curso` | Curso académico de asignatura | 200, 400, 404, 406 |
| `/convocatoria` | `asignatura`, `curso`, `convocatoria` | Convocatoria de curso | 200, 400, 404, 406 |
| `/asignaturas/nombres` | `titulacion` | Nombres de asignaturas | 200, 400, 404 |
| `/asignaturas/notas_curso` | `titulacion`, `curso`, `universidad`, `convocatoria` | Notas para informes universitarios | 200, 400, 404 |
| `/titulaciones/num` | — | Conteo de titulaciones | 200 |
| `/titulacion` | `id` | Titulación por ID | 200, 400, 404, 406 |
| `/titulacion/creacion` | `titulacion` | Año de creación | 200, 400, 404 |
| `/titulacion/convocatorias` | `id` | Número de convocatorias disponibles | 200, 400, 404 |
| `/titulacion/cursos` | `id` | Número de cursos del plan | 200, 400, 404 |
| `/titulacion/universidades` | `id` | Universidades participantes | 200, 400, 404 |
| `/titulacion/cursos_aptos` | `id` | Grados aptos | 200, 400, 404 |
| `/titulacion/estudiantes_notas_universidad` | Consulta de titulación/universidad | Notas de estudiantes por universidad | 200, 400, 404 |
| `/titulacion/control_calidad` | Consulta de titulación | Datos para métricas de calidad | 200, 400, 404 |
| `/bloque_TFM` | `id` | Bloque de TFMs | 200, 400, 404, 406 |
| `/cursos_TFM` | `bloque` | Cursos contenidos en bloque TFM | 200, 400, 404, 406 |
| `/bloque_TFM/curso` | `bloque`, `curso` | Curso concreto de bloque TFM | 200, 400, 404, 406 |

### Operaciones de escritura

Los cuerpos se procesan como JSON. Los campos listados son los extraídos por la API; los ID son cadenas MongoDB. Éxito: `{ "message": "..." }` con `200`; los errores usan `400`, `404`, `406` o `409` según la validación.

| Método y ruta | Cuerpo JSON esperado | Acción |
|---|---|---|
| `POST /persona` | `nombre`, `apellido_1`, `apellido_2?`, `DNI`, `prefijo_movil?`, `numero_movil?`, `email`, `password?`, `grado_academico?`, `universidad?`, `curso_admision?`, `rol`, `titulacion` | Crea persona y la vincula a titulación según rol |
| `POST /register` | Datos personales y `rol: "Administrativo"` | Registra administrativo sin vinculación inicial |
| `POST /titulacion` | `nombre`, `universidades[]`, `grados_aptos[]`, `cursos`, `convocatorias`, `administrativo`, créditos obligatorio/optativo/TFM, `asignaturas?` | Crea titulación, bloque TFM y asignaturas iniciales |
| `POST /asignatura` | `nombre`, `titulacion`, `curso`, `creditos`, `optatividad` | Añade asignatura a titulación |
| `POST /curso` | `asignatura`, `curso`, `profesores[]`, `estudiantes[]` | Crea curso académico de asignatura |
| `POST /cursoTFM` | `nombre`, `alumnos[]`, `titulacion` | Crea curso dentro del bloque TFM |
| `POST /curso/calificar_convocatoria` | `asignatura`, `curso`, `convocatoria`, `notas[]`, `academico` | Registra calificaciones de convocatoria |
| `POST /TFM` | `titulacion`, `titulo`, `alumno`, `director[]`, `tribunal[]`, `curso`, `fecha_def`, `hora_def`, `convocatoria`, `nota` | Registra y califica TFM |
| `PUT /datos_persona` | `id`, `rol` y campos actualizables: nombre, apellidos, contraseña, `prefix`, `phone` | Actualiza datos personales |
| `PUT /datos_asignatura` | `id`, `name?`, `curso?`, `creditos?` | Actualiza datos de asignatura |
| `PUT /datos_curso` | `id`, `name` | Actualiza el nombre de curso académico |
| `PUT /datos_TFM_block` | `id`, `curso?`, `creditos?` | Actualiza bloque TFM |

Ejemplo de alta de asignatura:

```http
POST /asignatura
Content-Type: application/json

{"nombre": "Arquitecturas Web", "titulacion": "<id>","curso": "1º","creditos": 6, "optatividad": "Obligatoria"}
```

```json
{"message":"Asignatura creada correctamente"}
```

## Estructura

```text
Front_End/
├── public/
├── src/
│   ├── Forms/                 # Login, altas, calificación y actualización
│   ├── Header/                # Cabecera
│   ├── Pages/                 # Detalles, listados, gráficas e informes
│   ├── Sidebar/               # Barra lateral, para la navegación por rol
│   ├── types/                 # Tipos de datos
│   ├── utilities/             # Cifrado y validaciones locales
│   ├── App.tsx                # Rutas SPA
│   └── main.tsx
├── package.json
└── vite.config.ts

Back_End/
├── db/connection.ts           # Cliente y colecciones MongoDB
├── types/                     # Tipos de datos
├── utilities/                 # Transformaciones de los tipos de datos
│   ├── Asignaturas/           
│   ├── Personas/              
│   ├── Titulacion/
│   ├── Transforms/            
│   └── Validaciones/
├── main.ts                    # Handler y rutas REST
├── deno.json                  
└── Dockerfile
```

## Despliegue

A través de los siguientes enlaces se puede acceder tanto al backend como al frontend, ambos desplegados en Render:

- `Front_End`: https://tfg-front-end-xtvw.onrender.com
- `Back_End`: https://tfg-back-end-w9t4.onrender.com
