import { AsignaturasCollection, PersonasCollection } from "../../db/connection.ts";
import { AsignaturaDB } from "../../types/Asignaturas/Asignatura.ts";
import { TFM_Block_Short } from "../../types/Asignaturas/TFM.ts";
import { AdministrativoDB } from "../../types/Personas/Administrativo.ts";
import { Coordinador_Short, CoordinadorDB } from "../../types/Personas/Coordinador.ts";
import { EstudianteDB } from "../../types/Personas/Estudiante.ts";
import { Profesor_Short, ProfesorDB } from "../../types/Personas/Profesor.ts";
import { Titulacion_Short, TitulacionDB } from "../../types/Titulacion/Titulacion.ts";
import { Short_Asignatura_DB } from "../Asignaturas/utils_Asignaturas.ts";
import { Short_TFM_Block } from "../Asignaturas/utils_TFM.ts";
import { Short_Administrativo_DB } from "../Personas/utils_Administrativos.ts";
import { Short_Coordinador_DB } from "../Personas/utils_Coordinadores.ts";
import { Short_Estudiante_DB } from "../Personas/utils_Estudiantes.ts";
import { Short_Profesor_DB } from "../Personas/utils_Profesores.ts";

export const Transform_Titulacion = async (titulacion: TitulacionDB): Promise<Response> => {
    const asignaturas = await AsignaturasCollection.find({_id: {$in: titulacion.asignaturas}}).toArray();
    
    if(titulacion.asignaturas.length !== asignaturas.length){
        return new Response(
            JSON.stringify({error: `${titulacion.asignaturas.length - asignaturas.length} asignaturas no encontradas`}),
            {
                status: 404,
            }
        );
    }

    asignaturas.forEach((asignatura) => {
        if(asignatura.tipo !== "Asignatura"){
            return new Response(
                JSON.stringify({error: `Bloque de TFMs con id ${asignatura._id} encontrado en vez de asignatura`}),
                {
                    status: 406,
                }
            );
        }
    });

    const TFM = await AsignaturasCollection.findOne({_id: titulacion.TFM});

    if(!TFM){
        return new Response(
            JSON.stringify({error: `Grupo de TFMs con id ${titulacion.TFM} no encontrado`}),
            {
                status: 404,
            }
        );
    }
    else if(TFM.tipo !== "Bloque TFMs"){
        return new Response(
            JSON.stringify({error: `Asignatura con id ${TFM._id} encontrada en vez de bloque de TFMs`}),
            {
                status: 406,
            }
        );
    }

    const TFM_info = await Short_TFM_Block(TFM);

    if(TFM_info.status !== 200){
        return new Response(
            JSON.stringify(await TFM_info.json()),
            {
                status: TFM_info.status,
            }
        );
    }

    const TFM_parse: TFM_Block_Short = await TFM_info.json();

    const administrativos = await PersonasCollection.find({_id: {$in: titulacion.administrativos}}).toArray();

    if(titulacion.administrativos.length !== administrativos.length){
        return new Response(
            JSON.stringify({error: `${titulacion.administrativos.length - administrativos.length} administrativos no encontrados`}),
            {
                status: 404,
            }
        );
    }
    
    const bad_admin = administrativos.find((administrativo) => {
        if(administrativo.rol !== "Administrativo"){
            return administrativo;
        }
    });

    if(bad_admin !== undefined){
        return new Response(
            JSON.stringify({error: `Persona con id ${bad_admin._id} no tiene rol de 'Administrativo', sino ${bad_admin.rol}`}),
            {
                status: 406,
            }
        );
    }

    const docentes = await PersonasCollection.find({_id: {$in: titulacion.docentes}}).toArray();

    if(titulacion.docentes.length !== docentes.length){
        return new Response(
            JSON.stringify({error: `${titulacion.docentes.length - docentes.length} docentes no encontrados`}),
            {
                status: 404,
            }
        );
    }

    const docentes_transform: (Profesor_Short | Coordinador_Short)[] = []
    const bad_doc = docentes.find((docente) => {
        if(docente.rol !== "Coordinador" && docente.rol !== "Coordinador general" && docente.rol !== "Profesor"){
            return docente;
        }

        if(docente.rol === "Profesor"){
            docentes_transform.push(Short_Profesor_DB(docente as ProfesorDB));
        }
        else if(docente.rol === "Coordinador" || docente.rol === "Coordinador general"){
            docentes_transform.push(Short_Coordinador_DB(docente as CoordinadorDB));
        }
    });

    if(bad_doc !== undefined){
        return new Response(
            JSON.stringify({error: `Persona con id ${bad_doc._id} no tiene rol de 'Coordinador' ni el de 'Profesor', sino ${bad_doc.rol}`}),
            {
                status: 406,
            }
        );
    }

    const alumnos = await PersonasCollection.find({_id: {$in: titulacion.alumnos}}).toArray();

    if(titulacion.alumnos.length !== alumnos.length){
        return new Response(
            JSON.stringify({error: `${titulacion.alumnos.length - alumnos.length} alumnos no encontrados`}),
            {
                status: 404,
            }
        );
    }

    const bad_alum = alumnos.find((alumno) => {
        if(alumno.rol !== "Estudiante"){
            return alumno;
        }
    });

    if(bad_alum !== undefined){
        return new Response(
            JSON.stringify({error: `Persona con id ${bad_alum._id} no tiene rol de 'Estudiante', sino ${bad_alum.rol}`}),
            {
                status: 406,
            }
        );
    }

    return new Response(
        JSON.stringify(
            {
                id: titulacion._id!.toString(),
                nombre: titulacion.nombre,
                universidades: titulacion.universidades,
                grados_aptos: titulacion.grados_aptos,
                cursos: titulacion.cursos,
                convocatorias_disponibles: titulacion.convocatorias_disponibles,
                asignaturas: asignaturas.map((asignatura) => Short_Asignatura_DB(asignatura as AsignaturaDB)),
                TFM: TFM_parse,
                administrativos: administrativos.map((administrativo) => Short_Administrativo_DB(administrativo as AdministrativoDB)),
                docentes: docentes_transform,
                alumnos: alumnos.map((alumno)  => Short_Estudiante_DB(alumno as EstudianteDB)),
            }
        ),
        {
            status: 200,
        }
    );
}

export const Short_Titulacion = (titulacion: TitulacionDB): Titulacion_Short => {
    return(
        {
            id: titulacion._id!.toString(),
            nombre: titulacion.nombre,
            TFM: titulacion.TFM.toString(),
        }
    );
}