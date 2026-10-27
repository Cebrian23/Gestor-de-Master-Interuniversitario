import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { Asignatura_curso, Asignatura } from "../types/Asignaturas/Asignatura.ts";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import Header from "../Header/Header.tsx";

function ShowCursos() {
    const [asignatura, setAsignatura] = useState("");
    const [cursos, setCursos] = useState<Asignatura_curso[]>()

    useEffect(() => {
        const getCursos = async () => {
            Cookie.remove("TFG_curso");
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

            const TFG_asig = Cookie.get("TFG_asig");

            if(TFG_asig === undefined){
                alert("No has seleccionado la asignatura");

                globalThis.location.href = "/mostrarAsignaturasTitulacion";
            }

            const asignatura_exists: Asignatura | undefined = data_titulacion.asignaturas.find((asig: Asignatura) => {
                if(asig.id.toString() === TFG_asig){
                    return asig
                }
            });

            if(asignatura_exists === undefined){
                alert("Asignatura no encontrada en la titulación");

                globalThis.location.href = "/mostrarTitulaciones";
            }

            const url_asignatura = `https://tfg-back-end.onrender.com/asignatura?id=${TFG_asig}`
            const response_asignatura = await fetch(url_asignatura, {
                method: "GET",
            });

            if(response_asignatura.status !== 200){
                const error = await response_asignatura.json();
                alert(error.error);

                globalThis.location.href = "/mostrarAsignaturasTitulacion";
            }

            const data_asignatura = await response_asignatura.json();
            setAsignatura(data_asignatura.nombre);
            setCursos(data_asignatura.cursos_academicos);
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
                        <h1>Cursos de {asignatura}</h1>
                    }
                    {
                        asignatura === "" &&
                        <h1></h1>
                    }
                    <div>
                        {
                            cursos !== undefined && cursos.length > 0 &&
                            <div className={cursos.length >= 3 ? "grid_cursos2" : "grid_cursos1"}>
                                {
                                    cursos.map((curso) => {
                                        return(
                                            <div key={curso.id} className="cards">
                                                <div className="data">{curso.curso_academico}</div>
                                                <div className="buttons">
                                                    <button type="button" onClick={() => {
                                                        Cookie.set("TFG_curso", curso.id, {expires: 7});
                                                        globalThis.location.href = "/paginaCurso";
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

export default ShowCursos;