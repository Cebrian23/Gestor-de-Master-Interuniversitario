import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import Header from "../Header/Header.tsx";
import type { TFM_Block_Curso } from "../types/Asignaturas/TFM.ts";

function ShowCursosTFM() {
    const [asignatura, setAsignatura] = useState("");
    const [cursos, setCursos] = useState<TFM_Block_Curso[]>()

    useEffect(() => {
        const getCursos = async () => {
            Cookie.remove("TFG_cursoTFM");
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

            const id_titulacion = Cookie.get("TFG_titulacion");

            if(id_titulacion === undefined){
                alert("No administras ninguna titulación");

                globalThis.location.href = "/paginaPersonal";
            }

            const url_titulacion = `https://tfg-back-end.onrender.com/titulacion?id=${id_titulacion}`;
            const response_titulacion = await fetch(url_titulacion, {
                method: "GET",
            });

            if(response_titulacion.status !== 200){
                const error = await response_titulacion.json();
                alert(error.error);
                globalThis.location.href = "/paginaPersonal";
            }
            
            const data_titulacion = await response_titulacion.json();

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

            const data_TFM_Block = await response_TFM_Block.json();
            setAsignatura("TFMs");
            setCursos(data_TFM_Block.cursos);
        }

        getCursos();
    }, []);

    return(
        <div className="finalPage">
            <Header/>
            <div className="totalPage">
                <SidebarAdministrativo/>
                <div className="showCursos">
                    {
                        asignatura !== "" &&
                        <h1>Cursos de la asignatura de TFMs</h1>
                    }
                    {
                        asignatura === "" &&
                        <h1></h1>
                    }
                    <div>
                        {
                            cursos !== undefined && cursos.length > 0 &&
                            <div className={cursos.length >= 3 ? "grid_cursosTFM2" : "grid_cursosTFM1"}>
                                {
                                    cursos.map((curso) => {
                                        return(
                                            <div key={curso.id} className="cards">
                                                <div className="data">{curso.nombre}</div>
                                                <div className="buttons">
                                                    <button type="button" onClick={() => {
                                                        Cookie.set("TFG_cursoTFM", curso.id, {expires: 7});
                                                        globalThis.location.href = "/paginaCursoTFM";
                                                    }}>Ver Curso</button>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        }
                        {
                            cursos !== undefined && cursos.length === 0 &&
                            <h2>La asignatura no tiene cursos creados</h2>
                        }
                    </div>
                    <button type="button" onClick={() => globalThis.location.href = "/mostrarAsignaturasTitulacion"}>Volver</button>
                </div>
            </div>
        </div>
    );
}

export default ShowCursosTFM;