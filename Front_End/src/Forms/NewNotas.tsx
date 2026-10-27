import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { Alumno, Asignatura_curso_short, Asignatura_Short } from "../types/Asignaturas/Asignatura.ts";
import { Decrypt_DNI } from "../utilities/Transforms/Transform_DNI.ts";
import SidebarCoordinador from "../Sidebar/SidebarCoordinador.tsx";
import SidebarProfesor from "../Sidebar/SidebarProfesor.tsx";
import Header from "../Header/Header.tsx";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

function NewNotas() {
    const [estudiantes, setEstudiantes] =useState<
        {
            alumno: string,
            presentado: boolean,
            nota: (string | number),
            convocatoria_num: string,
        }[]
    >([]);

    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [asignatura, setAsignatura] = useState("");
    const [nombreAsignatura, setNombreAsignatura] = useState("");
    const [curso, setCurso] = useState("")
    const [convocatoria, setConvocatoria] = useState("");
    const [academico, setAcademico] = useState("");

    const [buttonAction, setButtonAction] = useState(false);
    const [userRol, setRol] = useState("");
    const [creationSuccess, setCreationSuccess] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const getAlumnos = async () => {
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
                alert("Tienes que ser un docente para poder calificar una asignatura");
                globalThis.location.href = "/paginaPersonal";
            }

            setRol(data_user.rol);

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

            const TFG_asig = Cookie.get("TFG_asig");

            if(TFG_asig === undefined){
                globalThis.location.href = "/mostrarAsignaturas";
            }

            const url_asig = `https://tfg-back-end.onrender.com/asignatura?id=${TFG_asig}`;
            const response_asig = await fetch(url_asig, {
                method: "GET",
            });

            if(response_asig.status !== 200){
                const error = await response_asig.json();
                alert(error.error);

                globalThis.location.href = "/paginaPersonal";
            }

            const data_asig = await response_asig.json();
            const asig_exists: Asignatura_Short | undefined = data_titulacion.asignaturas.find((asignatura: Asignatura_Short) => {
                if(asignatura.id === data_asig.id){
                    return asignatura;
                }
            });

            if(asig_exists === undefined){
                alert("La asignatura no existe en la titulación");

                globalThis.location.href = "/mostrarAsignaturas";
            }

            setAsignatura(data_asig.id);
            setNombreAsignatura(data_asig.nombre)

            const TFG_curso = Cookie.get("TFG_curso");

            if(TFG_curso === undefined){
                globalThis.location.href = "/mostrarAsignaturas";
            }

            const url_curso = `https://tfg-back-end.onrender.com/curso?asignatura=${TFG_asig}&curso=${TFG_curso}`;
            const response_curso = await fetch(url_curso, {
                method: "GET",
            });

            if(response_curso.status !== 200){
                const error = await response_curso.json();
                alert(error);

                globalThis.location.href = "/paginaPersonal";
            }

            const data_curso = await response_curso.json();
            const curso_exists: Asignatura_curso_short | undefined = data_asig.cursos_academicos.find((curso: Asignatura_curso_short) => {
                if(curso.id === data_curso.id){
                    return curso;
                }
            });

            if(curso_exists === undefined){
                alert("No existe este curso en la asignatura");

                globalThis.location.href = "/mostrarAsignaturas";
            }

            setCurso(data_curso.id);
            setAcademico(data_curso.curso_academico);

            const TFG_conv = Cookie.get("TFG_conv");

            if(TFG_conv === undefined){
                globalThis.location.href = "/mostrarAsignaturas";
            }

            setConvocatoria(TFG_conv!);

            const estudiantes_aux: {
                alumno: string,
                presentado: boolean,
                nota: (string | number),
                convocatoria_num: string,
            }[] = [];
            const alumnos_conv: Alumno[] = [];

            if(TFG_conv === "Ordinaria"){
                if(data_curso.ordinaria_firmada === true){
                    alert("No puedes calificar una convocatoria ya cerrada");

                    globalThis.location.href = "/paginaAsignatura";
                }
                else{
                    data_curso.alumnos_ordinaria.forEach((alumno: Alumno) => {
                        const alumno_DNI_trans = Decrypt_DNI(alumno.estudiante.DNI);

                        if(alumno_DNI_trans === undefined){
                            alert("Error de la página");
                            globalThis.location.href = "/mostrarAsignaturas"
                        }

                        alumnos_conv.push(
                            {
                                estudiante: {
                                    id: alumno.estudiante.id,
                                    nombre: alumno.estudiante.nombre,
                                    apellido_1: alumno.estudiante.apellido_1,
                                    apellido_2: alumno.estudiante.apellido_2,
                                    DNI: alumno_DNI_trans!,
                                    email: alumno.estudiante.email,
                                    universidad: alumno.estudiante.universidad,
                                    curso_admision: alumno.estudiante.curso_admision,
                                    rol: alumno.estudiante.rol,
                                },
                                convocatoria_name: alumno.convocatoria_name,
                                convocatoria_num: alumno.convocatoria_num,
                                nota: alumno.nota,
                                tipo: alumno.tipo
                            }
                        );

                        estudiantes_aux.push(
                            {
                                alumno: alumno.estudiante.id,
                                presentado: false,
                                nota: "No presentado",
                                convocatoria_num: alumno.convocatoria_num,
                            }
                        );
                    });
                }
            }
            else if(TFG_conv === "Extraordinaria"){
                if(data_curso.extraordinaria_firmada === true){
                    alert("No puedes calificar una convocatoria ya cerrada");

                    globalThis.location.href = "/paginaAsignatura";
                }
                else{
                    data_curso.alumnos_extraordinaria.forEach((alumno: Alumno) => {
                        const alumno_DNI_trans = Decrypt_DNI(alumno.estudiante.DNI);

                        if(alumno_DNI_trans === undefined){
                            alert("Error de la página");
                            globalThis.location.href = "/mostrarAsignaturas"
                        }

                        alumnos_conv.push(
                            {
                                estudiante: {
                                    id: alumno.estudiante.id,
                                    nombre: alumno.estudiante.nombre,
                                    apellido_1: alumno.estudiante.apellido_1,
                                    apellido_2: alumno.estudiante.apellido_2,
                                    DNI: alumno_DNI_trans!,
                                    email: alumno.estudiante.email,
                                    universidad: alumno.estudiante.universidad,
                                    curso_admision: alumno.estudiante.curso_admision,
                                    rol: alumno.estudiante.rol,
                                },
                                convocatoria_name: alumno.convocatoria_name,
                                convocatoria_num: alumno.convocatoria_num,
                                nota: alumno.nota,
                                tipo: alumno.tipo
                            }
                        );
                        
                        estudiantes_aux.push(
                            {
                                alumno: alumno.estudiante.id,
                                presentado: false,
                                nota: "No presentado",
                                convocatoria_num: alumno.convocatoria_num,
                            }
                        );
                    });
                }
            }

            setEstudiantes(estudiantes_aux);
            setAlumnos(alumnos_conv);

            if(TFG_conv === "Extraordinaria" && data_curso.alumnos_extraordinaria.length === 0){
                const url_extra = `https://tfg-back-end.onrender.com/curso/calificar_convocatoria`;
               
                const response_extra = await fetch(url_extra, {
                    method: "POST",
                    body: JSON.stringify(
                        {
                            asignatura: TFG_asig,
                            curso: TFG_curso,
                            convocatoria: TFG_conv,
                            notas: [],
                        }
                    ),
                });

                if(response_extra.status !== 200){
                    const error = await response_extra.json();

                    alert(error.error);
                }
                else{
                    const data = await response_extra.json();
                    
                    alert(data.message);
                }

                globalThis.location.href = "/mostrarAsignaturas"
            }
        }

        getAlumnos();

    }, []);

    const handlePresentado = (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>, user: string) => {
        const estudiantes_aux: {
            alumno: string,
            presentado: boolean,
            nota: (string | number),
            convocatoria_num: string,
        }[] = []

        estudiantes.forEach((alumno) => {
            if(alumno.alumno === user){
                if(e.currentTarget.value === "Si"){
                    estudiantes_aux.push(
                        {
                            alumno: alumno.alumno,
                            presentado: true,
                            nota: 5,
                            convocatoria_num: alumno.convocatoria_num,
                        }
                    );
                }
                else if(e.currentTarget.value === "No"){
                    estudiantes_aux.push(
                        {
                            alumno: alumno.alumno,
                            presentado: false,
                            nota: "No presentado",
                            convocatoria_num: alumno.convocatoria_num,
                        }
                    );
                }
            }
            else{
                estudiantes_aux.push(alumno);
            }

            setEstudiantes(estudiantes_aux);
        });
    }

    const handleCalificar = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>, user: string) => {
        const estudiantes_aux: {
            alumno: string,
            presentado: boolean,
            nota: (string | number),
            convocatoria_num: string,
        }[] = [];

        estudiantes.forEach((alumno) => {
            if(alumno.alumno === user){
                if(Number(e.currentTarget.value) >= 10){
                    estudiantes_aux.push(
                        {
                            alumno: alumno.alumno,
                            presentado: alumno.presentado,
                            nota: 10,
                            convocatoria_num: alumno.convocatoria_num,
                        }
                    );
                }
                else if(Number(e.currentTarget.value) <= 0){
                    estudiantes_aux.push(
                        {
                            alumno: alumno.alumno,
                            presentado: alumno.presentado,
                            nota: 0,
                            convocatoria_num: alumno.convocatoria_num,
                        }
                    );
                }
                else{
                    estudiantes_aux.push(
                        {
                            alumno: alumno.alumno,
                            presentado: alumno.presentado,
                            nota: Number(e.currentTarget.value),
                            convocatoria_num: alumno.convocatoria_num,
                        }
                    );
                }
            }
            else{
                estudiantes_aux.push(alumno);
            }

            setEstudiantes(estudiantes_aux);
        });
    }

    const handleSend = async () => {
        setButtonAction(true);
        
        const body = {
            asignatura: asignatura,
            curso: curso,
            convocatoria: convocatoria,
            notas: estudiantes,
            academico: academico,
        }

        NProgress.start();
                    
        try{
            const url_notas = `https://tfg-back-end.onrender.com/curso/calificar_convocatoria`;
            const response_notas = await fetch(url_notas, {
                method: "POST",
                body: JSON.stringify(body),
            });

            if(response_notas.status !== 200){
                const error = await response_notas.json();
                
                alert(error.error);
                
                setButtonAction(false);
            }
            else{
                const data = await response_notas.json();
                    
                setMessage(data.message);
                setCreationSuccess(true);
            }
        }
        finally{
            NProgress.done();
        }
    }

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
                {
                    creationSuccess === false &&
                    <div className="newNotas">
                        {
                            alumnos !== undefined && alumnos.length > 0 &&
                            <>
                                <h1>Calificación de la convocatoria {convocatoria.toLowerCase()} de {nombreAsignatura}</h1>
                                <table className="tablaNotas">
                                    <thead>
                                        <tr>
                                            <th>Nombre completo</th>
                                            <th>Email</th>
                                            <th>DNI</th>
                                            <th>Presentado</th>
                                            <th>Calificacion</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            alumnos.map((alumno) => {
                                                const estudiante = estudiantes.find((estudiante) => {
                                                    if(alumno.estudiante.id === estudiante.alumno){
                                                        return estudiante;
                                                    }
                                                })

                                                if(estudiante === undefined){
                                                    alert("Estudiante no encontrado");

                                                    globalThis.location.href = "/paginaAsignatura";
                                                }

                                                return(
                                                    <tr key={alumno.estudiante.id}>
                                                        <td>
                                                            {
                                                                alumno.estudiante.apellido_2 !== undefined && alumno.estudiante.apellido_2 !== null && alumno.estudiante.apellido_2.trim() !== "" && 
                                                                <>{alumno.estudiante.nombre} {alumno.estudiante.apellido_1} {alumno.estudiante.apellido_2}</>
                                                            }
                                                            {
                                                                (alumno.estudiante.apellido_2 === undefined || alumno.estudiante.apellido_2 === null || alumno.estudiante.apellido_2.trim() === "") && 
                                                                <>{alumno.estudiante.nombre} {alumno.estudiante.apellido_1}</>
                                                            }
                                                        </td>
                                                        <td>
                                                            {alumno.estudiante.email}
                                                        </td>
                                                        <td>
                                                            {alumno.estudiante.DNI}
                                                        </td>
                                                        <td>
                                                            <select defaultValue={estudiante!.presentado === true ? "Si" : "No"} onChange={(e) => {
                                                                handlePresentado(e, estudiante!.alumno);
                                                            }}>
                                                                <option value="No">No</option>
                                                                <option value="Si">Si</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            {
                                                                estudiante!.presentado === false &&
                                                                <p>No presentado</p>
                                                            }
                                                            {
                                                                estudiante!.presentado === true &&
                                                                <input
                                                                    type="number"
                                                                    defaultValue={estudiante!.nota} min={0} max={10} step={0.1}
                                                                    onChange={(e) => handleCalificar(e, estudiante!.alumno)}
                                                                />
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                                <br/>
                            </>
                        }
                        <div className="buttonsNotas">
                            <button type="button" onClick={() => globalThis.location.href = "/paginaAsignatura"}>Volver</button>
                            <button type="button" disabled={buttonAction} onClick={handleSend}>Enviar</button>
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
                            <button type="button" onClick={() => globalThis.location.href = "/paginaAsignatura"}>Continuar</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default NewNotas;