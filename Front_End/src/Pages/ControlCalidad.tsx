import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import SidebarCoordinador from "../Sidebar/SidebarCoordinador.tsx";
import Header from "../Header/Header.tsx";
import type { Administrativo_Short } from "../types/Personas/Administrativo.ts";
//import type { Coordinador } from "../types/Personas/Coordinador.ts";
import { PieChart, Pie, Tooltip, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

function ControlCalidad() {
    const [curso, setCurso] = useState("");

    const [titulacion, setTitulacion] = useState("");
    const [universidad, setUniversidad] = useState("");

    const [rol, setRol] = useState("");
    const [universidadesDisponibles, setUniversidadesDisponibles] = useState<string[]>([]);
    const [cursosDisponibles, setCursosDisponibles] = useState<string[]>([]);
    const [data, setData] = useState<{
        creditos_matriculados: number,
        creditos_presentados: number,
        creditos_aprobados: number,
        tasa_rendimiento: number | null,
        tasa_evaluacion: number | null,
        tasa_exito: number | null,
    }>();

    const [datosPieChart, setDatosPieChart] = useState<{nombre: string, valor: number, fill: string}[]>();
    const [datosBarChart, setDatosBarChart] = useState<{nombre: string, valor: number, fill: string}[]>([]);

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
            setRol(data_user.rol);

            if(data_user.rol !== "Coordinador" && data_user.rol !== "Coordinador general"){
                alert("Tienes que ser un coordinador para poder ver los datos para hacer el control de calidad");
                globalThis.location.href = "/paginaPersonal";
            }

            if(data_user.rol === "Coordinador"){
                setUniversidad(data_user.universidad);
            }
            else if(data_user.rol === "Coordinador general"){
                setUniversidad("");
            }

            const TFG_titulacion = Cookie.get("TFG_titulacion");

            if(TFG_titulacion === undefined){
                globalThis.location.href = "/paginaPersonal"
            }

            setTitulacion(TFG_titulacion!);

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

            const namesUnis: string[] = [];
            data_titulacion.universidades.forEach((uni: {nombre: string,principal: boolean}) => {
                namesUnis.push(uni.nombre);
            });

            setUniversidadesDisponibles(namesUnis);

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
            
            if(date.getMonth() + 1 <= 9){
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
        }

        getData();
    }, []);

    const handleChangeUniversidad = async (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
        setUniversidad(e.currentTarget.value);
        const url_controlCalidad = `https://tfg-back-end.onrender.com/titulacion/control_calidad?titulacion=${titulacion}&universidad=${e.currentTarget.value}&curso=${curso}`;

        if(e.currentTarget.value.trim() !== "" && curso.trim() !== ""){
            await handleDatos(url_controlCalidad);
        }
    }

    const handleChangeCurso = async (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
        setCurso(e.currentTarget.value);
        const url_controlCalidad = `https://tfg-back-end.onrender.com/titulacion/control_calidad?titulacion=${titulacion}&universidad=${universidad}&curso=${e.currentTarget.value}`;

        if(universidad.trim() !== "" && e.currentTarget.value.trim() !== ""){
            await handleDatos(url_controlCalidad);
        }
    }

    const handleDatos = async (url: string) => {
        const response_controlCalidad = await fetch(url, {
            method: "GET",
        });

        if(response_controlCalidad.status !== 200){
            const error = await response_controlCalidad.json();
            alert(error.error);
        }

        const data_calidad = await response_controlCalidad.json();

        setData(data_calidad);

        const newDatosPieChart: {
            nombre: string,
            valor: number,
            fill: string,
        }[] = [];

        const aprobados = data_calidad.creditos_aprobados;

        newDatosPieChart.push(
            {
                nombre: "Créditos ECTS aprobados",
                valor: aprobados,
                fill: "#FF8042"
            }
        );

        const suspensos = data_calidad.creditos_presentados - aprobados;

        newDatosPieChart.push(
            {
                nombre: "Créditos ECTS suspensos",
                valor: suspensos,
                fill: "green",
            }
        );

        const no_presentados = data_calidad.creditos_matriculados - data_calidad.creditos_presentados;

        newDatosPieChart.push(
            {
                nombre: "Créditos ECTS no presentados",
                valor: no_presentados,
                fill: "#0088FE",
            }
        );

        setDatosPieChart(newDatosPieChart);

        const newDatosBarChart: {
            nombre: string,
            valor: number,
            fill: string,
        }[] = [];

        if(data_calidad.tasa_evaluacion){
            newDatosBarChart.push(
                {
                    nombre: "Tasa de evaluación",
                    valor: Math.round(data_calidad.tasa_evaluacion*100)/100,
                    fill: "black",
                }
            );
        }
        else{
            newDatosBarChart.push(
                {
                    nombre: "Tasa de evaluación",
                    valor: 0,
                    fill: "black",
                }
            );
        }

        if(data_calidad.tasa_exito){
            newDatosBarChart.push(
                {
                    nombre: "Tasa de éxito",
                    valor: Math.round(data_calidad.tasa_exito*100)/100,
                    fill: "grey",
                }
            );
        }
        else{
            newDatosBarChart.push(
                {
                    nombre: "Tasa de éxito",
                    valor: 0,
                    fill: "grey",
                }
            );
        }

        if(data_calidad.tasa_rendimiento){
            newDatosBarChart.push(
                {
                    nombre: "Tasa de rendimiento",
                    valor: Math.round(data_calidad.tasa_rendimiento*100)/100,
                    fill: "white",
                }
            );
        }
        else{
            newDatosBarChart.push(
                {
                    nombre: "Tasa de rendimiento",
                    valor: 0,
                    fill: "white",
                }
            );
        }

        if(data_calidad.tasa_egresados !== "-" && data_calidad.tasa_egresados !== null){
            newDatosBarChart.push(
                {
                    nombre: "Tasa de egresados",
                    valor: Math.round(data_calidad.tasa_egresados*100)/100,
                    fill: "#00C49F",
                }
            );
        }
        else{
            newDatosBarChart.push(
                {
                    nombre: "Tasa de egresados",
                    valor: 0,
                    fill: "#00C49F",
                }
            );
        }

        setDatosBarChart(newDatosBarChart);
    };

    return(
        <div className="finalPage">
            <Header/>
            <div className="totalPage">
                <SidebarCoordinador/>
                <div className="controlCalidadPage">
                    <form className="controlCalidadMenu">
                        <h1>Métricas para el control de calidad</h1>
                        {
                            rol === "Coordinador general" &&
                            <div className="column">
                                <label>Seleccione una universidad:</label>
                                <select value={universidad} onChange={(e) => handleChangeUniversidad(e)}>
                                    <option value="">Seleccione una universidad</option>
                                    <option value="Todas">Todas</option>
                                    {
                                        universidadesDisponibles.map((uni) => {
                                            return(
                                                <option key={uni} value={uni}>{uni}</option>
                                            );
                                        })
                                    }
                                </select>
                            </div>
                        }
                        <div className="column">
                            <label>Seleccione un curso académico:</label>
                            <select value={curso} onChange={(e) => handleChangeCurso(e)}>
                                <option value="">Seleccione un curso</option>
                                {
                                    cursosDisponibles.map((curso) => {
                                        return(
                                            <option key={curso} value={curso}>{curso}</option>
                                        );
                                    })
                                }
                            </select>
                        </div>
                        <div className="buttons">
                            <button type="button" onClick={() => globalThis.location.href = "/paginaPersonal"}>Volver</button>
                            {
                                //<button type="reset" onClick={() => {handleReset}}>Reiniciar campos</button>
                            }
                        </div>
                    </form>
                    {
                        universidad.trim() !== "" && curso.trim() !== "" && (data !== undefined && (data.tasa_evaluacion === null || data.tasa_exito === null || data.tasa_rendimiento === null)) &&
                        <div style={{marginTop: "15dvh"}}>
                            <h1>No hay datos para el {curso.toLowerCase()}</h1> 
                        </div>
                    }
                    {
                        universidad.trim() !== "" && curso.trim() !== "" && (data !== undefined && (data !== undefined && data.tasa_evaluacion !== null && data.tasa_exito !== null && data.tasa_rendimiento !== null)) &&
                        <div className="graficos">
                            <PieChart width={600} height={300}>
                                <Pie
                                    data={datosPieChart}
                                    dataKey="valor"
                                    nameKey="nombre"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    labelLine={false}
                                />
                                <Tooltip/>
                                <Legend/>
                            </PieChart>
                            <BarChart
                                width={600}
                                height={300}
                                data={datosBarChart}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nombre"/>
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="valor"/>
                            </BarChart>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default ControlCalidad;