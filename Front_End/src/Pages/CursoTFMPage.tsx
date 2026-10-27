import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { Administrativo_Short } from "../types/Personas/Administrativo.ts";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import Header from "../Header/Header.tsx";
import type { TFM_Block_Curso } from "../types/Asignaturas/TFM.ts";

function CursoTFMPage() {
    const [curso, setCurso] = useState<TFM_Block_Curso>();
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

            const TFG_TFM_Block = Cookie.get("TFG_TFM_Block");

            if(TFG_TFM_Block === undefined){
                alert("No has seleccionado el bloque de TFMs");

                globalThis.location.href = "/mostrarAsignaturasTitulacion";
            }

            if(data_titulacion.TFM.id !== TFG_TFM_Block){
                alert("Bloque de TFMs no encontrada en la titulación");

                globalThis.location.href = "/mostrarTitulaciones";
            }

            const url_TFM_Block = `https://tfg-back-end.onrender.com/bloque_TFM?bloque=${TFG_TFM_Block}`
            const response_TFM_Block = await fetch(url_TFM_Block, {
                method: "GET",
            });

            if(response_TFM_Block.status !== 200){
                const error = await response_TFM_Block.json();
                alert(error.error);

                globalThis.location.href = "/mostrarAsignaturasTitulacion";
            }
            
            const TFG_cursoTFM = Cookie.get("TFG_cursoTFM");

            if(TFG_cursoTFM === undefined){
                globalThis.location.href = "/mostrarAsignaturasTitulacion";
            }

            const url_cursoTFM = `https://tfg-back-end.onrender.com/bloque_TFM/curso?bloque=${TFG_TFM_Block}&curso=${TFG_cursoTFM}`
            const response_cursoTFM = await fetch(url_cursoTFM, {
                method: "GET",
            });

            if(response_cursoTFM.status !== 200){
                const error = await response_cursoTFM.json();
                alert(error.error);

                globalThis.location.href = "/mostrarAsignaturasTitulacion";
            }

            const data = await response_cursoTFM.json();
            setCurso(data);
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
                        <h1>Página de Trabajos Fin de Grado ({curso.nombre})</h1>
                        <div className="CursoPageMenu">
                            <h2>¿Que deseas hacer?</h2>
                            <div className="column">
                                <button type="button" onClick={() => setShowEstudiantes(!showEstudiantes)}>{showEstudiantes === false ? "Mostrar estudiantes" : "Ocultar estudiantes"}</button>
                                <button type="button" onClick={() => globalThis.location.href = "/mostrarCursos"}>Volver</button>
                            </div>
                        </div>
                        <div className="infoPage">
                            <p><b>Nombre: </b>Trabajos Fin de Grado</p>
                            <p><b>Curso académico: </b>{curso.nombre}</p>
                            {
                                showEstudiantes === true && curso.alumnos.length === 1 &&
                                <>
                                    <p>
                                        <b>Estudiante: </b>
                                        {
                                            curso.alumnos.map((alumno) => {
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
                                </>
                            }
                            {
                                showEstudiantes === true && curso.alumnos.length > 1 &&
                                <>
                                    <p><b>Estudiantes:</b></p>
                                    <ul>
                                        {
                                            curso.alumnos.map((alumno) => {
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

export default CursoTFMPage;