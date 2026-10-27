import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import SidebarCoordinador from "../Sidebar/SidebarCoordinador.tsx";
import Header from "../Header/Header.tsx";
import type { Administrativo_Short } from "../types/Personas/Administrativo.ts";
import type { Estudiante_Short } from "../types/Personas/Estudiante.ts";
import { Decrypt_DNI } from "../utilities/Transforms/Transform_DNI.ts";
import type { Coordinador_Short } from "../types/Personas/Coordinador.ts";
import type { Profesor_Short } from "../types/Personas/Profesor.ts";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function ShowNotasUniversidad() {
    const [id, setID] = useState("");
    const [nombreAsignaturas, setNombreAsignaturas] = useState<string[]>([]);
    const [nombre, setNombre] = useState("");
    const [asignaturas, setAsignaturas] = useState<{
        asignatura: string,
        curso: string,
        convocatoria: string,
        docentesUniCoordinador: boolean,
        docentes: (Coordinador_Short | Profesor_Short)[],
        alumnos: {
            estudiante: Estudiante_Short,
            nota: number | string,
        }[],
    }[]>([]);
    const [asignatura, setAsignatura] = useState<{
        asignatura: string,
        curso: string,
        convocatoria: string,
        docentesUniCoordinador: boolean,
        docentes: (Coordinador_Short | Profesor_Short)[],
        alumnos: {
            estudiante: Estudiante_Short,
            nota: number | string,
        }[],
    }>();
    const [curso, setCurso] = useState("");
    const [cursosDisponibles, setCursosDisponibles] = useState<string[]>([]);
    const [universidad, setUniversidad] = useState("");
    const [convocatoria, setConvocatoria] = useState("");
    const [titulacion, setTitulacion] = useState("");
    const [docenteIn, setDocenteIn] = useState(false);
    const [docentes, setDocentes] = useState<(Coordinador_Short | Profesor_Short)[]>([]);
    const [url, setURL] = useState("");

    useEffect(() => {
        const getData = async () => {
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
            setID(data_user.id);

            if(data_user.rol !== "Coordinador" && data_user.rol !== "Coordinador general"){
                alert("Tienes que ser un coordinador para poder ver los datos para hacer el control de calidad");
                globalThis.location.href = "/paginaPersonal";
            }

            setUniversidad(data_user.universidad);

            const TFG_titulacion = Cookie.get("TFG_titulacion");

            if(TFG_titulacion === undefined){
                globalThis.location.href = "/paginaPersonal"
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
            setTitulacion(TFG_titulacion!);

            const admin_error: Administrativo_Short | undefined = data_titulacion.administrativos.find((admin: Administrativo_Short) => {
                if(admin.id === auth){
                    return auth;
                }
            });

            if(admin_error !== undefined){
                alert("No administras esta titulación");

                globalThis.location.href = "/paginaPersonal";
            }

            const url_creacion = `https://tfg-back-end.onrender.com/titulacion/creacion?titulacion=${TFG_titulacion}`;
            const response_creacion = await fetch(url_creacion, {
                method: "GET",
            });

            if(response_creacion.status !== 200){
                const error = await response_creacion.json();
                alert(error);

                globalThis.location.href = "/paginaPersonal";
            }

            const data_creacion = await response_creacion.json();
            
            const creacionInfo = `Curso ${data_creacion}-${data_creacion+1}`

            const date = new Date();
            let limiteInfo = `Curso `
            if(date.getMonth() + 1 >= 1 && date.getMonth() + 1 < 9){
                limiteInfo += `${date.getFullYear()}-${date.getFullYear() + 1}`;
            }
            else{
                limiteInfo += `${date.getFullYear() + 1}-${date.getFullYear() + 2}`;
            }

            const cursos_disponibles: string[] = [];

            cursos_disponibles.push(creacionInfo);

            let year = Number(creacionInfo.split(" ")[1].split("-")[0]) + 1;

            while( year < Number(limiteInfo.split(" ")[1].split("-")[0])){
                const new_curso = `Curso ${year}-${year+1}`

                if(cursos_disponibles.includes(new_curso) === false){
                    cursos_disponibles.push(new_curso);
                }

                year += 1;
            }

            if(cursos_disponibles.includes(limiteInfo) === false && year < Number(limiteInfo.split(" ")[1].split("-")[0])){
                cursos_disponibles.push(limiteInfo);
            }

            setCursosDisponibles(cursos_disponibles);

            const url_asig = `https://tfg-back-end.onrender.com/asignaturas/nombres?titulacion=${TFG_titulacion}`;
            const response_asig = await fetch(url_asig, {
                method: "GET",
            });

            if(response_asig.status !== 200){
                const error = await response_asig.json();
                alert(error.error);

                globalThis.location.href = "/paginaPersonal";
            }

            const data_asig = await response_asig.json();
            setNombreAsignaturas(data_asig);
        }

        getData();
    }, []);

    const handleChangeCurso = async (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
        setCurso(e.currentTarget.value);

        if(convocatoria.trim() !== "" && e.currentTarget.value.trim() !== ""){
            const url_notas = `https://tfg-back-end.onrender.com/asignaturas/notas_curso?titulacion=${titulacion}&universidad=${universidad}&curso=${e.currentTarget.value}&convocatoria=${convocatoria}`;
            const response_notas = await fetch(url_notas, {
                method: "GET",
            });

            if(response_notas.status !== 200){
                const error = await response_notas.json();
                alert(error.error);

                globalThis.location.href = "/paginaPersonal";
            }

            const data_notas: {
                asignatura: string,
                curso: string,
                convocatoria: string,
                docentesUniCoordinador: boolean,
                docentes: (Coordinador_Short | Profesor_Short)[],
                alumnos: {
                    estudiante: Estudiante_Short,
                    nota: number | string,
                }[],
            }[] = await response_notas.json();
            setAsignaturas(data_notas);

            if(asignatura !== undefined){
                data_notas.forEach((data) => {
                    if(data.asignatura === asignatura.asignatura){
                        setAsignatura(data);
                        if(data.docentesUniCoordinador === true){
                            setDocenteIn(true);
                            setDocentes(data.docentes);
                        }
                        else{
                            setDocenteIn(false);
                            createPDF(data.alumnos);
                        }
                    }
                });
            }
        }
    }

    const handleChangeConvocatoria = async (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
        setConvocatoria(e.currentTarget.value)

        if(curso.trim() !== "" && e.currentTarget.value.trim() !== ""){
            const url_notas = `https://tfg-back-end.onrender.com/asignaturas/notas_curso?titulacion=${titulacion}&universidad=${universidad}&curso=${curso}&convocatoria=${e.currentTarget.value}`;
            const response_notas = await fetch(url_notas, {
                method: "GET",
            });

            if(response_notas.status !== 200){
                const error = await response_notas.json();
                alert(error.error);

                globalThis.location.href = "/paginaPersonal";
            }

            const data_notas: {
                asignatura: string,
                curso: string,
                convocatoria: string,
                docentesUniCoordinador: boolean,
                docentes: (Coordinador_Short | Profesor_Short)[],
                alumnos: {
                    estudiante: Estudiante_Short,
                    nota: number | string,
                }[],
            }[] = await response_notas.json();
            setAsignaturas(data_notas);

            if(asignatura !== undefined){
                data_notas.forEach((data) => {
                    if(data.asignatura === asignatura.asignatura){
                        setAsignatura(data);
                        if(data.docentesUniCoordinador === true){
                            setDocenteIn(true);
                            setDocentes(data.docentes);
                        }
                        else{
                            setDocenteIn(false);
                            createPDF(data.alumnos);
                        }
                    }
                });
            }
        }
    }

    const handleChangeAsignatura = (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
        setDocenteIn(false);
        setDocentes([]);
        setNombre(e.currentTarget.value);

        asignaturas.forEach((asig) => {
            if(asig.asignatura === e.currentTarget.value){
                setAsignatura(asig);
                if(asig.docentesUniCoordinador === true){
                    setDocenteIn(true);
                    setDocentes(asig.docentes);
                }
                else{
                    setDocenteIn(false);
                    createPDF(asig.alumnos);
                }
            }
        });
    }

    const createPDF = (alumnos: { estudiante: Estudiante_Short, nota: number | string}[]) => {
        const doc = new jsPDF();

        const headers = [["Nombre completo", "DNI", "Convocatoria", "Nota"]];
        const data: (string | number)[][] = [];

        alumnos.forEach((alumno) => {
            const alumno_data: (string | number)[] = [];

            let nombreAlumno = alumno.estudiante.nombre + " " + alumno.estudiante.apellido_1;

            if(alumno.estudiante.apellido_2 !== null && alumno.estudiante.apellido_2 !== undefined && alumno.estudiante.apellido_2.trim() !== ""){
                nombreAlumno += ` ${alumno.estudiante.apellido_2}`;
            }

            const dni = Decrypt_DNI(alumno.estudiante.DNI)
            
            if(dni === undefined){
                alert("Error al mostrar la página");

                globalThis.location.href =  "/mostrarAsignaturas";
            }

            alumno_data.push(nombreAlumno);
            alumno_data.push(dni!);
            alumno_data.push(convocatoria);
            alumno_data.push(alumno.nota);

            data.push(alumno_data);
        });

        doc.setFontSize(20);
        doc.text(`Listado de notas de alumnos de la asignatura ${asignatura!.asignatura}`, 20, 20);
    
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
        setURL(newUrl);
    }
    
    return(
         <div className="finalPage">
            <Header/>
            <div className="totalPage">
                <SidebarCoordinador/>
                <div className="notasAlumnosPage">
                    <form className="notasAlumnosMenu">
                        <h1>Notas de alumnos de tu universidad</h1>
                        <div className="column">
                            <label>Selecciona el curso</label>
                            <select value={curso} onChange={(e) => handleChangeCurso(e)}>
                                <option value="">Seleccione un curso</option>
                                {
                                    cursosDisponibles.map((cursito) => {
                                        return(
                                            <option key={cursito} value={cursito}>{cursito}</option>
                                        );
                                    })
                                }
                            </select>
                        </div>
                        <div className="column">
                            <label>Selecciona la convocatoria:</label>
                            <select value={convocatoria} onChange={(e) => handleChangeConvocatoria(e)}>
                                <option value="">Selecciona la convocatoria</option>
                                <option value="Ordinaria">Ordinaria</option>
                                <option value="Extraordinaria">Extraordinaria</option>
                            </select>
                        </div>
                        {
                            curso.trim() !== "" && convocatoria.trim() !== "" &&
                            <div className="column">
                                <label>Selecciona el nombre de la asignatura</label>
                                <select value={nombre} onChange={(e) => handleChangeAsignatura(e)}>
                                    <option value="">Seleccione una asignatura</option>
                                    {
                                        nombreAsignaturas.map((asig) => {
                                            return(
                                                <option key={asig} value={asig}>{asig}</option>
                                            );
                                        })
                                    }
                                </select>
                            </div>
                        }
                        <div className="buttons">
                            <button type="button" onClick={() => globalThis.location.href = "/paginaPersonal"}>Volver</button>
                            {
                                asignatura !== undefined &&
                                <a href={url} download>
                                    <button type="button" disabled={docenteIn}>Descargar notas en PDF</button>
                                </a>
                            }
                        </div>
                    </form>
                    {
                        asignatura !== undefined && docenteIn === true &&
                        <div style={{textAlign: "justify", marginTop: "5dvh"}}>
                            <h3>Esta información no está displonible</h3>
                            {
                                docentes.length === 1 &&
                                <>
                                    <h3>El acta oficial lo rellena:
                                    {
                                        docentes.map((docente) => {
                                            if(docente.id === id){
                                                return <span key={docente.id}> Usted</span>
                                            }
                                            else if(docente.apellido_2 !== null && docente.apellido_2 !== undefined && docente.apellido_2.trim() !== ""){
                                                return(
                                                    <span key={docente.id}> {docente.nombre} {docente.apellido_1} {docente.apellido_2} ({docente.email})</span>
                                                );
                                            }
                                            else if((docente.apellido_2 === null || docente.apellido_2 === undefined || docente.apellido_2.trim() === "") && docente.universidad === universidad){
                                                return(
                                                    <span key={docente.id}> {docente.nombre} {docente.apellido_1} ({docente.email})</span>
                                                );
                                            }
                                        })
                                    }
                                    </h3>
                                </>
                            }
                            {
                                docentes.length > 1 &&
                                <>
                                    <h3>El acta oficial lo rellenan: </h3>
                                    <ul>
                                    {
                                        docentes.map((docente) => {
                                            if(docente.id === id){
                                                return <li key={docente.id}>Usted</li>
                                            }
                                            else if(docente.apellido_2 !== null && docente.apellido_2 !== undefined && docente.apellido_2.trim() !== "" && docente.universidad === universidad){
                                                return(
                                                    <li key={docente.id}>{docente.nombre} {docente.apellido_1} {docente.apellido_2} ({docente.email})</li>
                                                );
                                            }
                                            else if((docente.apellido_2 === null || docente.apellido_2 === undefined || docente.apellido_2.trim() === "") && docente.universidad === universidad){
                                                return(
                                                    <li key={docente.id}>{docente.nombre} {docente.apellido_1} ({docente.email})</li>
                                                );
                                            }
                                        })
                                    }
                                    </ul>
                                </>
                            }
                        </div>
                    }
                    {
                        asignatura !== undefined && asignatura.alumnos.length === 0 && docenteIn === false &&
                        <div style={{marginTop: "5dvh"}}>
                            <h1>No hay estudiantes calificados</h1>
                        </div>
                    }
                    {
                        asignatura !== undefined && asignatura.alumnos.length > 0 && docenteIn === false &&
                        <div>
                            <table className="tablaNotasAlumnos">
                                <thead>
                                    <tr>
                                        <td>Nombre completo</td>
                                        <td>DNI</td>
                                        <td>Universidad</td>
                                        <td>Convocatoria</td>
                                        <td>Nota</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        asignatura.alumnos.map((alumno) => {
                                            return(
                                                <tr key={alumno.estudiante.id}>
                                                    {
                                                        alumno.estudiante.apellido_2 !== null && alumno.estudiante.apellido_2 !== undefined && alumno.estudiante.apellido_2.trim() !== "" && 
                                                        <td>{alumno.estudiante.nombre} {alumno.estudiante.apellido_1} {alumno.estudiante.apellido_2}</td>
                                                    }
                                                    {
                                                        (alumno.estudiante.apellido_2 === null || alumno.estudiante.apellido_2 === undefined || alumno.estudiante.apellido_2.trim() === "") &&
                                                        <td>{alumno.estudiante.nombre} {alumno.estudiante.apellido_1}</td>
                                                    }
                                                    <td>{Decrypt_DNI(alumno.estudiante.DNI)}</td>
                                                    <td>{alumno.estudiante.universidad}</td>
                                                    <td>{asignatura.convocatoria}</td>
                                                    <td>{alumno.nota}</td>
                                                </tr>
                                            );
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default ShowNotasUniversidad;