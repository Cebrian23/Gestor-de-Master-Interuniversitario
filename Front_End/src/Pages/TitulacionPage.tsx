import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { Administrativo_Short } from "../types/Personas/Administrativo.ts";
import type { Titulacion } from "../types/Titulacion/Titulacion.ts";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import Header from "../Header/Header.tsx";

function TitulacionPage() {
    const [titulacion, setTitulacion] = useState<Titulacion>();
    const [showUnis, setShowUnis] = useState(false);
    const [showGrados, setShowGrados] = useState(false);
    const [showAsigs, setShowAsigs] = useState(false);
    const [showTFM, setShowTFM] = useState(false);

    useEffect(() => {
        const getTitulacion = async () => {
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

            setTitulacion(data_titulacion);
        }

        getTitulacion();
    }, []);

    return(
        <div className="finalPage">
            <Header/>
            <div className="totalPage">
                <SidebarAdministrativo/>
                {
                    titulacion !== undefined &&
                    <div className="TitulacionPage">
                        <h1>Página de {titulacion.nombre}</h1>
                        <div className="TitulacionPageMenu">
                            <h2>¿Que deseas hacer?</h2>
                            <div className="column">
                                <button type="button" onClick={() => setShowUnis(!showUnis)}>{showUnis === false ? <>Mostrar universidades involucradas</> : <>Ocultar universidades involucradas</>}</button>
                                <button type="button" onClick={() => setShowGrados(!showGrados)}>{showGrados === false ? <>Mostrar cursos requeridos</> : <>Ocultar cursos requeridos</>}</button>
                                <button type="button" onClick={() => setShowAsigs(!showAsigs)}>{showAsigs === false ? <>Mostrar asignaturas</> : <>Ocultar asignaturas</>}</button>
                                <button type="button" onClick={() => setShowTFM(!showTFM)}>{showTFM === false ? <>Mostrar datos del TFM</> : <>Ocultar datos del TFM</>}</button>
                                <button type="button" onClick={() => globalThis.location.href = "/mostrarTitulaciones"}>Volver</button>
                            </div>
                        </div>
                        <div className="infoPage">
                            <p><b>Nombre de la titulación: </b>{titulacion.nombre}</p>
                            {
                                showUnis === true && titulacion.universidades.length === 1 &&
                                <p>
                                    <b>Universidad involucrada: </b>
                                    {
                                        titulacion.universidades.map((uni) => {
                                            return(
                                                <span key={uni.nombre}>{uni.nombre}</span>
                                            )
                                        })
                                    }
                                </p>
                            }
                            {
                                showUnis === true && titulacion.universidades.length > 1 &&
                                <>
                                    <p><b>Universidades involucradas:</b></p>
                                    <ul>
                                        {
                                            titulacion.universidades.map((uni) => {
                                                return(
                                                    <li key={uni.nombre}>{uni.nombre}</li>
                                                )
                                            })
                                        }
                                    </ul>
                                </>
                            }
                            {
                                showGrados === true && titulacion.grados_aptos.length === 1 &&
                                <p>
                                    <b>Grado requerido para optar a la titulación: </b>
                                    {
                                        titulacion.grados_aptos.map((grado) => {
                                            return(
                                                <span key={grado}>{grado}</span>
                                            )
                                        })
                                    }
                                </p>
                            }
                            {
                                showGrados === true && titulacion.grados_aptos.length > 1 &&
                                <>
                                    <p><b>Grados requeridos para optar a la titulación: </b></p>
                                    <ul>
                                        {
                                            titulacion.grados_aptos.map((grado) => {
                                                return(
                                                    <li key={grado}>{grado}</li>
                                                )
                                            })
                                        }
                                    </ul>
                                </>
                            } 
                            {
                                showAsigs === true && titulacion.asignaturas.length === 1 &&
                                <p>
                                    <b>Asignatura: </b>
                                    {
                                        titulacion.asignaturas.map((asig) => {
                                            return(
                                                <span key={asig.id}>{asig.nombre} ({asig.curso}, {asig.creditos} ECTS, {asig.optatividad})</span>
                                            )
                                        })
                                    }
                                </p>
                            }
                            {
                                showAsigs === true && titulacion.asignaturas.length > 1 &&
                                <>
                                    <p><b>Asignaturas:</b></p>
                                    <ul>
                                        {
                                            titulacion.asignaturas.map((asig) => {
                                                return(
                                                    <li key={asig.id}>{asig.nombre} ({asig.curso}, {asig.creditos} ECTS, {asig.optatividad})</li>
                                                )
                                            })
                                        }
                                    </ul>
                                </>
                            }
                            {
                                showTFM === true &&
                                <>
                                    <p><b>Datos del TFM:</b></p>
                                    <ul>
                                        <li>Curso: {titulacion.TFM.curso}</li>
                                        <li>Créditos: {titulacion.TFM.creditos} ECTS</li>
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

export default TitulacionPage;