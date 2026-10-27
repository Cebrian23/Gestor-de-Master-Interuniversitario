import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import type { Administrativo_Short } from "../types/Personas/Administrativo.ts";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import Header from "../Header/Header.tsx";
import type { TFM_Block } from "../types/Asignaturas/TFM.ts";

function TFM_BlockPage() {
    const [bloque, setBloque] = useState<TFM_Block>();
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

            const TFG_TFM_Block = Cookie.get("TFG_TFM_Block");

            if(TFG_TFM_Block === undefined){
                globalThis.location.href = "/paginaPersonal";
            }

            const url_block = `https://tfg-back-end.onrender.com/bloque_TFM?id=${TFG_TFM_Block}`;
            const response_block = await fetch(url_block, {
                method: "GET",
            })

            if(response_block.status !== 200){
                const error = await response_block.json();
                alert(error.error);
            
                globalThis.location.href = "/paginaPersonal";
            }
            
            const data_block = await response_block.json();

            setBloque(data_block);
        }

        getAsignatura();
    }, []);
    
    return(
        <div className="finalPage">
            <Header/>
            <div className="totalPage">
                <SidebarAdministrativo/>
                {
                    bloque !== undefined &&
                    <div className="AsignaturaTitulacionPage">
                        <h1>Página de la asignatura de TFMs</h1>
                        <div className="AsignaturaTitulacionPageMenu">
                            <h2>¿Que deseas hacer?</h2>
                            <div className="column">
                                <button type="button" onClick={() => setShowCursos(!showCursos)}>{showCursos === false ? <>Mostrar cursos académicos</> : <>Ocultar cursos académicos</>}</button>
                                <button type="button" onClick={() => globalThis.location.href = "/mostrarAsignaturasTitulacion"}>Volver</button>
                            </div>
                        </div>
                        <div className="infoPage">
                            <p><b>Titulación: </b>{titulacion}</p>
                            <p><b>Curso: </b>{bloque.curso}</p>
                            <p><b>Créditos: </b>{bloque.creditos} ECTS</p>
                            <p><b>Tipo: </b>{bloque.optatividad}</p>
                            {
                                showCursos === true && bloque.cursos.length === 0 &&
                                <p>
                                    <b>No se ha creado ningún curso para la asignatura</b>
                                </p>
                            }
                            {
                                showCursos === true && bloque.cursos.length === 1 &&
                                <p>
                                    <b>Curso académico: </b>
                                    {
                                        bloque.cursos.map((curso) => {
                                            return(
                                                <span key={curso.id}>{curso.nombre}</span>
                                            )
                                        })
                                    }
                                </p>
                            }
                            {
                                showCursos === true && bloque.cursos.length > 1 &&
                                <>
                                    <p><b>Cursos académicos:</b></p>
                                    <ul>
                                        {
                                            bloque.cursos.map((curso) => {
                                                return(
                                                    <li key={curso.id}>{curso.nombre}</li>
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

export default TFM_BlockPage;