import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { Asignatura_titulacion_ins } from "../types/Asignaturas/Asignatura.ts";
import type { Titulacion_ins } from "../types/Titulacion/Titulacion.ts";
import Header from "../Header/Header.tsx";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

function NewTitulacion() {
    const [pagina, setPagina] = useState(1);
    const [auth, setAuth] = useState("");
    const [nombre, setNombre] = useState("");
    const [cursos, setCursos] = useState(1);
    //const [practicasExists, setPracticasExists] = useState("No");
    const [creditos, setCreditos] = useState(60);
    const [creditosTFM, setCreditosTFM] = useState(10);
    //const [creditosPracticas, setCreditosPracticas] = useState(10);
    const [universidad, setUniversidad] = useState("");
    const [universidadPrincipal, setUniversidadPrincipal] = useState("No");
    const [nombresUniversidades, setNombresUniversidades] = useState<string[]>([]);
    const [universidades, setUniversidades] = useState<{
                                                            nombre: string,
                                                            principal: boolean,
                                                        }[]>([]);
    const [grado, setGrado] = useState("");
    const [grados, setGrados] = useState<string[]>([]);
    const [nombre_asig, setNombreAsig] = useState("");
    const [curso_asig, setCursoAsig] = useState(1);
    const [creditos_asig, setCreditosAsig] = useState(4);
    const [optatividad_asig, setOptatividadAsig] = useState("Obligatoria");
    const [creditos_asig_oblig, setCreditosAsigOblig] = useState(15);
    const [creditos_asig_opt, setCreditosAsigOpt] = useState(15);
    const [asignaturas, setAsignaturas] = useState<Asignatura_titulacion_ins[]>([]);
    const [convocatorias, setConvocatorias] = useState(4);

    const [nombreError, setNombreError] = useState("");
    const [universidadesError, setUniversidadesError] = useState("");
    const [gradosError, setGradosError] = useState("");
    const [asignaturaError, setAsignaturaError] = useState("");

    const [buttonAction, setButtonAction] = useState(false);
    const [creationSuccess, setCreationSuccess] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const Verification = async () => {
            const auth = Cookie.get("authTFG");

            if(auth === undefined){
                globalThis.location.href = "/login";
            }
            else{
                setAuth(auth)
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
                alert("Tienes que ser un administrativo para dar de alta una titulación");

                globalThis.location.href = "/login";
            }
        }

        Verification();
    }, []);

    const handleReset = () => {
        setNombre("");
        setCursos(1);
        //setPracticasExists("No");
        setCreditosTFM(10);
        //setCreditosPracticas(10);
        setCreditos(60);
        setUniversidad("");
        setUniversidades([]);
        setUniversidadPrincipal("No");
        setGrado("");
        setGrados([]);
        setNombreAsig("");
        setCursoAsig(1);
        setCreditosAsig(4);
        setAsignaturas([]);
        setCreditosAsigOblig(15);
        setCreditosAsigOpt(15);

        setNombreError("");
        setUniversidadesError("");
        setGradosError("");
        setAsignaturaError("");
        
        setButtonAction(false);
    }
    
    const handleTitulacionClass = () => {
        if(pagina === 1){
            return "grid_group_Titulacion1";
        }
        else if(pagina === 2){
            return "grid_group_Titulacion2";
        }
        else if(pagina === 3){
            return "grid_group_Titulacion3";
        }

        return "";
    }

    const handleNewUniversidad = () => {
        if(universidad.trim() !== ""){
            const uni1_exists = nombresUniversidades.find((uni) => {
                if(uni === universidad.trim()){
                    return uni;
                }
            });

            const uni2_exists = universidades.find((uni) => {
                if(uni.nombre === universidad.trim()){
                    return uni;
                }
            });

            const uni3_exists = universidades.find((uni) => {
                if(uni.principal === true && universidadPrincipal === "Si"){
                    return uni;
                }
            });

            if(uni1_exists !== undefined && uni2_exists !== undefined){
                setUniversidadesError(`${universidad.trim()} ya existe en la lista`);
            }
            else if(uni3_exists !== undefined){
                setUniversidadesError("Ya hay una universidad principal");
            }
            else{
                const new_nombres_universidades = nombresUniversidades;
                new_nombres_universidades.push(universidad);
                setNombresUniversidades(new_nombres_universidades);

                const new_universidades = universidades;
                if(universidadPrincipal === "Si"){
                    const error_uni_principal = new_universidades.find((uni) => {
                        if(uni.principal === true){
                            return uni;
                        }
                    });

                    if(error_uni_principal !== undefined){
                        alert("Ya hay una universidad coordinadora del master")
                    }
                    else{
                        new_universidades.push(
                        {
                            nombre: universidad,
                            principal: true,
                        }
                    );
                    }
                }
                else if(universidadPrincipal === "No"){
                    new_universidades.push(
                        {
                            nombre: universidad,
                            principal: false,
                        }
                    );
                }
                setUniversidades(new_universidades);

                setUniversidadesError("");
            }
        }

        setUniversidad("");
    }

    const handleNewGrado = () => {
        if(grado.trim() !== ""){
            const grado_exists = grados.find((gradito) => {
                if(gradito === grado.trim()){
                    return gradito;
                }
            });

            if(grado_exists === undefined){
                const new_grados = grados;
                new_grados.push(grado);
                setGrados(new_grados);
                setGradosError("");
            }
            else{
                setGradosError(`${grado.trim()} ya existe en la lista`);
            }
        }
        
        setGrado("");
    }

    const handleNewAsignatura = () => {
        if(nombre_asig.trim() !== ""){
            const asig_exists = asignaturas.find((asig) => {
                if(asig.nombre === nombre_asig.trim()){
                    return asig;
                }
            });

            if(asig_exists === undefined){
                let newCursoAsig = curso_asig;

                if(curso_asig < 1){
                    newCursoAsig = 1;
                }
                else if(curso_asig > 6){
                    newCursoAsig = 6;
                }

                const new_asig: Asignatura_titulacion_ins = {
                    nombre: nombre_asig,
                    curso: `${newCursoAsig}º`,
                    creditos: creditos_asig,
                    optatividad: optatividad_asig,
                }
            
                const upd_asignaturas = asignaturas;
                upd_asignaturas.push(new_asig);
            
                setAsignaturas(upd_asignaturas);
                setAsignaturaError("");
            }
            else{
                setGradosError(`${universidad.trim()} ya existe en la lista`);
            }
        }

        setNombreAsig("");
        setCreditosAsig(4);
        setCursoAsig(1);
        setOptatividadAsig("Obligatoria");
    }

    const handleCursoVar = (cursito: number) => {
        const asigs_aux: Asignatura_titulacion_ins[] = [];

        asignaturas.forEach((asig) => {
            const asig_curso = asig.curso.split("º");
            if(Number(asig_curso[0]) > cursito){
                asigs_aux.push(
                    {
                        nombre: asig.nombre,
                        curso: `${cursito}º`,
                        creditos: asig.creditos,
                        optatividad: asig.optatividad,
                    }
                );
            }
            else{
                asigs_aux.push(asig);
            }
        });

        setAsignaturas(asigs_aux);
    }

    const handleCreation = async () => {
        setButtonAction(true);

        let error_exists = false;
        
        if(nombre.trim() === ""){
            setNombreError("Hay que rellenar este campo");
            error_exists = true;
        }

        if(nombresUniversidades.length === 0){
            setUniversidadesError("Hay que insertar al menos una universidad");
            error_exists = true;
        }
        else{
            let principalExists = false;

            universidades.forEach((universidad) => {
                if(universidad.principal === true){
                    principalExists = true;
                }
            });

            if(principalExists === false){
                alert("Tiene que haber una universidad principal");
                error_exists = true;
            }
        }

        if(grados.length === 0){
            setGradosError("Hay que insertar al menos un grado");
            error_exists = true;
        }

        if(creditos !== (creditosTFM + creditos_asig_oblig + creditos_asig_opt)){
            alert("La suma de los créditos obligatorios, optativos y los del TFM tiene que coincidir con los créditos de la titulación");
            error_exists = true;
        }

        let creditos_asigs_oblig_totales = 0;

        asignaturas.forEach((asig) => {
            if(asig.optatividad === "Obligatoria"){
                creditos_asigs_oblig_totales += asig.creditos;
            }
        });

        if(creditos_asigs_oblig_totales > creditos_asig_oblig){
            alert("La suma de los créditos de las asignaturas obligatorias supera el número de créditos obligatorios permitidos");
        }

        if(error_exists === false){
            const newTitulacion: Titulacion_ins = {
                nombre: nombre,
                universidades: universidades,
                grados_aptos: grados,
                cursos: cursos,
                convocatorias: convocatorias,
                administrativo: auth,
                creditos_obligatorios: creditos_asig_oblig,
                creditos_optativos: creditos_asig_opt,
                creditos_TFM: creditosTFM,
                asignaturas: asignaturas,
            }

            NProgress.start();
                                
            try{
                const url = "https://tfg-back-end.onrender.com/titulacion";
                const response = await fetch(url, {
                    method: "POST",
                    body: JSON.stringify(newTitulacion),
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

                    Cookie.set("TFG_titulacion", data.id, {expires: 7});
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
            {
                creationSuccess === false &&
                <div className={handleTitulacionClass()}>
                    <form className="newTitulacion">
                        <h1>Registro de una titulacion</h1>
                        {
                            pagina === 1 &&
                            <>
                                <h3>Datos de la titulación</h3>
                                <div className="column">
                                    <label htmlFor="nombre">Nombre:</label>
                                    <input id="nombre" name="nombre" placeholder="Nombre de la titulación" value={nombre} onChange={(e) => {
                                        setNombre(e.currentTarget.value);
                                        setNombreError("");
                                    }}/>
                                    <div className="error">{nombreError}</div>
                                </div>
                                <div className="column">
                                    <label htmlFor="universidades">Universidades involucradas:</label>
                                    <div id="universidades" className="add_data">
                                        <input id="universidad" name="universidades" placeholder="Nombre de la universidad" value={universidad} onChange={(e) => {
                                            setUniversidad(e.currentTarget.value);
                                            setUniversidadesError("");
                                        }}/>
                                        <select id="principal" value={universidadPrincipal} onChange={(e) => setUniversidadPrincipal(e.currentTarget.value)}>
                                            <option value="No">No es la universidad coordinadora</option>
                                            <option value="Si">Es la universidad coordinadora</option>
                                        </select>
                                        <button type="button" onClick={() => {
                                            handleNewUniversidad();
                                        }}>Insertar a la lista</button>
                                        <button type="button" disabled={nombresUniversidades.length === 0 ? true : false} onClick={() => {
                                            setUniversidad("");
                                            setNombresUniversidades([]);
                                            setUniversidades([]);
                                        }}>Reiniciar lista</button>
                                    </div>
                                    <div className="error">{universidadesError}</div>
                                </div>
                                <div className="column">
                                    <label htmlFor="grados">Grados universitarios necesarios:</label>
                                    <div id="grados" className="add_data">
                                        <input name="grados" value={grado} placeholder="Nombre del grado" onChange={(e) => {
                                            setGrado(e.currentTarget.value);
                                            setGradosError("");
                                        }}/>
                                        <button type="button" onClick={() => {
                                            handleNewGrado();
                                        }}>Insertar a la lista</button>
                                        <button type="button" disabled={grados.length === 0 ? true : false} onClick={() => setGrados([])}>Reiniciar lista</button>
                                    </div>
                                    <div className="error">{gradosError}</div>
                                </div>
                                <div className="column">
                                    <label htmlFor="cursos">Cursos:</label>
                                    <input name="cursos" type="number" value={cursos} min="1" max="2" onChange={(e) => {
                                        let curso_aux = Number(e.currentTarget.value);

                                        if(curso_aux < 1){
                                            curso_aux = 1;
                                        }
                                        else if(curso_aux > 2){
                                            curso_aux = 2;
                                        }

                                        setCursos(Math.trunc(curso_aux));

                                        if(curso_asig > Math.trunc(curso_aux)){
                                            setCursoAsig(Math.trunc(curso_aux));
                                        }

                                        handleCursoVar(Math.trunc(curso_aux));
                                    }}/>
                                </div>
                                <div className="column">
                                    <label>Convocatorias por asignatura:</label>
                                    <input type="number" value={convocatorias} min="1" max="7" onChange={(e) => {
                                        if(Number(e.currentTarget.value) < 1){
                                            setConvocatorias(1);
                                        }
                                        else if(Number(e.currentTarget.value) > 7){
                                            setConvocatorias(7);
                                        }
                                        else{
                                            setConvocatorias(Math.trunc(Number(e.currentTarget.value)));
                                        }
                                    }}/>
                                </div>
                                <div className="column">
                                    <label>Créditos de la titulación:</label>
                                    <input
                                        type="number"
                                        defaultValue={creditos}
                                        min="60" max="120" step="30"
                                        onChange={(e) => {
                                            let creditos_aux = Math.trunc(Number(e.currentTarget.value));

                                            if(creditos_aux <= 60){
                                                creditos_aux = 60;
                                            }
                                            else if(creditos_aux >= 120){
                                                creditos_aux = 120;
                                            }
                                            else if(creditos_aux === 90){
                                                creditos_aux = 90;
                                            }
                                            else{
                                                creditos_aux = creditos;
                                            }

                                            setCreditos(creditos_aux);
                                        }}
                                    />
                                </div>
                                {
                                    /*<>
                                        <div className="column">
                                            <label>Prácticas curriculares:</label>
                                            <select value={practicasExists} onChange={(e) => setPracticasExists(e.currentTarget.value)}>
                                                <option value="Si">Si</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                    </>*/
                                }
                                <div className="buttons">
                                    <button type="reset" onClick={handleReset}>Vaciar todos los campos</button>
                                    <button type="button" onClick={() => setPagina(pagina+1)}>Siguiente página</button>
                                </div>
                            </>
                        }
                        {
                            pagina === 2 &&
                            <>
                                <h3>Datos de las asignaturas de la titulación</h3>
                                <div className="column">
                                    <div className="intra_div1">
                                        <label>Nombre:</label>
                                        <input placeholder="Nombre de la asignatura" value={nombre_asig} onChange={(e) => {
                                            setNombreAsig(e.currentTarget.value);
                                            setAsignaturaError("");
                                        }}/>
                                    </div>
                                    <div className="intra_div1">
                                        <label>Curso:</label>
                                        <input type="number" placeholder="Curso de la asignatura" value={curso_asig} min="1" max={cursos} onChange={(e) => {
                                            let newCurso = Math.trunc(Number(e.currentTarget.value));

                                            if(newCurso < 1){
                                                newCurso = 1;
                                            }
                                            else if(newCurso > cursos){
                                                newCurso = cursos;
                                            }

                                            setCursoAsig(newCurso);
                                            setAsignaturaError("");
                                        }}/>
                                    </div>
                                    <div className="intra_div1">
                                        <label>Créditos:</label>
                                        <input
                                            type="number"
                                            placeholder="Creditos de la asignatura"
                                            value={creditos_asig} min="1" max="12"
                                            onChange={(e) => {
                                                let newCreditos = Number(e.currentTarget.value);
                                        
                                                if(newCreditos < 1){
                                                    newCreditos = 1;
                                                }
                                                else if(newCreditos > 12){
                                                    newCreditos = 12;
                                                }

                                                setCreditosAsig(newCreditos);
                                                setAsignaturaError("");
                                            }
                                        }/>
                                    </div>
                                    <div className="intra_div1">
                                        <label>Optatividad:</label>
                                        <select value={optatividad_asig} onChange={(e) => setOptatividadAsig(e.currentTarget.value)}>
                                            <option value="Obligatoria">Obligatoria</option>
                                            <option value="Optativa">Optativa</option>
                                        </select>
                                    </div>
                                    <div className="buttons"> 
                                        <button type="button" onClick={(_e) => {
                                            handleNewAsignatura();
                                        }}>Insertar asignatura</button>
                                        <button type="button" disabled={asignaturas.length === 0 ? true : false} onClick={(_e) => {
                                            setAsignaturas([]);
                                            setNombreAsig("");
                                            setCursoAsig(1);
                                            setCreditosAsig(4);
                                        }}>Reiniciar asignaturas</button>
                                    </div>
                                    <div className="error">{asignaturaError}</div>
                                </div>
                                <div className="buttons">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPagina(pagina-1);
                                        }}
                                    >Página anterior</button>
                                    <button type="reset" onClick={handleReset}>Vaciar todos los campos</button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPagina(pagina+1);
                                        }}
                                    >Siguiente página</button>
                                </div>
                            </>
                        }
                        {
                            pagina === 3 &&
                            <>
                                <h3>Datos de los créditos de la titulación</h3>
                                <div className="column">
                                    <div className="intra_div2">
                                        <label htmlFor="cred_oblig">Créditos obligatorios para defender el TFM:</label>
                                        <input
                                            id="cred_oblig"
                                            name="cred_oblig"
                                            type="number"
                                            defaultValue={creditos_asig_oblig}
                                            min="1" max={/*practicasExists === "No" ?*/ (creditos-creditosTFM-creditos_asig_opt) /*: (creditos-creditosPracticas-creditosTFM-creditos_asig_opt)*/}
                                            onChange={(e) => {
                                                let creditos_aux = Math.trunc(Number(e.currentTarget.value));

                                                if(creditos_aux < 1){
                                                    creditos_aux = 1;
                                                }
                                                else if(/*practicasExists === "No" &&*/ creditos_aux > (creditos-creditosTFM-creditos_asig_opt)){
                                                    creditos_aux = creditos-creditosTFM-creditos_asig_opt;
                                                }
                                                /*else if(practicasExists === "Si" && creditos_aux > (creditos-creditosPracticas-creditosTFM-creditos_asig_opt)){
                                                    creditos_aux = creditos-creditosPracticas-creditosTFM-creditos_asig_opt;
                                                }*/

                                                setCreditosAsigOblig(creditos_aux);
                                            }}
                                        />
                                    </div>
                                    <div className="intra_div2">
                                        <label htmlFor="cred_opt">Créditos optativos para defender el TFM:</label>
                                        <input
                                            id="cred_opt"
                                            name="cred_opt"
                                            type="number"
                                            defaultValue={creditos_asig_opt}
                                            min="1" max={/*practicasExists === "No" ?*/ (creditos-creditosTFM-creditos_asig_oblig) /*: (creditos-creditosPracticas-creditosTFM-creditos_asig_opt)*/}
                                            onChange={(e) => {
                                                let creditos_aux = Math.trunc(Number(e.currentTarget.value));

                                                if(creditos_aux < 1){
                                                    creditos_aux = 1;
                                                }
                                                else if(/*practicasExists === "No" &&*/ creditos_aux > (creditos-creditosTFM-creditos_asig_oblig)){
                                                    creditos_aux = creditos-creditosTFM-creditos_asig_oblig;
                                                }
                                                /*else if(practicasExists === "Si" && creditos_aux > (creditos-creditosPracticas-creditosTFM-creditos_asig_oblig)){
                                                    creditos_aux = creditos-creditosPracticas-creditosTFM-creditos_asig_oblig;
                                                }*/

                                                setCreditosAsigOpt(creditos_aux);
                                            }}
                                        />
                                    </div>
                                    {
                                        /*practicasExists === "Si" &&
                                        <div className="intra_div2">
                                            <label>Créditos Prácticas:</label>
                                            <input
                                                type="number"
                                                defaultValue={creditosPracticas}
                                                min="6" max="30"
                                                onChange={(e) => {
                                                    let creditos_aux = Math.trunc(Number(e.currentTarget.value));

                                                    if(creditos_aux < 6){
                                                        creditos_aux = 6;
                                                    }
                                                    else if(creditos_aux > 30){
                                                        creditos_aux = 30;
                                                    }

                                                    setCreditosPracticas(creditos_aux);
                                                }}
                                            />
                                        </div>*/
                                    }
                                    <div className="intra_div2">
                                        <label htmlFor="creditosTFM">Créditos TFM:</label>
                                        <input
                                            id="creditosTFM"
                                            name="creditosTFM"
                                            type="number"
                                            defaultValue={creditosTFM}
                                            min="6" max="30"
                                            onChange={(e) => {
                                                let creditos_aux = Math.trunc(Number(e.currentTarget.value));

                                                if(creditos_aux < 6){
                                                    creditos_aux = 6;
                                                }
                                                else if(creditos_aux > 30){
                                                    creditos_aux = 30;
                                                }

                                                setCreditosTFM(creditos_aux);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="buttons">
                                    <button type="button" onClick={() => setPagina(pagina-1)}>Página anterior</button>
                                    <button type="reset" onClick={handleReset}>Vaciar todos los campos</button>
                                    <button type="button" onClick={handleCreation} disabled={buttonAction}>Enviar</button>
                                </div>
                            </>
                        }
                    </form>
                    <div>
                        <h3>Datos de la titulación:</h3>
                        <div>
                            <p><b>Nombre de la titulación:</b> {nombre}</p>
                        </div>
                        {
                            universidades.length === 1 &&
                            <div>
                                <p><b>Universidad insertada: </b>{universidades[0].nombre}</p>
                            </div>
                        }
                        {
                            universidades.length > 1 &&
                            <div>
                                <span><b>Universidades insertadas:</b></span>
                                <ul>
                                    {
                                        universidades.map((uni) => {
                                            if(uni.principal === true){
                                                return(
                                                    <li key={uni.nombre}>{uni.nombre} (universidad coordinadora)</li>
                                                )
                                            }
                                            else{
                                                return(
                                                    <li key={uni.nombre}>{uni.nombre}</li>
                                                )
                                            }
                                        })
                                    }
                                </ul>
                            </div>
                        }
                        {
                            grados.length === 1 &&
                            <div>
                                <p><b>Grado insertado: </b>{grados[0]}</p>
                            </div>
                        }
                        {
                            grados.length > 1 &&
                            <div>
                                <span><b>Grados insertados:</b></span>
                                <ul>
                                {
                                    grados.map((grado) => {
                                        return(
                                            <li key={grado}>{grado}</li>
                                        )
                                    })
                                }
                                </ul>
                            </div>
                        }
                        <div>
                            <p><b>Cursos en los que se desarrolla la titulación: </b>{cursos}</p>
                        </div>
                        <div>
                            <p><b>Convocatorias posibles de los alumnos en cada asignatura: </b>{convocatorias}</p>
                        </div>
                        <div>
                            <p><b>Créditos de la titulación: </b> {creditos}</p>
                        </div>
                        {
                            asignaturas.length === 1 &&
                            <div>
                                <span>
                                    <b>Asignatura: </b>
                                    {
                                        asignaturas.map((asig) => {
                                            return(
                                                <span>{asig.nombre} ({asig.curso}, {asig.creditos} ECTS, {asig.optatividad})</span>
                                            )
                                        })
                                    }
                                </span>
                            </div>
                        }
                        {
                            asignaturas.length > 1 &&
                            <div>
                                <span><b>Asignaturas:</b></span>
                                <ul>
                                    {
                                        asignaturas.map((asig) => {
                                            return(
                                                <li key={asig.nombre}>{asig.nombre} ({asig.curso}, {asig.creditos} ECTS, {asig.optatividad})</li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        }
                        <div>
                            <p><b>Créditos obligatorios para defender el TFM: </b>{creditos_asig_oblig}</p>
                        </div>
                        <div>
                            <p><b>Créditos optativos para defender el TFM: </b>{creditos_asig_opt}</p>
                        </div>
                        <div>
                            <p><b>Créditos del TFM: </b>{creditosTFM}</p>
                        </div>
                        {
                            /*practicasExists === "No" &&
                            <div>
                                <p><b>No hay prácticas curriculares</b></p>
                            </div>*/
                        }
                        {
                            /*<div>
                                <p><b>Créditos de las prácticas: </b>{creditosPracticas}</p>
                            </div>*/
                        }
                    </div>
                </div>
            }
            {
                creationSuccess === true &&
                <div className="message_response">
                    <div className="column">
                        <h1>{message}</h1>
                    </div>
                    <div className="buttons">
                        <button type="button" onClick={() => globalThis.location.href = "/paginaPersonal"}>Continuar</button>
                    </div>
                </div>
            }
        </div>
    );
}

export default NewTitulacion;
