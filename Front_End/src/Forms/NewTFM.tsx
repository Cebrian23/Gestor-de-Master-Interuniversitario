import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { TFM_Block_Curso, TFM_ins } from "../types/Asignaturas/TFM.ts";
import type { Coordinador_Short } from "../types/Personas/Coordinador.ts";
import type { Estudiante_Short } from "../types/Personas/Estudiante.ts";
import type { Profesor_Short } from "../types/Personas/Profesor.ts";
import SidebarCoordinador from "../Sidebar/SidebarCoordinador.tsx";
import Header from "../Header/Header.tsx";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

function NewTFM() {
    const [pagina, setPagina] = useState(1);

    const [nombre, setNombre] = useState("");
    const [curso, setCurso] = useState("");
    const [estudiante, setEstudiante] = useState("");
    const [estudianteData, setEstudianteData] = useState("");
    const [director, setDirector] = useState("");
    const [directores, setDirectores] = useState<string[]>([]);
    const [miembro, setMiembro] = useState("");
    const [miembrosTribunal, setTribunal] = useState<string[]>([]);
    const [convocatoria, setConvocatoria] = useState("Ordinaria");
    const [nota, setNota] = useState<string | number>("Sin calificar");
    const [fecha, setFecha] = useState("");
    const [hora, setHora] = useState("12:00");
    const [titulacion, setTitulacion] = useState("");

    const [showNota, setShow] = useState(false);
    const [alumnos, setAlumnos] = useState<Estudiante_Short[]>([]);
    const [docentes, setDocentes] = useState<(Profesor_Short | Coordinador_Short)[]>([]);
    //const [docentesBusqueda, setDocentesBusqueda] = useState<(Profesor_Short | Coordinador_Short)[]>([]);
    const [cursosInfo, setCursosInfo] = useState<TFM_Block_Curso[]>([]);
    const [universidad, setUniversidad] = useState("");

    const [nombreError, setNombreError] = useState("");
    const [cursoError, setCursoError] = useState("");
    const [estudianteError, setEstudianteError] = useState("");
    const [directoresError, setDirectoresError] = useState("");
    const [tribunalError, setTribunalError] = useState("");
    const [calificacionError, setCalificacionError] = useState("");

    const [buttonAction, setButtonAction] = useState(false);
    const [creationSuccess, setCreationSuccess] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const getPersonas = async () => {
            const auth = Cookie.get("authTFG");
            if(auth === undefined){
                globalThis.location.href = "/login";
            }
            
            const url_persona = `https://tfg-back-end.onrender.com/persona/id?id=${auth}`;
            const response_persona = await fetch(url_persona, {
                method: "GET",
            });

            if(response_persona.status !== 200){
                const error = await response_persona.json();
                alert(error.error);

                globalThis.location.href = "/login";
            }

            const data_persona = await response_persona.json();
            setUniversidad(data_persona.universidad);

            if(data_persona.rol !== "Coordinador" && data_persona.rol !== "Coordinador general"){
                alert("Tienes que ser un coordinador para registrar un TFM");

                globalThis.location.href = "/login";
            }

            const TFG_titulacion = Cookie.get("TFG_titulacion");

            if(TFG_titulacion === undefined){
                if(data_persona.rol === "Coordinador" || data_persona.rol === "Coordinador general"){
                    alert("No puedes insertar un TFM");
                }

                globalThis.location.href = "/paginaPersonal";
            }

            const url_titulacion = `https://tfg-back-end.onrender.com/titulacion?id=${TFG_titulacion}`;
            const response_titulacion = await fetch(url_titulacion, {
                method: "GET",
            });

            if(response_titulacion.status !== 200){
                const error = await response_titulacion.json();
                alert(error.error);

                globalThis.location.href = "/paginaPersonal";
            }

            const data_titulacion = await response_titulacion.json();
            setTitulacion(data_titulacion.id);

            const docente_exists: (Profesor_Short | Coordinador_Short | undefined) = data_titulacion.docentes.find((docente: (Profesor_Short | Coordinador_Short)) => {
                if(docente.id === auth){
                    return docente;
                }
            });

            if(docente_exists === undefined){
                alert("No eres coordinador en esta titulación");

                globalThis.location.href = "/paginaPersonal";
            }

            const urlDocentes = `https://tfg-back-end.onrender.com/personas/docentes?titulacion=${TFG_titulacion}`;

            const response_Docentes = await fetch(urlDocentes,
                {
                    method: "GET",
                }
            );

            if(response_Docentes.status !== 200){
                const error = await response_Docentes.json();
                alert(error.error);

                globalThis.location.href = "/paginaPersonal";
            }
            
            const dataDocentes = await response_Docentes.json();

            if(dataDocentes.length === 0){
                alert("Hay que tener al menos a un docente dado de alta");

                globalThis.location.href = "/paginaPersonal";
            }

            setDocentes(dataDocentes);
            
            /*
            const newDocentes: (Coordinador_Short | Profesor_Short)[] = [];

            dataDocentes.forEach((docente: (Coordinador_Short | Profesor_Short)) => {
                if(docente.id !== data_persona.id){
                    newDocentes.push(docente);
                }
                else{
                    setTribunal([docente.id]);
                }
            });

            setDocentes(newDocentes);
            setDocentesBusqueda(dataDocentes);
            */

            const url_cursos = `https://tfg-back-end.onrender.com/cursos_TFM?titulacion=${TFG_titulacion}`;

            const response_cursos = await fetch(url_cursos,
                {
                    method: "GET",
                }
            );

            if(response_cursos.status !== 200){
                const error = await response_cursos.json();
                alert(error.error);

                globalThis.location.href = "/paginaPersonal";
            }

            const dataCursos = await response_cursos.json();

            setCursosInfo(dataCursos)
        }

        getPersonas();
    }, []);

    if(fecha === ""){
        const date = new Date();

        let month;
        let day;

        if(date.getMonth() < 10){

            month = "0" + (date.getMonth()+1).toString();
        }
        else{
            month = date.getMonth().toString();
        }

        if(date.getDate() < 10){
            day = "0" + date.getDate().toString();
        }
        else{
            day = date.getDate().toString();
        }

        const new_date = date.getFullYear().toString() + "-" + month + "-" + day

        setFecha(new_date);
    }

    const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
        setEstudiante(e.currentTarget.value);
        setEstudianteError("");
        alumnos.forEach((alumno) => {
            if(alumno.DNI === e.currentTarget.value){
                if(alumno.apellido_2 !== undefined && alumno.apellido_2 !== null && alumno.apellido_2.trim() !== ""){
                    setEstudianteData(`${alumno.nombre} ${alumno.apellido_1} ${alumno.apellido_2}`);
                }
                else{
                    setEstudianteData(`${alumno.nombre} ${alumno.apellido_1}`);
                }
            }
        });
    }
    
    const handleReset = () => {
        setNombre("");
        setEstudiante("");
        setEstudianteData("");
        setAlumnos([]);
        setDirector("")
        setDirectores([]);
        setMiembro("")
        setTribunal([]);
        setConvocatoria("Ordinaria");
        setNota("Sin calificar");
        setFecha("");
        setCurso("");
        setHora("12:00");
        setShow(false);

        setNombreError("");
        setCursoError("");
        setEstudianteError("");
        setDirectoresError("");
        setTribunalError("");
        setCalificacionError("");
        
        setButtonAction(false);
        setPagina(1);
    }

    const handleCreation = async () => {
        setButtonAction(true);

        let error_exists = false;

        if(nombre.trim() === ""){
            setNombreError("Hay que rellenar este campo");
            error_exists = true;
        }

        if(estudiante.trim() === ""){
            setEstudianteError("Hay que asignar un alumno al TFM");
            error_exists = true;
        }

        if(directores.length === 0){
            setDirectoresError("El estudiante debe tener al menos a un director");
            error_exists = true;
        }

        if(miembrosTribunal.length === 0){
            setTribunalError("El TFM debe tener miembros en el tribunal de defensa");
            error_exists = true;
        }

        if(nota === "Sin calificar"){
            setCalificacionError("Hay que agregar una calificación");
            error_exists = true;
        }

        if(error_exists === false){
            const data_TFM: TFM_ins = {
                titulacion: titulacion,
                titulo: nombre,
                curso: curso,
                alumno: estudiante,
                director: directores,
                tribunal: miembrosTribunal,
                fecha_def: `${fecha.split("-")[2]}-${fecha.split("-")[1]}-${fecha.split("-")[0]}`,
                hora_def: hora,
                convocatoria: convocatoria,
                nota: nota,
            }

            NProgress.start();
                                
            try{
                const url = `https://tfg-back-end.onrender.com/TFM`;
                const response = await fetch(url, {
                    method: "POST",
                    body: JSON.stringify(data_TFM),
                });

                if(response.status !== 200){
                    const error = await response.json();

                    alert(error.error);
                    
                    setButtonAction(false);
                }
                else{
                    const data = await response.json();
                    setMessage(data.message);
                    setCreationSuccess(true);
                }
            }
            finally{
                NProgress.done();
            }
        }
        else{
            alert("Falta rellenar algún campo");
            setButtonAction(false);
        }
    }

    return(
        <div className="finalPage">
            <Header/>
            <div className="totalPage">
                <SidebarCoordinador/>
                {
                    creationSuccess === false &&
                    <div className="grid_group_TFM">
                        <form className="newTFM">
                            <h1>Registro de TFM</h1>
                            {
                                /*<div>
                                    <p className="message_auto">Autocompletar los campos con un PDF/Excel</p>
                                    <input type="file" accept=".pdf, .xlsx"/>
                                </div>*/
                            }
                            {
                                pagina === 1 &&
                                <>
                                    <div className="column">
                                        <label htmlFor="curso">Curso:</label>
                                        <select id="curso" name="curso" value={curso} onChange={(e) => {
                                            setCurso(e.currentTarget.value);

                                            cursosInfo.forEach((cursito) => {
                                                if(cursito.nombre === e.currentTarget.value){
                                                    const newCursito: Estudiante_Short[] = [];

                                                    cursito.alumnos.forEach((alumno) => {
                                                        if(alumno.rol === "Estudiante" && alumno.universidad === universidad){
                                                            newCursito.push(alumno);
                                                        }
                                                    })
                                                    setAlumnos(newCursito);
                                                }
                                            });
                                        }}>
                                            <option value="">Selecciona un curso</option>
                                            {
                                                cursosInfo.map((cursito) => {
                                                    return(
                                                        <option key={cursito.id} value={cursito.nombre}>{cursito.nombre}</option>
                                                    )
                                                })
                                            }
                                        </select>
                                        <div className="error">{cursoError}</div>
                                    </div>
                                    <div className="column">
                                        <label htmlFor="titulo">Título:</label>
                                        <input type="text" placeholder="Titulo" value={nombre} onChange={(e) => {
                                            setNombre(e.currentTarget.value);
                                            setNombreError("");
                                        }}/>
                                        <div className="error">{nombreError}</div>
                                    </div>
                                    <div className="column">
                                        <label>Alumno:</label>
                                        <div className="add_data">
                                            <select value={estudiante} onChange={(e) => {
                                                handleStudentChange(e);
                                            }}>
                                                <option key="" value="">Seleccionar Estudiante</option>
                                                {
                                                    alumnos.map((alumno) => {
                                                        return(
                                                            <option key={alumno.id} value={alumno.DNI}>{alumno.nombre} {alumno.apellido_1} ({alumno.email})</option>
                                                        )
                                                    })
                                                }
                                            </select>
                                        </div>
                                        <div className="error">{estudianteError}</div>
                                    </div>
                                    <div className="column">
                                        <label>Director/es:</label>
                                        <div className="add_data">
                                            {
                                                docentes.length > 0 &&
                                                <>
                                                    <select defaultValue="" onChange={(e) => setDirector(e.currentTarget.value)}>
                                                        <option key="" value="">Seleccionar Director</option>
                                                        {
                                                            docentes.map((docente) => {
                                                                return(
                                                                    <option key={docente.id} value={docente.id}>{docente.nombre} {docente.apellido_1} ({docente.email})</option>
                                                                )
                                                            })
                                                        }
                                                    </select>
                                                    <button type="button" onClick={() => {
                                                        if(director.trim() !== ""){
                                                            const docente_exists = directores.find((docente) => {
                                                                if(docente === director){
                                                                    return docente;
                                                                }
                                                            })

                                                            const inTribunal = miembrosTribunal.find((docente) => {
                                                                if(docente === miembro){
                                                                    return docente;
                                                                }
                                                            })

                                                            if(docente_exists === undefined && inTribunal === undefined){
                                                                const directores_aux = directores;
                                                                directores_aux.push(director);
                                                                setDirectores(directores_aux);
                                                                setDirector("");
                                                            }
                                                            else if(docente_exists !== undefined){
                                                                alert("Director ya insertado");
                                                            }
                                                            else if(inTribunal !== undefined){
                                                                alert("Este docente es parte del tribunal de defensa");
                                                            }
                                                        }

                                                        setDirectoresError("");
                                                    }}>Insertar a la lista</button>
                                                </>   
                                            }
                                            <button type="button" disabled={directores.length === 0 ? true : false} onClick={() => setDirectores([])}>Reiniciar lista</button>
                                        </div>
                                        <div className="error">{directoresError}</div>
                                    </div>
                                    <div className="column">
                                        <label>Miembros del tribunal:</label>
                                        <div className="add_data">
                                            {
                                                docentes.length > 0 &&
                                                <>
                                                    <select defaultValue="" onChange={(e) => setMiembro(e.currentTarget.value)}>
                                                        <option key="" value="">Seleccionar Miembro</option>
                                                        {
                                                            docentes.map((docente) => {
                                                                return(
                                                                    <option key={docente.id} value={docente.id}>{docente.nombre} {docente.apellido_1} ({docente.email})</option>
                                                                )
                                                            })
                                                        }
                                                    </select>
                                                    <button type="button" onClick={() => {
                                                        if(miembro.trim() !== ""){
                                                            const miembro_exists = miembrosTribunal.find((docente) => {
                                                                if(docente === miembro){
                                                                    return docente;
                                                                }
                                                            })

                                                            const isDirector = directores.find((docente) => {
                                                                if(docente === miembro){
                                                                    return docente;
                                                                }
                                                            });

                                                            if(miembro_exists === undefined && isDirector === undefined){
                                                                const miembros_aux = miembrosTribunal;
                                                                miembros_aux.push(miembro);
                                                                setTribunal(miembros_aux);
                                                                setMiembro("");
                                                            }
                                                            else if(miembro_exists !== undefined){
                                                                alert("Miembro del tribunal ya insertado");
                                                            }
                                                            else if(isDirector !== undefined){
                                                                alert("Este miembro es uno de los directores del TFM");
                                                            }
                                                        }
                                                        
                                                        setTribunalError("");
                                                    }}>Insertar a la lista</button>
                                                </>
                                            }
                                        <button type="button" disabled={miembrosTribunal.length === 0 ? true : false} onClick={() => setTribunal([])}>Reiniciar lista</button>
                                        </div>
                                        <div className="error">{tribunalError}</div>
                                    </div>
                                </>
                            }
                            {
                                pagina === 2 &&
                                <>
                                    <div className="column">
                                        <label htmlFor="convocatoria">Convocatoria</label>
                                        <select id="convocatoria" value={convocatoria} onChange={(e) => setConvocatoria(e.currentTarget.value)}>
                                            <option value="Ordinaria">Ordinaria</option>
                                            <option value="Extraordinaria">Extraordinaria</option>
                                        </select>
                                    </div>
                                    <div className="column">
                                        <label htmlFor="fecha">Fecha de la defensa:</label>
                                        <input type="date" value={fecha} onChange={(e) => {
                                            setFecha(e.currentTarget.value);
                                        }}/>
                                    </div>
                                    <div className="column">
                                        <label htmlFor="hora">Hora de la defensa:</label>
                                        <input type="time" name="hora" value={hora} onChange={(e) => setHora(e.currentTarget.value)}/>
                                    </div>
                                    <div className="column">
                                        <label htmlFor="calificacion">Nota:</label>
                                        <select defaultValue="Sin calificar" onChange={(e) => {
                                            if(e.currentTarget.value !== "Calificar con valor numerico"){
                                                setNota(e.currentTarget.value);
                                                setShow(false);
                                            }
                                            else{
                                                setNota(5);
                                                setShow(true);
                                            }

                                            setCalificacionError("");
                                        }}>
                                            <option value="No presentado">No presentado</option>
                                            <option value="Sin calificar">Sin calificar</option>
                                            <option value="Calificar con valor numerico">Calificar</option>
                                        </select>
                                        {
                                            showNota === true &&
                                            <>
                                                <input name="nota" type="number" defaultValue="5" min="0" max="10" step={0.1} onChange={(e) => {
                                                    let newNota = Number(e.currentTarget.value);

                                                    if(newNota < 0.0){
                                                        newNota = 0.0;
                                                    }
                                                    else if(newNota > 10.0){
                                                        newNota = 10.0;
                                                    }

                                                    setNota(newNota);

                                                    setCalificacionError("");
                                                }}/>
                                            </>
                                        }
                                        <div className="error">{calificacionError}</div>
                                    </div>
                                </>
                            }
                            <div className="buttons">
                                {
                                    pagina === 1 &&
                                    <>
                                        <button type="button" onClick={() => globalThis.location.href = "/paginaPersonal"}>Volver</button>
                                        <button type="reset" onClick={handleReset}>Vaciar campos</button>
                                    </>
                                }
                                {
                                    pagina > 1 &&
                                    <>
                                        <button type="button" onClick={() => setPagina(pagina-1)}>Página anterior</button>
                                        <button type="reset" onClick={handleReset}>Vaciar campos</button>
                                    </>
                                }
                                {
                                    (pagina === 1) &&
                                    <>
                                        <button
                                            type="button"
                                            disabled={
                                                (curso === "" && nombre === "" && estudiante === "" && directores.length === 0 && miembrosTribunal.length === 0) ? true : false
                                            }
                                            onClick={() => setPagina(pagina+1)}
                                        >
                                            Siguiente página
                                        </button>
                                    </>
                                }
                                {
                                    pagina === 2 &&
                                    <>
                                        <button type="button" onClick={handleCreation} disabled={buttonAction}>Enviar</button>
                                    </>
                                }
                            </div>
                        </form>
                        <div>
                            <h3>Datos del TFM:</h3>
                            <div>
                                <p><b>Título del TFM: </b>{nombre}</p>
                            </div>
                            <div>
                                <p>
                                    {
                                        estudiante !== "" &&
                                        <>
                                            <b>Alumno: </b> {estudianteData}
                                        </>
                                    }
                                </p>
                            </div>
                            {
                                directores.length === 1 &&
                                <div>
                                    <p>
                                        <b>Director: </b>
                                        {
                                            directores.map((director) => {
                                                const persona = docentes.find((persona) => {
                                                    if(persona.id === director){
                                                        return persona;
                                                    }
                                                });

                                                if(persona === undefined){
                                                    return;
                                                }
                                                
                                                if(persona.apellido_2 !== null && persona.apellido_2 !== undefined && persona.apellido_2.trim() !== ""){
                                                    return(
                                                        <span key={persona.id}>{persona.nombre} {persona.apellido_1} {persona.apellido_2} ({persona.email})</span>
                                                    )
                                                }
                                                else{
                                                    return(
                                                        <span key={persona.id}>{persona.nombre} {persona.apellido_1} ({persona.email})</span>
                                                    )
                                                }
                                            })
                                        }
                                    </p>
                                </div>
                            }
                            {
                                directores.length > 1 &&
                                <div>
                                    <p>
                                        <b>Directores:</b>
                                    </p>
                                    <ul>
                                        {
                                            directores.map((director) => {
                                                const persona = docentes.find((persona) => {
                                                    if(persona.id === director){
                                                        return persona;
                                                    }
                                                });

                                                if(persona === undefined){
                                                    return;
                                                }
                                                
                                                if(persona.apellido_2 !== null && persona.apellido_2 !== undefined && persona.apellido_2.trim() !== ""){
                                                    return(
                                                        <li key={persona.id} value={persona.id}>{persona.nombre} {persona.apellido_1} {persona.apellido_2} ({persona.email})</li>
                                                    )
                                                }
                                                else{
                                                    return(
                                                        <li key={persona.id} value={persona.id}>{persona.nombre} {persona.apellido_1} ({persona.email})</li>
                                                    )
                                                }
                                            })
                                        }
                                    </ul>
                                </div>
                            }
                            {
                                miembrosTribunal.length === 1 &&
                                <div>
                                    <p>
                                        <b>Miembro del tribunal: </b>
                                        {
                                            miembrosTribunal.map((miembro) => {
                                                const persona = docentes.find((persona) => {
                                                    if(persona.id === miembro){
                                                        return persona;
                                                    }
                                                });

                                                if(persona === undefined){
                                                    return;
                                                }
                                                
                                                if(persona.apellido_2 !== null && persona.apellido_2 !== undefined && persona.apellido_2.trim() !== ""){
                                                    return(
                                                        <span key={persona.id}>{persona.nombre} {persona.apellido_1} {persona.apellido_2} ({persona.email})</span>
                                                    )
                                                }
                                                else{
                                                    return(
                                                        <span key={persona.id}>{persona.nombre} {persona.apellido_1} ({persona.email})</span>
                                                    )
                                                }
                                            })
                                        }
                                    </p>
                                </div>
                            }
                            {
                                miembrosTribunal.length > 1 &&
                                <div>
                                    <p><b>Miembros del tribunal:</b></p>
                                    <ul>
                                        {
                                            miembrosTribunal.map((miembro) => {
                                                const persona = docentes.find((persona) => {
                                                    if(persona.id === miembro){
                                                        return persona;
                                                    }
                                                });

                                                if(persona === undefined){
                                                    return;
                                                }
                                                
                                                if(persona.apellido_2 !== null && persona.apellido_2 !== undefined && persona.apellido_2.trim() !== ""){
                                                    return(
                                                        <li key={persona.id} value={persona.id}>{persona.nombre} {persona.apellido_1} {persona.apellido_2} ({persona.email})</li>
                                                    )
                                                }
                                                else{
                                                    return(
                                                        <li key={persona.id} value={persona.id}>{persona.nombre} {persona.apellido_1} ({persona.email})</li>
                                                    )
                                                }
                                            })
                                        }
                                    </ul>
                                </div>
                            }
                            <div>
                                <p><b>Convocatoria: </b>{convocatoria}</p>
                            </div>
                            <div>
                                <p><b>Fecha y hora de la defensa: </b>{hora} {fecha.split("-")[2]}-{fecha.split("-")[1]}-{fecha.split("-")[0]}</p>
                            </div>
                            <div>
                                <p><b>Nota: </b>{nota}</p>
                            </div>
                        </div>
                    </div>
                }
                {
                    creationSuccess === true &&
                    <div className="message_response">
                        <div className="column">
                            <h1>{message}</h1>
                        </div>
                        <div className="buttons">
                            <button type="button" onClick={() => globalThis.location.href = "/paginaPersonal"}>Continuar</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default NewTFM;