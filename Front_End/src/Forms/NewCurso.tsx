import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { Asignatura_Short, Curso_ins } from "../types/Asignaturas/Asignatura.ts";
import type { Coordinador } from "../types/Personas/Coordinador.ts";
import type { Estudiante } from "../types/Personas/Estudiante.ts";
import type { Profesor } from "../types/Personas/Profesor.ts";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import Header from "../Header/Header.tsx";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { data } from "react-router-dom";

function NewCurso() {
    const [curso, setCurso] = useState("");
    const [alumnos, setAlumnos] = useState<string[]>([]);
    const [docentes, setDocentes] = useState<string[]>([]);
    const [idAsignatura, setIdAsignatura] = useState("");
    const [nombreAsignatura, setNombreAsignatura] = useState("");

    const [estudiante, setEstudiante] = useState("");
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [profesor, setProfesor] = useState("");
    const [profesores, setProfesores] = useState<(Coordinador | Profesor)[]>([]);

    const [alumnosError, setAlumnosError] = useState("");
    const [docentesError, setDocentesError] = useState("");

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

            if(data_persona.rol !== "Administrativo"){
                alert("Tienes que ser un administrativo para dar de alta una titulación");

                globalThis.location.href = "/login";
            }
            
            const TFG_asig = Cookie.get("TFG_asig");
            if(TFG_asig === undefined){
                globalThis.location.href = "/paginaPersonal";
            }

            const url_asignatura = `https://tfg-back-end.onrender.com/asignatura?id=${TFG_asig}`;
            const response_asignatura = await fetch(url_asignatura, {
                method: "GET",
            });

            if(response_asignatura.status !== 200){
                const error = await response_asignatura.json();
                alert(error.error);
                globalThis.location.href = "/paginaPersonal";
            }
            
            const data_asig = await response_asignatura.json();

            setIdAsignatura(data_asig.id);
            setNombreAsignatura(data_asig.nombre);

            const date = new Date();
            
            if(date.getMonth() + 1 <= 9){
                setCurso("Curso " + (Number(date.getFullYear())).toString() + "-" + (Number(date.getFullYear()) + 1).toString());
            }
            else{
                setCurso("Curso " + (Number(date.getFullYear()) + 1).toString() + "-" + (Number(date.getFullYear()) + 2).toString());
            }

            const TFG_titulacion = Cookie.get("TFG_titulacion");

            if(TFG_titulacion === undefined){
                alert("No administras ninguna titulación");

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

            const asignatura = data_titulacion.asignaturas.find((asig: Asignatura_Short) => {
                if(asig.id === data_asig.id){
                    return asig;
                }
            });

            if(asignatura === undefined){
                globalThis.location.href = "/paginaPersonal";
            }

            const urlAlumnos = `https://tfg-back-end.onrender.com/personas/alumnos_para_asignatura?titulacion=${TFG_titulacion}&asignatura=${TFG_asig}`;
            const dataAlumnos = await fetch(urlAlumnos,
                {
                    method: "GET",
                }
            );

            if(dataAlumnos.status !== 200){
                const error = await dataAlumnos.json();
                alert(error.error);
                globalThis.location.href = "/paginaPersonal";
            }
            
            const data_alumnos = await dataAlumnos.json();

            if(data.length === 0){
                alert("Hay que tener al menos a un alumno dado de alta");
                globalThis.location.href = "/mostrarTitulaciones";
            }

            setEstudiantes(data_alumnos);

            const urlDocentes = `https://tfg-back-end.onrender.com/personas/docentes?titulacion=${TFG_titulacion}`;
            const dataDocentes = await fetch(urlDocentes,
                {
                    method: "GET",
                }
            );

            if(dataDocentes.status !== 200){
                const error = await dataDocentes.json();
                alert(error.error);
                globalThis.location.href = "/paginaPersonal";
            }
            
            const data_docentes = await dataDocentes.json();

            if(data.length === 0){
                alert("Hay que tener al menos a un docente dado de alta");
                globalThis.location.href = "/mostrarTitulaciones";
            }

            setProfesores(data_docentes);
        }

        getPersonas();
    }, []);
    
    const handleReset = () => {
        setCurso("");
        setAlumnos([]);
        setDocentes([]);

        setEstudiante("");
        setProfesor("");

        setAlumnosError("");
        setDocentesError("");
        
        setButtonAction(false);
    }

    const handleCreation = async () => {
        setButtonAction(true);

        let error_exists = false;

        if(alumnos.length === 0){
            setAlumnosError("Hay que insertar al menos a un alumno");
            error_exists = true;
        }

        if(docentes.length === 0){
            setDocentesError("Hay que insertar al menos a un docente");
            error_exists = true;
        }

        if(error_exists === false){
            const body: Curso_ins = {
                asignatura: idAsignatura,
                curso: curso,
                estudiantes: alumnos,
                profesores: docentes,
            }

            NProgress.start();

            try{
                const url = `https://tfg-back-end.onrender.com/curso`;
                const response = await fetch(url, {
                    method: "POST",
                    body: JSON.stringify(body),
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
                <SidebarAdministrativo/>
                {
                    creationSuccess === false &&
                    <div className="grid_group_Curso">
                        <form className="newCurso">
                            <h1>Registro de un curso</h1>
                            {
                                /*<div className="column">
                                    <label htmlFor="curso">Curso:</label>
                                    <input id="curso" name="curso" defaultValue={cursito} type="number" min={cursito} max={cursito+1} onChange={(e) => {
                                        setCurso("Curso " + (Math.trunc(Number(e.currentTarget.value))).toString() + "-" + (Math.trunc(Number(e.currentTarget.value)) + 1).toString());
                                    }}/>
                                </div>*/
                            }
                            <div className="column">
                                <label htmlFor="docentes">Docentes:</label>
                                <div className="add_data">
                                    <select id="docentes" name="docentes" onChange={(e) => {
                                        setProfesor(e.currentTarget.value);
                                    }}>
                                        <option key="" value="">Selecciona al docente</option>
                                        {
                                            profesores.map((profesor) => {
                                                if(profesor.apellido_2 !== null && profesor.apellido_2 !== undefined && profesor.apellido_2.trim() !== ""){
                                                    return(
                                                        <option key={profesor.id} value={profesor.email}>{profesor.nombre} {profesor.apellido_1} {profesor.apellido_2} ({profesor.email})</option>
                                                    )
                                                }
                                                else{
                                                    return(
                                                        <option key={profesor.id} value={profesor.email}>{profesor.nombre} {profesor.apellido_1} ({profesor.email})</option>
                                                    )
                                                }
                                            })
                                        }
                                    </select>
                                    <button type="button" onClick={() => {
                                        if(profesor.trim() !== ""){
                                            const docente_exists = docentes.find((docente) => {
                                                if(docente === profesor){
                                                    return docente;
                                                }
                                            })

                                            if(docente_exists === undefined){
                                                const docentes_aux = docentes;
                                                docentes_aux.push(profesor);
                                                setDocentes(docentes_aux);
                                                setDocentesError("");
                                            }
                                            else{
                                                alert("Docente ya insertado");
                                            }
                                        }

                                        setProfesor("");
                                    }}>Insertar a la lista</button>
                                    <button type="button" disabled={docentes.length === 0 ? true : false} onClick={() => {
                                        setDocentes([]);
                                    }}>Vaciar Lista</button>
                                </div>
                                <div className="error">{docentesError}</div>
                            </div>
                            <div className="column">
                                <label htmlFor="alumnos">Alumnos:</label>
                                <div className="add_data">
                                    <select id="alumnos" name="alumnos" onChange={(e) => {
                                        setEstudiante(e.currentTarget.value);
                                    }}>
                                        <option key="" value="">Selecciona al alumno</option>
                                        {
                                            estudiantes.map((alumno) => {
                                                if(alumno.apellido_2 !== null && alumno.apellido_2 !== undefined && alumno.apellido_2.trim() !== ""){
                                                    return(
                                                        <option key={alumno.id} value={alumno.email}>{alumno.nombre} {alumno.apellido_1} {alumno.apellido_2} ({alumno.email})</option>
                                                    )
                                                }
                                                else{
                                                    return(
                                                        <option key={alumno.id} value={alumno.email}>{alumno.nombre} {alumno.apellido_1} ({alumno.email})</option>
                                                    )
                                                }
                                            })
                                        }
                                    </select>
                                    <button type="button" onClick={() => {
                                        if(estudiante.trim() !== ""){
                                            const alumno_exists = alumnos.find((alumno) => {
                                                if(alumno === estudiante){
                                                    return alumno;
                                                }
                                            })

                                            if(alumno_exists === undefined){
                                                const alumnos_aux = alumnos;
                                                alumnos_aux.push(estudiante);
                                                setAlumnos(alumnos_aux);
                                                setAlumnosError("");
                                            }
                                            else{
                                                alert("Alumno ya insertado");
                                            }
                                        }

                                        setEstudiante("");
                                    }}>Insertar a la lista</button>
                                    <button type="button" disabled={alumnos.length === 0 ? true : false} onClick={() => {
                                        setAlumnos([]);
                                    }}>Vaciar Lista</button>
                                </div>
                                <div className="error">{alumnosError}</div>
                            </div>
                            <div className="buttons">
                                <button type="button" onClick={() => globalThis.location.href = "/mostrarAsignaturasTitulacion"}>Volver</button>
                                <button type="reset" onClick={handleReset}>Vaciar campos</button>
                                <button type="button" onClick={handleCreation} disabled={buttonAction}>Enviar</button>
                            </div>
                        </form>
                        <div>
                            <h3>Datos del curso:</h3>
                            <div>
                                <p><b>Nombre de la asignatura: </b>{nombreAsignatura}</p>
                            </div>
                            <div>
                                <p><b>Curso academico: </b>{curso}</p>
                            </div>
                            {
                                docentes.length === 1 &&
                                <div>
                                    <p>
                                        <b>Docente: </b>
                                        {
                                            docentes.map((docente) => {
                                                const persona = profesores.find((persona) => {
                                                    if(persona.email === docente){
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
                                docentes.length > 1 &&
                                <div>
                                    <p><b>Docentes:</b></p>
                                    <ul>
                                        {
                                            docentes.map((docente) => {
                                                const persona = profesores.find((persona) => {
                                                    if(persona.email === docente){
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
                                alumnos.length === 1 &&
                                <div>
                                    <p>
                                        <b>Alumno: </b>
                                        {
                                            alumnos.map((alumno) => {
                                                const persona = estudiantes.find((persona) => {
                                                    if(persona.email === alumno){
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
                                alumnos.length > 1 &&
                                <div>
                                    <p><b>Alumnos:</b></p>
                                    <ul>
                                        {
                                            alumnos.map((alumno) => {
                                                const persona = estudiantes.find((persona) => {
                                                    if(persona.email === alumno){
                                                        return persona;
                                                    }
                                                });

                                                if(persona === undefined){
                                                    return;
                                                }
                                                
                                                if(persona.apellido_2 !== null && persona.apellido_2 !== undefined && persona.apellido_2.trim() !== ""){
                                                    return(
                                                        <li key={persona.id}>{persona.nombre} {persona.apellido_1} {persona.apellido_2} ({persona.email})</li>
                                                    )
                                                }
                                                else{
                                                    return(
                                                        <li key={persona.id}>{persona.nombre} {persona.apellido_1} ({persona.email})</li>
                                                    )
                                                }
                                            })
                                        }
                                    </ul>
                                </div>
                            }
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
                            <button type="button" onClick={() => globalThis.location.href = "/mostrarAsignaturasTitulacion"}>Continuar</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default NewCurso;