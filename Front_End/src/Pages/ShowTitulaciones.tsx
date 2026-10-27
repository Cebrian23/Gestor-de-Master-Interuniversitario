import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import './Pages.css'
import type { Titulacion } from "../types/Titulacion/Titulacion.ts";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import Header from "../Header/Header.tsx";

function ShowTitulaciones() {
    const [titulaciones, setTitulaciones] = useState<Titulacion[]>([]);

    useEffect(() => {
        const getTitulaciones = async () => {
            Cookie.remove("TFG_asig");
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

            setTitulaciones(data_persona.titulaciones);

            /*const id_titulacion = Cookie.get("TFG_titulacion");

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
            else{
                const data = await response_titulacion.json();
                const titulaciones: Titulacion[] = [];
                titulaciones.push(data);
                setTitulaciones(titulaciones);
            }*/
        }

        getTitulaciones();
    }, []);

    const handleCreateTitulacionCookie = (id: string) => {
        Cookie.set("TFG_titulacion", id, {expires: 7});
    }

    return(
        <div className="finalPage">
            <Header/>
            <div className="totalPage">
                <SidebarAdministrativo/>
                <div className="showTitulaciones">
                    <h1>Titulaciones administradas:</h1>
                    <div>
                        {
                            titulaciones !== undefined && titulaciones.length > 0 &&
                            <div className={titulaciones.length >= 2 ? "grid_titulaciones2" : "grid_titulaciones1"}>
                                {
                                    titulaciones.map((titulacion) => {
                                        return(
                                            <div key={titulacion.id} className="cards">
                                                <div className="data">{titulacion.nombre}</div>
                                                <div className="buttons">
                                                    <button type="button" onClick={() => {
                                                        handleCreateTitulacionCookie(titulacion.id);
                                                        globalThis.location.href = "/mostrarAsignaturasTitulacion";
                                                    }}>Ver asignaturas</button>
                                                    <button type="button" onClick={() => {
                                                        handleCreateTitulacionCookie(titulacion.id);
                                                        globalThis.location.href = "/nuevaAsignatura";
                                                    }}>Insertar una asignatura nueva</button>
                                                    <button type="button" onClick={() => {
                                                        handleCreateTitulacionCookie(titulacion.id);
                                                        globalThis.location.href = "/registrarPersona";
                                                    }}>Dar de alta a personas</button>
                                                    <button type="button" onClick={() => {
                                                        handleCreateTitulacionCookie(titulacion.id);
                                                        globalThis.location.href = "/paginaTitulacion";
                                                    }}>Ver titulación</button>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        }
                    </div>
                    <button type="button" onClick={() => globalThis.location.href = "/paginaPersonal"}>Volver</button>
                </div>
            </div>
        </div>
    );
}

export default ShowTitulaciones;