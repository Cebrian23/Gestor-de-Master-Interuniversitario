import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { Asignatura_Short } from "../types/Asignaturas/Asignatura.ts";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import Header from "../Header/Header.tsx";
import type { TFM_Block_Short } from "../types/Asignaturas/TFM.ts";

function ShowAsignaturasTitulacion() {
    const [titulacion, setTitulacion] = useState("");
    const [asignaturas, setAsignaturas] = useState<(Asignatura_Short | TFM_Block_Short)[]>([]);

    useEffect(() => {
        const getAsignaturas = async () => {
            Cookie.remove("TFG_asig");
            Cookie.remove("TFG_curso");
            Cookie.remove("TFG_TFM_Block");

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
                alert("Tienes que ser un administrativo para ver estos datos");

                globalThis.location.href = "/login";
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
            
            const data = await response_titulacion.json();
            
            setTitulacion(data.nombre);

            const asigs: (Asignatura_Short | TFM_Block_Short)[] = [];
            data.asignaturas.forEach((asig: Asignatura_Short) => {
                asigs.push(asig);
            });
            asigs.push(data.TFM);
            setAsignaturas(asigs);
        }

        getAsignaturas();

    }, []);

    return(
        <div className="finalPage">
            <Header/>
            <div className="totalPage">
                <SidebarAdministrativo/>
                <div className="showAsigsTitulacion">
                    {
                        titulacion.trim() !== "" &&
                        <h1>Asignaturas de {titulacion}</h1>
                    }
                    {
                        titulacion.trim() === "" &&
                        <h1></h1>
                    }
                    <div>
                        {
                            asignaturas.length !== 0 &&
                            <div className={asignaturas.length >= 2 ? "grid_asigs_titulacion2" : "grid_asigs_titulacion1"}>
                                {
                                    asignaturas.map((asig) => {
                                        return(
                                            <div key={asig.id} className="cards">
                                                {
                                                    asig.tipo === "Asignatura" &&
                                                    <div className="data">{asig.nombre} ({asig.curso}, {asig.creditos} ECTS)</div>
                                                }
                                                {
                                                    asig.tipo === "Bloque TFMs" &&
                                                    <div className="data">Trabajos Fin de Master ({asig.curso}, {asig.creditos} ECTS)</div>
                                                }
                                                <div className="buttons">
                                                    <button
                                                        type="button"
                                                        disabled={((asig.tipo === "Asignatura" && asig.cursos_academicos > 0) || (asig.tipo === "Bloque TFMs" && asig.cursos > 0)) ? false : true}
                                                        onClick={() => {
                                                            if(asig.tipo === "Asignatura"){
                                                                Cookie.set("TFG_asig", asig.id, {expires: 7});
                                                                
                                                                globalThis.location.href = "/mostrarCursos";
                                                            }
                                                            else{
                                                                Cookie.set("TFG_TFM_Block", asig.id, {expires: 7});
                                                                
                                                                globalThis.location.href = "/mostrarCursosTFM";
                                                            }
                                                        }}
                                                    >Ver cursos académicos</button>
                                                    <button type="button" onClick={() => {
                                                        if(asig.tipo === "Asignatura"){
                                                            Cookie.set("TFG_asig", asig.id, {expires: 7});

                                                            globalThis.location.href = "/nuevoCurso";
                                                        }
                                                        else{
                                                            Cookie.set("TFG_TFM_Block", asig.id, {expires: 7});

                                                            globalThis.location.href = "/nuevoCursoTFM";
                                                        }
                                                    }}>Insertar un nuevo curso académico</button>
                                                    <button type="button" onClick={() => {
                                                        if(asig.tipo === "Asignatura"){
                                                            Cookie.set("TFG_asig", asig.id, {expires: 7});

                                                            globalThis.location.href = "/paginaAsignaturaTitulacion";
                                                        }
                                                        else{
                                                            Cookie.set("TFG_TFM_Block", asig.id, {expires: 7});

                                                            globalThis.location.href = "/paginaBlockTFMTitulacion";
                                                        }
                                                    }}>Ver asignatura</button>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        }
                        {
                            asignaturas.length === 0 &&
                            <h2>La titulacion no tiene asignaturas</h2>
                        }
                    </div>
                    <button type="button" onClick={() => globalThis.location.href = "/mostrarTitulaciones"}>Volver</button>
                </div>
            </div>
        </div>
    );
}

export default ShowAsignaturasTitulacion;