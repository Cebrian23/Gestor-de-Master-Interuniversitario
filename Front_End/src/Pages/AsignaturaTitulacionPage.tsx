import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import type { Asignatura, Asignatura_Short } from "../types/Asignaturas/Asignatura.ts";
import type { Administrativo_Short } from "../types/Personas/Administrativo.ts";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import Header from "../Header/Header.tsx";

function AsignaturaTitulacionPage() {
    const [asignatura, setAsignatura] = useState<Asignatura>();
    const [titulacion, setTitulacion] = useState("");
    const [showCursos, setShowCursos] = useState(false);
    
    useEffect(() => {
        const getAsignatura = async () => {
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
            setTitulacion(data_titulacion.nombre)

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

            setAsignatura(data_asig);
        }

        getAsignatura();
    }, []);
    
    return(
        <div className="finalPage">
            <Header/>
            <div className="totalPage">
                <SidebarAdministrativo/>
                {
                    asignatura !== undefined &&
                    <div className="AsignaturaTitulacionPage">
                        <h1>Página de {asignatura.nombre}</h1>
                        <div className="AsignaturaTitulacionPageMenu">
                            <h2>¿Que deseas hacer?</h2>
                            <div className="column">
                                <button type="button" onClick={() => setShowCursos(!showCursos)}>{showCursos === false ? <>Mostrar cursos académicos</> : <>Ocultar cursos académicos</>}</button>
                                <button type="button" onClick={() => globalThis.location.href = "/mostrarAsignaturasTitulacion"}>Volver</button>
                            </div>
                        </div>
                        <div className="infoPage">
                            <p><b>Nombre: </b>{asignatura.nombre}</p>
                            <p><b>Titulación: </b>{titulacion}</p>
                            <p><b>Curso: </b>{asignatura.curso}</p>
                            <p><b>Créditos: </b>{asignatura.creditos} ECTS</p>
                            <p><b>Tipo: </b>{asignatura.optatividad}</p>
                            {
                                showCursos === true && asignatura.cursos_academicos.length === 0 &&
                                <p>
                                    <b>No se ha creado ningún curso para {asignatura.nombre.toLowerCase()}</b>
                                </p>
                            }
                            {
                                showCursos === true && asignatura.cursos_academicos.length === 1 &&
                                <p>
                                    <b>Curso académico: </b>
                                    {
                                        asignatura.cursos_academicos.map((curso) => {
                                            return(
                                                <span key={curso.id}>{curso.curso_academico}</span>
                                            )
                                        })
                                    }
                                </p>
                            }
                            {
                                showCursos === true && asignatura.cursos_academicos.length > 1 &&
                                <>
                                    <p><b>Cursos académicos:</b></p>
                                    <ul>
                                        {
                                            asignatura.cursos_academicos.map((curso) => {
                                                return(
                                                    <li key={curso.id}>{curso.curso_academico}</li>
                                                )
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

export default AsignaturaTitulacionPage;