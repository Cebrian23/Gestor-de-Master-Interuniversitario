import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { Asignatura_curso, Asignatura_Short } from "../types/Asignaturas/Asignatura.ts";
import type { Coordinador_Short } from "../types/Personas/Coordinador.ts";
import type { Profesor_Short } from "../types/Personas/Profesor.ts";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Estudiante_Short } from "../types/Personas/Estudiante.ts";
import { Decrypt_DNI } from "../utilities/Transforms/Transform_DNI.ts";
import SidebarCoordinador from "../Sidebar/SidebarCoordinador.tsx";
import SidebarProfesor from "../Sidebar/SidebarProfesor.tsx";
import Header from "../Header/Header.tsx";

function AsignaturaDocentePage() {
    const [asignatura, setAsignatura] = useState<Asignatura_curso>();
    const [showAlumnos, setShowAlumnos] = useState(false);
    const [urlAlumnos, setUrlAlumnos] = useState("");

    const [userRol, setRol] = useState("");

    useEffect(() => {
        const getData = async () => {
            Cookie.remove("TFG_conv");

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

            if(data_user.rol !== "Coordinador" && data_user.rol !== "Coordinador general" && data_user.rol !== "Profesor"){
                globalThis.location.href = "/paginaPersonal";
            }

            setRol(data_user.rol);

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

            const TFG_asig = Cookie.get("TFG_asig");

            if(TFG_asig === undefined){
                globalThis.location.href = "/mostrarAsignaturas"
            }

            const url_asig = `https://tfg-back-end.onrender.com/asignatura?id=${TFG_asig}`;
            const response_asig = await fetch(url_asig, {
                method: "GET",
            })

            if(response_asig.status !== 200){
                const error = await response_asig.json();
                alert(error.error);

                globalThis.location.href = "/mostrarAsignaturas";
            }
            
            const data_asig = await response_asig.json();

            const asignatura_exists = data_titulacion.asignaturas.find((asignatura: Asignatura_Short) => {
                if(asignatura.id === data_asig.id){
                    return asignatura;
                }
            });

            if(asignatura_exists === undefined){
                alert(`Asignatura no encontrada en el ${data_titulacion.nombre}`);

                globalThis.location.href = "/mostrarAsignaturas";
            }

            const TFG_curso = Cookie.get("TFG_curso");

            if(TFG_curso === undefined){
                globalThis.location.href = "/mostrarAsignaturas";
            }

            const url_curso = `https://tfg-back-end.onrender.com/curso?curso=${TFG_curso}&asignatura=${TFG_asig}`;
            const response_curso = await fetch(url_curso, {
                method: "GET",
            });

            if(response_curso.status !== 200){
                const error = await response_curso.json();
                alert(error.error);

                globalThis.location.href = "/mostrarAsignaturas";
            }

            const data_curso = await response_curso.json();

            if(data_curso.id_asig !== data_asig.id){
                alert(`Curso no encontrado en ${data_asig.nombre}`);

                globalThis.location.href = "/paginaPersonal";
            }

            const docente_in = data_curso.profesores.find((profesor: (Profesor_Short | Coordinador_Short)) => {
                if(profesor.id === auth){
                    return profesor;
                }
            });

            if(docente_in === undefined){
                globalThis.location.href = "/paginaPersonal";
            }

            setAsignatura(data_curso);

            const doc = new jsPDF();

            const headers = [["Nombre completo", "DNI", "Email", "Universidad", "Curso de admisión"]];
            const data: string[][] = [];

            data_curso!.estudiantes.forEach((estudiante: Estudiante_Short) => {
                const alumno: string[] = [];

                let nombreAlumno = estudiante.nombre + " " + estudiante.apellido_1;

                if(estudiante.apellido_2 !== null && estudiante.apellido_2 !== undefined && estudiante.apellido_2.trim() !== ""){
                    nombreAlumno += ` ${estudiante.apellido_2}`;
                }

                const dni = Decrypt_DNI(estudiante.DNI)
                
                if(dni === undefined){
                    alert("Error al mostrar la página")
                    Cookie.remove("TFG_conv");

                    globalThis.location.href =  "/mostrarAsignaturas";
                }

                alumno.push(nombreAlumno);
                alumno.push(dni!);
                alumno.push(estudiante.email);
                alumno.push(estudiante.universidad);
                alumno.push(estudiante.curso_admision);

                data.push(alumno);
            });

            doc.setFontSize(20);
            doc.text("Lista de alumnos", 20, 20);

            autoTable(doc,
                {
                    head: headers,
                    body: data,
                    startY: 30,
                    theme: "striped",
                    margin: {
                        left: 14,
                        right: 14,
                    }
                }
            );

            const pdfBlob = doc.output('blob');

            const newUrl = URL.createObjectURL(pdfBlob);
            setUrlAlumnos(newUrl);
        }

        getData();
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
                <div>
                {
                    asignatura !== undefined &&
                    <div className="AsignaturaImpPage">
                        <h1>{asignatura.nombre} ({asignatura.curso_academico})</h1>
                        <div className="AsignaturaImpPageMenu">
                            <h2>¿Que deseas hacer?</h2>
                            <div className="column">
                                <button type="button" onClick={() => setShowAlumnos(!showAlumnos)}>
                                    {
                                        showAlumnos === false ? <>Mostrar listado de alumnos</> : <>Ocultar listado de alumnos</>
                                    }
                                </button>
                                {
                                    asignatura.extraordinaria_firmada === false &&
                                    <button type="button" onClick={() => {
                                        const curso_aux = asignatura.curso_academico.split(" ")[1].split("-")[1];

                                        const date = new Date();

                                        if((date.getFullYear() > Number(curso_aux)) || date.getMonth() + 1 >= 9){
                                            alert("No se puede evaluar una asignatura fuera de fecha");

                                            globalThis.location.href = "/mostrarAsignaturas";
                                        }

                                        if(asignatura.ordinaria_firmada === false){
                                            Cookie.set("TFG_conv", "Ordinaria", {expires: 7});

                                            globalThis.location.href = "/calificarAsignatura";
                                        }
                                        else if(asignatura.extraordinaria_firmada === false){
                                            Cookie.set("TFG_conv", "Extraordinaria", {expires: 7});

                                            globalThis.location.href = "/calificarAsignatura";
                                        }
                                        else{
                                            alert("Ambas convocatorias ya estan evaluadas y firmadas");

                                            globalThis.location.href = "/mostrarAsignaturas";
                                        }
                                    }}>
                                        {
                                            asignatura.ordinaria_firmada === false ? <>Calificar convocatoria ordinaria</> : <>Calificar convocatoria extraordinaria</>
                                        }
                                    </button>
                                }
                                <button type="button" onClick={() => {
                                    Cookie.remove("TFG_conv");

                                    globalThis.location.href =  "/mostrarAsignaturas";
                                }}>Volver</button>
                            </div>
                        </div>
                    </div>
                }
                {
                    showAlumnos === true &&
                    <div className="AsignaturaImp">
                        <br/>
                        <embed src={urlAlumnos} width="100%" height="450px"/>
                    </div>
                }
                </div>
            </div>
        </div>
    );
}

export default AsignaturaDocentePage;