import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import type { Administrativo } from "../types/Personas/Administrativo.ts";
import type { Coordinador } from "../types/Personas/Coordinador.ts";
import type { Estudiante } from "../types/Personas/Estudiante.ts";
import type { Profesor } from "../types/Personas/Profesor.ts";
import Header from "../Header/Header.tsx";

function UserPage() {
    const [user, setUser] = useState<(Coordinador | Estudiante | Profesor | Administrativo)>();
    const [noAdmin, setNoAdmin] = useState(false);
    const [noAsig, setNoAsig] = useState(false);

    const [logoutSuccess, setLogoutSuccess] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            Cookie.remove("TFG_asig");
            Cookie.remove("TFG_curso");
            Cookie.remove("TFG_conv");
            Cookie.remove("TFG_titulacion");
            Cookie.remove("TFG_TFM");
            Cookie.remove("TFG_TFM_Block");
            Cookie.remove("TFG_cursoTFM");

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
                handleLogout()

                globalThis.location.href = "/login";
            }

            const data_user = await response_user.json();

            if(data_user.rol === "Administrativo"){
                const url_titulacion = `https://tfg-back-end.onrender.com/administrativo/titulaciones?admin=${auth}`;
                const response_titulacion = await fetch(url_titulacion, {
                    method: "GET",
                });

                if(response_titulacion.status !== 200){
                    const error = await response_titulacion.json();
                    alert(error.error);
                    globalThis.location.href = "/login";
                }

                const data = await response_titulacion.json();

                if(data.length === 0){
                    globalThis.location.href = "/nuevaTitulacion";
                }
                else if(data.length != 0){
                    setNoAdmin(true);
                }
            }
            else{
                const url_titulacion = `https://tfg-back-end.onrender.com/docente/titulaciones?docente=${auth}`;
                const response_titulacion = await fetch(url_titulacion, {
                    method: "GET",
                });

                if(response_titulacion.status !== 200){
                    const error = await response_titulacion.json();
                    alert(error.error);
                    globalThis.location.href = "/login";
                }

                const data = await response_titulacion.json();

                if(data.length === 0){
                    globalThis.location.href = "/nuevaTitulacion";
                }
                else if(data.length !== 0){
                    Cookie.set("TFG_titulacion", data[0].id, {expires: 7});
                    setNoAsig(true);
                }
            }

            setUser(data_user);
        }

        getUser();
    },[]);

    const handleLogout = () => {
        Cookie.remove("authTFG");
        Cookie.remove("TFG_titulacion");
        Cookie.remove("TFG_asig");
        Cookie.remove("TFG_curso");
        Cookie.remove("TFG_conv");
        Cookie.remove("TFG_TFM");
        Cookie.remove("TFG_TFM_Block");
        Cookie.remove("TFG_cursoTFM");

        setLogoutSuccess(true);
    }

    return(
        <div className="finalPage">
            <Header/>
            <div className="userPageShow">
                {
                    user !== undefined && logoutSuccess === false &&
                    <div className="userPage">
                        {
                            (user.apellido_2 !== undefined && user.apellido_2 !== null && user.apellido_2 !== "") &&
                            <h1>Bienvenido, {user.nombre} {user.apellido_1} {user.apellido_2}</h1>
                        }
                        {
                            (user.apellido_2 === undefined || user.apellido_2 === null || user.apellido_2 === "") &&
                            <h1>Bienvenido, {user.nombre} {user.apellido_1}</h1>
                        }
                        <form>
                            <h2>¿Que deseas hacer?</h2>
                            <div className="columns">
                                {
                                user.rol === "Administrativo" &&
                                    <>
                                        <button type="button" disabled={!noAdmin} onClick={() => globalThis.location.href = "/mostrarTitulaciones"}>Ver titulaciones administradas</button>
                                        <br/>
                                    </>
                                }
                                {
                                    (user.rol === "Coordinador" || user.rol === "Coordinador general" || user.rol === "Profesor") && noAsig === true &&
                                    <>
                                        <button type="button" onClick={() => globalThis.location.href = "/mostrarAsignaturas"}>Ver asignaturas impartidas</button>
                                        <br/>
                                    </>
                                }
                                {
                                    (user.rol === "Coordinador" || user.rol === "Coordinador general") &&
                                    <>
                                        <button type="button" onClick={() => globalThis.location.href = "/nuevoTFM"}>Calificar TFM de un alumno</button>
                                        <br/>
                                    </>
                                }
                                {
                                    (user.rol === "Coordinador" || user.rol === "Coordinador general") &&
                                    <>
                                        <button type="button" onClick={() => globalThis.location.href = "/controlCalidad"}>Ver métricas de calidad</button>
                                        <br/>
                                        <button type="button" onClick={() => globalThis.location.href = "/mostrarNotasAlumnosUni"}>Ver notas de alumnos de mi universidad</button>
                                        <br/>
                                    </>
                                }
                                <button type="button" onClick={() => globalThis.location.href = "/actualizarDatosPersonales"}>Actualizar información personal</button>
                                <br/>
                                <button type="button" onClick={handleLogout}>Cerrar sesion</button>
                            </div>
                        </form>
                    </div>
                }
                {
                    logoutSuccess === true &&
                    <div className="logout_response">
                        <div className="column">
                            <h1>Sesión exitosamente cerrada</h1>
                        </div>
                        <div className="buttons">
                            <button type="button" onClick={() =>  globalThis.location.href = "/login"}>Continuar</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default UserPage;