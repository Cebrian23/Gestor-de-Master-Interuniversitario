import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { Asignatura_curso, Asignatura_Short } from "../types/Asignaturas/Asignatura.ts";
import type { Administrativo_Short } from "../types/Personas/Administrativo.ts";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import Header from "../Header/Header.tsx";

function CursoPage() {
    const [curso, setCurso] = useState<Asignatura_curso>();
    const [showProfesores, setShowProfesores] = useState(false);
    const [showEstudiantes, setShowEstudiantes] = useState(false);

    useEffect(() => {
        const getCurso = async () => {
            const auth = Cookie.get("authTFG");

            if(auth === undefined){
                globalThis.location.href = "/login";
            }

            const url_auth = `https://tfg-back-end.onrender.com/persona/id?id=${auth}`;
            const response_user = await fetch(url_auth, {
                method: "GET",
            });

            if(response_user.status !== 200){
                const error = await response_user.json();
                alert(error.error);

                globalThis.location.href = "/login";
            }

            const data_user = await response_user.json();

            if(data_user.rol !== "Administrativo"){
                globalThis.location.href = "/paginaPersonal";
            }

            const TFG_titulacion = Cookie.get("TFG_titulacion");

            if(TFG_titulacion === undefined){
                globalThis.location.href = "/paginaPersonal";
            }

            const url_titulacion = `https://tfg-back-end.onrender.com/titulacion?id=${TFG_titulacion}`;
            const response_titulacion = await fetch(url_titulacion, {
                method: "GET",
            });

            if(response_titulacion.status !== 200){
                const error = await response_titulacion.json();
                alert(error);

                globalThis.location.href = "/paginaPersonal";
            }

            const data_titulacion = await response_titulacion.json();

            const admin = data_titulacion.administrativos.find((administrativo: Administrativo_Short) => {
                if(administrativo.id === auth){
                    return administrativo;
                }
            });

            if(admin === undefined){
                globalThis.location.href = "/paginaPersonal";
            }

            const TFG_asig = Cookie.get("TFG_asig");

            if(TFG_asig === undefined){
                globalThis.location.href = "/paginaPersonal";
            }

            const url_asig = `https://tfg-back-end.onrender.com/asignatura?id=${TFG_asig}`;
            const response_asig = await fetch(url_asig, {
                method: "GET",
            })

            if(response_asig.status !== 200){
                const error = await response_asig.json();
                alert(error.error);
            
                globalThis.location.href = "/paginaPersonal";
            }
            
            const data_asig = await response_asig.json();
            
            const asignatura_exists = data_titulacion.asignaturas.find((asignatura: Asignatura_Short) => {
                if(asignatura.id === data_asig.id){
                    return asignatura;
                }
            });

            if(asignatura_exists === undefined){
                globalThis.location.href = "/paginaPersonal";
            }

            const TFG_curso = Cookie.get("TFG_curso");

            if(TFG_curso === undefined){
                globalThis.location.href = "/paginaPersonal";
            }

            const curso_exists: Asignatura_curso[] = data_asig.cursos_academicos.map((curso: Asignatura_curso) => {
                if(curso.id === TFG_curso){
                    return curso;
                }
            });

            if(curso_exists === undefined){
                globalThis.location.href = "/paginaPersonal";
            }
            
            setCurso(curso_exists[0]);
        }

        getCurso();
    }, []);

    return(
        <div className="finalPage">
            <Header/>
            <div className="totalPage">    
                <SidebarAdministrativo/>
                {
                    curso !== undefined &&
                    <div className="CursoPage">
                        <h1>Página de {curso.nombre} ({curso.curso_academico})</h1>
                        <div className="CursoPageMenu">
                            <h2>¿Que deseas hacer?</h2>
                            <div className="column">
                                <button type="button" onClick={() => setShowProfesores(!showProfesores)}>{showProfesores === false ? "Mostrar profesores" : "Ocultar profesores"}</button>
                                <button type="button" onClick={() => setShowEstudiantes(!showEstudiantes)}>{showEstudiantes === false ? "Mostrar estudiantes" : "Ocultar estudiantes"}</button>
                                <button type="button" onClick={() => globalThis.location.href = "/mostrarCursos"}>Volver</button>
                            </div>
                        </div>
                        <div className="infoPage">
                            <p><b>Nombre: </b>{curso.nombre}</p>
                            <p><b>Curso académico: </b>{curso.curso_academico}</p>
                            {
                                showProfesores === true && curso.profesores.length === 1 &&
                                <p>
                                    <b>Profesor: </b>
                                    {
                                        curso.profesores.map((docente) => {
                                            if(docente.apellido_2 !== null && docente.apellido_2 !== undefined && docente.apellido_2.trim() !== ""){
                                                return(
                                                    <span key={docente.id}>{docente.nombre} {docente.apellido_1} {docente.apellido_2} ({docente.email})</span>
                                                )
                                            }
                                            else{
                                                return(
                                                    <span key={docente.id}>{docente.nombre} {docente.apellido_1} ({docente.email})</span>
                                                )
                                            }
                                        })
                                    }
                                </p>
                            }
                            {
                                showProfesores === true && curso.profesores.length > 1 &&
                                <>
                                    <p><b>Profesores:</b></p>
                                    <ul>
                                        {
                                            curso.profesores.map((docente) => {
                                                if(docente.apellido_2 !== null && docente.apellido_2 !== undefined && docente.apellido_2.trim() !== ""){
                                                    return(
                                                        <li key={docente.id}>{docente.nombre} {docente.apellido_1} {docente.apellido_2} ({docente.email})</li>
                                                    )
                                                }
                                                else{
                                                    return(
                                                        <li key={docente.id}>{docente.nombre} {docente.apellido_1} ({docente.email})</li>
                                                    )
                                                }
                                            })
                                        }
                                    </ul>
                                </>
                            }
                            {
                                showEstudiantes === true && curso.estudiantes.length === 1 &&
                                <p>
                                    <b>Estudiante: </b>
                                    {
                                        curso.estudiantes.map((alumno) => {
                                            if(alumno.apellido_2 !== null && alumno.apellido_2 !== undefined && alumno.apellido_2.trim() !== ""){
                                                return(
                                                    <span key={alumno.id}>{alumno.nombre} {alumno.apellido_1} {alumno.apellido_2} ({alumno.email})</span>
                                                )
                                            }
                                            else{
                                                return(
                                                    <span key={alumno.id}>{alumno.nombre} {alumno.apellido_1} ({alumno.email})</span>
                                                )
                                            }
                                        })
                                    }
                                </p>
                            }
                            {
                                showEstudiantes === true && curso.estudiantes.length > 1 &&
                                <>
                                    <p><b>Estudiantes:</b></p>
                                    <ul>
                                        {
                                            curso.estudiantes.map((alumno) => {
                                                if(alumno.apellido_2 !== null && alumno.apellido_2 !== undefined && alumno.apellido_2.trim() !== ""){
                                                    return(
                                                        <li key={alumno.id}>{alumno.nombre} {alumno.apellido_1} {alumno.apellido_2} ({alumno.email})</li>
                                                    )
                                                }
                                                else{
                                                    return(
                                                        <li key={alumno.id}>{alumno.nombre} {alumno.apellido_1} ({alumno.email})</li>
                                                    )
                                                }
                                            })
                                        }
                                    </ul>
                                </>
                            }
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default CursoPage;