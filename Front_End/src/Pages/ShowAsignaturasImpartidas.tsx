import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { Asignatura_curso_short, Asignatura_curso_docs_short, Asignatura_Short } from "../types/Asignaturas/Asignatura.ts";
import type { Coordinador_Short } from "../types/Personas/Coordinador.ts";
import type { Profesor_Short } from "../types/Personas/Profesor.ts";
import SidebarCoordinador from "../Sidebar/SidebarCoordinador.tsx";
import SidebarProfesor from "../Sidebar/SidebarProfesor.tsx";
import Header from "../Header/Header.tsx";

function ShowAsignaturasImpartidas() {
    const [asignaturas, setAsignaturas] = useState<Asignatura_curso_short[]>([]);

    const [userRol, setRol] = useState("");

    useEffect(() => {
        const getAsignaturas = async () => {
            Cookie.remove("TFG_asig");
            Cookie.remove("TFG_curso");
            Cookie.remove("TFG_conv");

            const auth = Cookie.get("authTFG");
            if(auth === undefined){
                globalThis.location.href = "/login";
            }
            
            const url_user = `https://tfg-back-end.onrender.com/persona/id?id=${auth}`;
            const response_user = await fetch(url_user, {
                method: "GET",
            });

            if(response_user.status !== 200){
                const error = await response_user.json();
                alert(error.error);

                globalThis.location.href = "/login";
            }

            const data_user = await response_user.json();

            setRol(data_user.rol);

            const TFG_Titulacion = Cookie.get("TFG_titulacion");

            if(TFG_Titulacion === undefined){
                if(data_user.rol === "Profesor"){
                    alert("No das clase en ninguna titulación");
                }
                else if(data_user.rol === "Coordinador" || data_user.rol === "Coordinador general"){
                    alert("No coordinas ninguna titulación");
                }

                globalThis.location.href = "/paginaPersonal";
            }

            const url_titulacion = `https://tfg-back-end.onrender.com/titulacion?id=${TFG_Titulacion}`;
            const response_titulacion = await fetch(url_titulacion, {
                method: "GET",
            });

            if(response_titulacion.status !== 200){
                const error = await response_titulacion.json();
                alert(error.error);

                globalThis.location.href = "/paginaPersonal";
            }

            const data_titulacion = await response_titulacion.json();

            const docente_exists: (Profesor_Short | Coordinador_Short | undefined) = data_titulacion.docentes.find((docente: (Profesor_Short | Coordinador_Short)) => {
                if(docente.id === auth){
                    return docente;
                }
            });

            if(docente_exists === undefined){
                alert("No das clase en esta titulación");

                globalThis.location.href = "/paginaPersonal";
            }

            const url_asig = `https://tfg-back-end.onrender.com/docente/asignaturas?docente=${auth}&titulacion=${TFG_Titulacion}`;
            const response_asig = await fetch(url_asig, {
                method: "GET",
            });

            if(response_asig.status !== 200){
                const error = await response_asig.json();
                alert(error.error);

                globalThis.location.href = "/paginaPersonal";
            }

            const data_asig = await response_asig.json();

            let count_asig = 0;
            data_asig.forEach((curs: Asignatura_curso_docs_short) => {
                data_titulacion.asignaturas.forEach((asig: Asignatura_Short) => {
                    if(asig.id === curs.id_asig){
                        count_asig += 1;
                    }
                });
            });

            if(data_asig.length !== count_asig){
                alert(`${data_asig.length - count_asig} asignaturas no encontradas`);

                globalThis.location.href = "/paginaPersonal";
            }

            let count_doc = 0;
            data_asig.forEach((asig: Asignatura_curso_docs_short) => {
                asig.profesores.forEach((prof) => {
                    if(prof.id === auth){
                        count_doc += 1;
                    }
                });
            });

            if(data_asig.length !== count_doc){
                alert(`No apareces como docente en ${data_asig.length !== count_doc} asignaturas`);

                globalThis.location.href = "/paginaPersonal";
            }
            
            setAsignaturas(data_asig);
        }

        getAsignaturas();
    }, []);

    return(
        <div className="finalPage">
            <Header/>
            <div className="totalPage">
                {
                    (userRol === "Coordinador" || userRol === "Coordinador general") &&
                    <SidebarCoordinador/>
                }
                {
                    userRol === "Profesor" &&
                    <SidebarProfesor/>
                }
                <div className="showAsigsDocente">
                    <h1>Asignaturas impartidas</h1>
                    {
                        asignaturas.length === 0 &&
                        <h2>No impartes ninguna asignatura</h2>
                    }
                    {
                        asignaturas.length > 0 &&
                        <div className={asignaturas.length >= 2 ? "grid_asigs_docente2" : "grid_asigs_docente1"}>
                            {
                                asignaturas.map((asig) => {
                                    return(
                                        <div key={asig.id} className="cards">
                                            <div className="data">{asig.nombre}</div>
                                            <div className="data">{asig.curso_academico}</div>
                                            <div className="buttons">
                                                <button type="button" onClick={() => {
                                                    Cookie.set("TFG_curso", asig.id, {expires: 7});
                                                    Cookie.set("TFG_asig", asig.id_asig, {expires: 7});

                                                    globalThis.location.href = "/paginaAsignatura"
                                                }}>Ver asignatura</button>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    }
                    <button type="button" onClick={() => globalThis.location.href = "/paginaPersonal"}>Volver</button>
                </div>
            </div>
        </div>
    );
}

export default ShowAsignaturasImpartidas;