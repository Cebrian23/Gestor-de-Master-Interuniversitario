import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { Asignatura_ins } from "../types/Asignaturas/Asignatura.ts";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import Header from "../Header/Header.tsx";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

function NewAsignatura() {
    const [nombre, setNombre] = useState("");
    const [titulacion, setTitulacion] = useState("");
    const [creditos, setCreditos] = useState(4);
    const [curso, setCurso] = useState("1º");
    const [optatividad, setOptatividad] = useState("Obligatoria");
    
    const [cursos_str, setCursosStr] = useState<string[]>([]);

    const [nombreError, setNombreError] = useState("");

    const [buttonAction, setButtonAction] = useState(false);
    const [creationSuccess, setCreationSuccess] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const getCursos = async () => {
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
                alert("Tienes que ser un administrativo para dar de alta una asignatura");

                globalThis.location.href = "/login";
            }

            const id_titulacion = Cookie.get("TFG_titulacion");

            if(id_titulacion === undefined){
                globalThis.location.href = "/paginaPersonal"
            }

            const url = `https://tfg-back-end.onrender.com/titulacion/cursos?id=${id_titulacion}`;
            const response = await fetch(url, {
                method: "GET",
            });

            if(response.status !== 200){
                const error = await response.json();
                alert(error.error);
                globalThis.location.href = "/paginaPersonal";
            }

            const data = await response.json();
            const cursos = data.cursos;
            
            setTitulacion(id_titulacion!);
            
            let count = 1;
            const new_Cursos: string[] = [];

            while(count <= cursos){
                new_Cursos.push(`${count}º`);

                count += 1;
            }
            
            setCursosStr(new_Cursos);
        }

        getCursos();
    }, []);

    const handleReset = () => {
        setNombre("");
        setCreditos(4);
        setCurso("1º");

        setNombreError("");
        
        setButtonAction(false);
    }

    const handleCreation = async () => {
        setButtonAction(true);

        let error_exists = false;

        if(nombre.trim() === ""){
            setNombreError("Hay que llenar este campo");
            error_exists = true;
        }

        if(error_exists === false){
            const data: Asignatura_ins = {
                nombre: nombre,
                titulacion: titulacion,
                curso: curso,
                creditos: creditos,
                optatividad: optatividad,
            }

            NProgress.start();

            try{
                const url = `https://tfg-back-end.onrender.com/asignatura`;
                const response = await fetch(url, {
                    method: "POST",
                    body: JSON.stringify(data),
                });

                if(response.status !== 200){
                    const error = await response.json();

                    alert(error.error);
                    
                    setButtonAction(false);
                }
                else{
                    const data = await response.json();
                    
                    setMessage(data.message);
                    setCreationSuccess(true);
                }
            }
            finally{
                NProgress.done();
            }
        }
        else{
            alert("Falta rellenar algún campo");
            setButtonAction(false);
        }
    }
    
    return(
        <div className="finalPage">
            <Header/>
            <div className="totalPage">
                <SidebarAdministrativo/>
                {
                    creationSuccess === false &&
                    <div className="newAsig">
                        <form className="newAsignatura">
                            <h1>Registro de asignatura</h1>
                            <div className="column">
                                <label htmlFor="nombre">Nombre:</label>
                                <input id="nombre" name="nombre" value={nombre} placeholder="Nombre" onChange={(e) => {
                                    setNombre(e.currentTarget.value);
                                    setNombreError("");
                                }}/>
                                <div className="error">{nombreError}</div>
                            </div>
                            <div className="column">
                                <label htmlFor="creditos">Créditos:</label>
                                <input
                                    id="creditos"
                                    name="creditos"
                                    type="number"
                                    value={creditos} min="1" max="12" step={0.5}
                                    onChange={(e) => {
                                        let newCreditos = Number(e.currentTarget.value);
                                        
                                        if(newCreditos < 1){
                                            newCreditos = 1;
                                        }
                                        else if(newCreditos > 12){
                                            newCreditos = 12;
                                        }

                                        setCreditos(newCreditos);
                                    }}
                                />
                            </div>
                            <div className="column">
                                <label htmlFor="curso">Curso:</label>
                                <select id="curso" name="curso" defaultValue="1º" onChange={(e) => {setCurso(e.currentTarget.value)}}>
                                    {
                                        cursos_str.length !== 0 &&
                                        cursos_str.map((curso) => {
                                            return(
                                                <option key={curso} value={curso}>{curso}</option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                            <div className="column">
                                <label>Tipo:</label>
                                <select value={optatividad} onChange={(e) => setOptatividad(e.currentTarget.value)}>
                                    <option value="Obligatoria">Obligatoria</option>
                                    <option value="Optativa">Optativa</option>
                                </select>
                            </div>
                            <div className="buttons">
                                <button type="button" onClick={() => globalThis.location.href = "/mostrarTitulaciones"}>Volver</button>
                                <button type="reset" onClick={handleReset}>Vaciar campos</button>
                                <button type="button" onClick={handleCreation} disabled={buttonAction}>Enviar</button>
                            </div>
                        </form>
                    </div>
                }
                {
                    creationSuccess === true &&
                    <div className="message_response">
                        <div className="column">
                            <h1>{message}</h1>
                        </div>
                        <div className="buttons">
                            <button type="button" onClick={() => globalThis.location.href = "/mostrarTitulaciones"}>Continuar</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default NewAsignatura;