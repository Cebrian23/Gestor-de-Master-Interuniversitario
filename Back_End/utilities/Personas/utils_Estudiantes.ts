import { ObjectId } from "npm:mongodb";
import { Asignatura_alumno, Asignatura_alumno_DB } from "../../types/Asignaturas/Asignatura.ts";
import { TFM_alumno, TFM_alumno_DB } from "../../types/Asignaturas/TFM.ts";
import { Estudiante, Estudiante_Short, EstudianteDB } from "../../types/Personas/Estudiante.ts";
import { AsignaturasCollection, PersonasCollection } from "../../db/connection.ts";
import { Transform_Asignatura_alumno_DB, Transform_Asignaturas_MatriculadasPresentadas } from "../Asignaturas/utils_Asignaturas.ts";
import { Transform_TFM_alumno_DB, Transform_TFM_MatriculadosPresentados } from "../Asignaturas/utils_TFM.ts";

export const Transform_Estudiante = async (estudiante: EstudianteDB): Promise<Response> => {
    const convocatorias_asig_cursadasDB: Asignatura_alumno_DB[] = [];
    const convocatorias_tfm_cursadasDB: TFM_alumno_DB[] = [];

    estudiante.convocatorias_cursadas.forEach((conv) => {
        if(conv.tipo === "Asignatura"){
            convocatorias_asig_cursadasDB.push(conv)
        }
        else if(conv.tipo === "TFM"){
            convocatorias_tfm_cursadasDB.push(conv);
        }
    });

    const convocatorias_asig_cursadas_response = await Promise.all(convocatorias_asig_cursadasDB.map(async (asig) => await Transform_Asignatura_alumno_DB(asig)));
    const convocatorias_tfm_cursadas_response = await Promise.all(convocatorias_tfm_cursadasDB.map(async (tfm) => await Transform_TFM_alumno_DB(tfm)));

    const convocatoria_asig_error = convocatorias_asig_cursadas_response.find((conv) => {
        if(conv.status !== 200){
            return conv;
        }
    });

    if(convocatoria_asig_error !== undefined){
        return new Response(
            JSON.stringify(await convocatoria_asig_error.json()),
            {
                status: convocatoria_asig_error.status,
            }
        );
    }

    const convocatorias_tfm_error = convocatorias_tfm_cursadas_response.find((conv) => {
        if(conv.status !== 200){
            return conv;
        }
    });

    if(convocatorias_tfm_error !== undefined){
        return new Response(
            JSON.stringify(await convocatorias_tfm_error.json()),
            {
                status: convocatorias_tfm_error.status,
            }
        );
    }

    const convocatorias_cursadas: (TFM_alumno | Asignatura_alumno)[] = [];

    const convocatorias_asig_cursadas: Asignatura_alumno[] = await Promise.all(convocatorias_asig_cursadas_response.map(async (conv) => {
        const response = await conv.json();

        return{
            id: response.id,
            asignatura: response._id.toString(),
            convocatoria_name: response.convocatoria_name,
            convocatoria_num: response.convocatoria_num,
            curso: response.curso,
            nota: response.nota,
            tipo: response.tipo,
        }
    }));
    convocatorias_asig_cursadas.forEach((conv) => convocatorias_cursadas.push(conv));

    const convocatorias_tfm_cursadas: TFM_alumno[] = await Promise.all(convocatorias_tfm_cursadas_response.map(async (conv) => {
        const response = await conv.json();

        return{
            TFM: response.id,
            bloque: response.bloque,
            titulo: response.titulo,
            curso_academico: response.curso_academico,
            fecha_defensa: response.fecha_defensa,
            convocatoria: response.convocatoria,
            tipo: response.tipo,
        }
    }));
    convocatorias_tfm_cursadas.forEach((conv) => convocatorias_cursadas.push(conv));

    const asignaturas_aprobadasDB: Asignatura_alumno_DB[] = [];
    const tfm_aprobadosDB: TFM_alumno_DB[] = [];

    estudiante.asignaturas_aprobadas.forEach((asig) => {
        if(asig.tipo === "Asignatura"){
            asignaturas_aprobadasDB.push(asig);
        }
        else if(asig.tipo === "TFM"){
            tfm_aprobadosDB.push(asig);
        }
    });

    const asignaturas_aprobadas_response = await Promise.all(convocatorias_asig_cursadasDB.map(async (asig) => await Transform_Asignatura_alumno_DB(asig)));
    const tfm_aprobados_response = await Promise.all(convocatorias_tfm_cursadasDB.map(async (tfm) => await Transform_TFM_alumno_DB(tfm)));

    const asignaturas_aprobadas_error = asignaturas_aprobadas_response.find((conv) => {
        if(conv.status !== 200){
            return conv;
        }
    });

    if(asignaturas_aprobadas_error !== undefined){
        return new Response(
            JSON.stringify(await asignaturas_aprobadas_error.json()),
            {
                status: asignaturas_aprobadas_error.status,
            }
        );
    }

    const tfm_aprobados_error = tfm_aprobados_response.find((conv) => {
        if(conv.status !== 200){
            return conv;
        }
    });

    if(tfm_aprobados_error !== undefined){
        return new Response(
            JSON.stringify(await tfm_aprobados_error.json()),
            {
                status: tfm_aprobados_error.status,
            }
        );
    }

    const asigs_aprobadas: (TFM_alumno | Asignatura_alumno)[] = [];

    const asignaturas_aprobadas: Asignatura_alumno[] = await Promise.all(convocatorias_asig_cursadas_response.map(async (conv) => {
        const response = await conv.json();

        return{
            id: response.id,
            asignatura: response._id.toString(),
            convocatoria_name: response.convocatoria_name,
            convocatoria_num: response.convocatoria_num,
            curso: response.curso,
            nota: response.nota,
            tipo: response.tipo,
        }
    }));
    asignaturas_aprobadas.forEach((conv) => asigs_aprobadas.push(conv));

    const tfms_aprobados: TFM_alumno[] = await Promise.all(convocatorias_tfm_cursadas_response.map(async (conv) => {
        const response = await conv.json();

        return{
            TFM: response.id,
            bloque: response.bloque,
            titulo: response.titulo,
            curso_academico: response.curso_academico,
            fecha_defensa: response.fecha_defensa,
            convocatoria: response.convocatoria,
            tipo: response.tipo,
        }
    }));
    tfms_aprobados.forEach((conv) => asigs_aprobadas.push(conv));

    const asignaturas_presentadasDB: {
        asignatura: ObjectId;
        curso_academico: string;
        tipo: "Asignatura";
    }[] = [];
    const tfm_presentadosDB: {
        asignatura: ObjectId;
        curso_academico: string;
        tipo: "TFM";
    }[] = [];

    estudiante.asignaturas_presentadas.forEach((asig) => {
        if(asig.tipo === "Asignatura"){
            asignaturas_presentadasDB.push(
                {
                    asignatura: asig.asignatura,
                    curso_academico: asig.curso_academico,
                    tipo: asig.tipo,
                }
            );
        }
        else if(asig.tipo === "TFM"){
            tfm_presentadosDB.push(
                {
                    asignatura: asig.asignatura,
                    curso_academico: asig.curso_academico,
                    tipo: asig.tipo,
                }
            );
        }
    });

    const asignaturas_presentados_response = await Promise.all(asignaturas_presentadasDB.map(async (asig) => await Transform_Asignaturas_MatriculadasPresentadas(asig)));
    const tfm_presentados_response = await Promise.all(tfm_presentadosDB.map(async (tfm) => await Transform_TFM_MatriculadosPresentados(tfm)));

    const asignaturas_presentadas_error = asignaturas_presentados_response.find((asig) => {
        if(asig.status !== 200){
            return asig;
        }
    });

    if(asignaturas_presentadas_error !== undefined){
        return new Response(
            JSON.stringify(await asignaturas_presentadas_error.json()),
            {
                status: asignaturas_presentadas_error.status,
            }
        );
    }

    const asignaturas_presentadas: {
        asignatura: string,
        curso_academico: string,
        tipo: "Asignatura",
    }[] = await Promise.all(asignaturas_presentados_response.map(async (asig) => {
        const response = await asig.json();

        return{
            asignatura: response.asignatura,
            curso_academico: response.curso_academico,
            tipo: response.tipo,
        }
    }));

    const tfm_presentadas_error = tfm_presentados_response.find((asig) => {
        if(asig.status !== 200){
            return asig;
        }
    });

    if(tfm_presentadas_error !== undefined){
        return new Response(
            JSON.stringify(await tfm_presentadas_error.json()),
            {
                status: tfm_presentadas_error.status,
            }
        );
    }

    const tfm_presentados: {
        asignatura: string,
        curso_academico: string,
        tipo: "Asignatura",
    }[] = await Promise.all(tfm_presentados_response.map(async (asig) => {
        const response = await asig.json();

        return{
            asignatura: response.asignatura,
            curso_academico: response.curso_academico,
            tipo: response.tipo,
        }
    }));

    const asigs_presentadas: {
        asignatura: string,
        curso_academico: string,
        tipo: "Asignatura" | "TFM",
    }[] = [];

    asignaturas_presentadas.forEach((asig) => asigs_presentadas.push(asig));
    tfm_presentados.forEach((asig) => asigs_presentadas.push(asig));

    const asignaturas_matriculadasDB: {
        asignatura: ObjectId;
        curso_academico: string;
        tipo: "Asignatura";
    }[] = [];
    const tfm_matriculadosDB: {
        asignatura: ObjectId;
        curso_academico: string;
        tipo: "TFM";
    }[] = [];

    estudiante.asignaturas_matriculadas.forEach((asig) => {
        if(asig.tipo === "Asignatura"){
            asignaturas_matriculadasDB.push(
                {
                    asignatura: asig.asignatura,
                    curso_academico: asig.curso_academico,
                    tipo: asig.tipo,
                }
            );
        }
        else if(asig.tipo === "TFM"){
            tfm_matriculadosDB.push(
                {
                    asignatura: asig.asignatura,
                    curso_academico: asig.curso_academico,
                    tipo: asig.tipo,
                }
            );
        }
    });

    const asignaturas_matriculadas_response = await Promise.all(asignaturas_matriculadasDB.map(async (asig) => await Transform_Asignaturas_MatriculadasPresentadas(asig)));
    const tfm_matriculados_response = await Promise.all(tfm_matriculadosDB.map(async (tfm) => await Transform_TFM_MatriculadosPresentados(tfm)));

    const asignaturas_matriculadas_error = asignaturas_matriculadas_response.find((asig) => {
        if(asig.status !== 200){
            return asig;
        }
    });

    if(asignaturas_matriculadas_error !== undefined){
        return new Response(
            JSON.stringify(await asignaturas_matriculadas_error.json()),
            {
                status: asignaturas_matriculadas_error.status,
            }
        );
    }

    const asignaturas_matriculadas: {
        asignatura: string,
        curso_academico: string,
        tipo: "Asignatura",
    }[] = await Promise.all(asignaturas_matriculadas_response.map(async (asig) => {
        const response = await asig.json();

        return{
            asignatura: response.asignatura,
            curso_academico: response.curso_academico,
            tipo: response.tipo,
        }
    }));

    const tfm_matriculados_error = tfm_matriculados_response.find((asig) => {
        if(asig.status !== 200){
            return asig;
        }
    });

    if(tfm_matriculados_error !== undefined){
        return new Response(
            JSON.stringify(await tfm_matriculados_error.json()),
            {
                status: tfm_matriculados_error.status,
            }
        );
    }

    const tfm_matriculados: {
        asignatura: string,
        curso_academico: string,
        tipo: "TFM",
    }[] = await Promise.all(tfm_matriculados_response.map(async (asig) => {
        const response = await asig.json();

        return{
            asignatura: response.asignatura,
            curso_academico: response.curso_academico,
            tipo: response.tipo,
        }
    }));

    const asigs_matriculadas: {
        asignatura: string,
        curso_academico: string,
        tipo: "Asignatura" | "TFM",
    }[] = [];

    asignaturas_matriculadas.forEach((asig) => asigs_matriculadas.push(asig));
    tfm_matriculados.forEach((asig) => asigs_matriculadas.push(asig));

    const persona: Estudiante = {
        id: estudiante._id!.toString(),
        nombre: estudiante.nombre,
        apellido_1: estudiante.apellido_1,
        apellido_2: estudiante.apellido_2,
        email: estudiante.email,
        universidad: estudiante.universidad,
        grado_academico: estudiante.grado_academico,
        curso_admision: estudiante.curso_admision,
        graduado: estudiante.graduado,
        convocatorias_cursadas: convocatorias_cursadas,
        asignaturas_matriculadas: asigs_matriculadas,
        asignaturas_presentadas: asigs_presentadas,
        asignaturas_aprobadas: asigs_aprobadas,
        rol: "Estudiante",
    }

    return new Response(
        JSON.stringify(persona),
        {
            status: 200,
        }
    );
}

export const Short_Estudiante_DB = (estudiante: EstudianteDB): Estudiante_Short => {
    return{
        id: estudiante._id!.toString(),
        nombre: estudiante.nombre,
        apellido_1: estudiante.apellido_1,
        apellido_2: estudiante.apellido_2,
        DNI: estudiante.DNI,
        email: estudiante.email,
        universidad: estudiante.universidad,
        curso_admision: estudiante.curso_admision,
        rol: "Estudiante",
    }
}

export const Short_Estudiante_ID = async (estudiante: ObjectId): Promise<Response> => {
    const estudiante_exists = await PersonasCollection.findOne({_id: estudiante});

    if(!estudiante_exists){
        return new Response(
            JSON.stringify({error: "Estudiante no encontrado"}),
            {
                status: 404,
            }
        );
    }
    else if(estudiante_exists.rol !== "Estudiante"){
        return new Response(
            JSON.stringify({error: `Se ha encontrado un ${estudiante_exists.rol.toLowerCase()} en vez de un estudiante`}),
            {
                status: 406,
            }
        );
    }

    return new Response(
        JSON.stringify(
            {
                id: estudiante_exists._id!.toString(),
                nombre: estudiante_exists.nombre,
                apellido_1: estudiante_exists.apellido_1,
                apellido_2: estudiante_exists.apellido_2,
                DNI: estudiante_exists.DNI,
                email: estudiante_exists.email,
                universidad: estudiante_exists.universidad,
                curso_admision: estudiante_exists.curso_admision,
                rol: "Estudiante",
            }
        ),
        {
            status: 200,
        }
    )
}

/*export const Transform_Estudiante = (estudiante: EstudianteDB): Response => {
    const asignaturas_matriculadas: {
        asignatura: ObjectId,
        curso_academico: string,
        tipo: "Asignatura" | "TFM",
    }[] = [];
    const asignaturas_presentadas: {
        asignatura: ObjectId,
        curso_academico: string,
        tipo: "Asignatura" | "TFM",
    }[] = [];
    const convocatorias_cursadas: (Asignatura_alumno | TFM_alumno)[] = [];
    const asignaturas_aprobadas: (Asignatura_alumno | TFM_alumno)[] = [];

    const alum_asig_cursadas: Asignatura_alumno_DB[] = [];
    const alum_TFM_cursados: TFM_alumno_DB[] = [];

    estudiante.asignaturas_aprobadas.forEach((asig) => {
        if(asig.tipo === "Asignatura"){
            alum_asig_cursadas.push(asig);
        }
        else{
            alum_TFM_cursados.push(asig);
        }
    });

    const alum_asig_cursadas_final: Asignatura_alumno_DB[] = [];

    alum_asig_cursadas.forEach(async (asig) => {
        const asignatura_exists = await AsignaturasCollection.findOne({_id: asig.asignatura});

        if(!asignatura_exists){
            return new Response(
                JSON.stringify({error: `Asignatura con id ${asig.asignatura} no encontrada`}),
                {
                    status: 404,
                }
            );
        }
        else if(asignatura_exists.tipo !== "Asignatura"){
            return new Response(
                JSON.stringify({error: `Bloque de TFMs con id ${asig.asignatura} encontrado en vez de `}),
                {
                    status: 406,
                }
            );
        }

        const asig_exists = asignatura_exists.cursos_academicos.find((asig_data) => {
            if(asig._id!.toString() === asig_data.id.toString()){
                return asig_data;
            }
        });

        if(asig_exists === undefined){
            return new Response(
                JSON.stringify({error: `Asignatura con id ${asig._id!.toString()} no encontrada`}),
                {
                    status: 404,
                }
            );
        }

        alum_asig_cursadas_final.push(
            {
                _id: asig._id,
                asignatura: asig.asignatura,
                convocatoria_num: asig.convocatoria_num,
                convocatoria_name: asig.convocatoria_name,
                curso: asig.curso,
                nota: asig.nota,
                tipo: "Asignatura",
            }
        );
    });
    
    const alum_TFM_cursadas_final: TFM_alumno_DB[] = [];

    alum_TFM_cursados.forEach(async (tfm) => {
        const bloque_exists = await AsignaturasCollection.findOne({_id: tfm.bloque});

        if(!bloque_exists){
            return new Response(
                JSON.stringify({error: `Bloque de TFMs con id ${tfm.bloque} no encontrado`}),
                {
                    status: 404,
                }
            );
        }
        else if(bloque_exists.tipo !== "Bloque TFMs"){
            return new Response(
                JSON.stringify({error: `Asignatura con id ${tfm.bloque} encontrada en vez de bloque de TFMs`}),
                {
                    status: 406,
                }
            );
        }

        const tfm_exists = bloque_exists.TFMs.find((tfm_data) => {
            if(tfm.TFM === tfm_data._id){
                return tfm_data;
            }
        });

        if(tfm_exists === undefined){
            return new Response(
                JSON.stringify({error: `TFM con id ${tfm.TFM} no encontrado`}),
                {
                    status: 404,
                }
            );
        }

        alum_TFM_cursadas_final.push(
            {
                TFM: tfm_exists._id!,
                bloque: tfm_exists.bloque,
                titulo: tfm.titulo,
                convocatoria: tfm_exists.convocatoria,
                curso_academico: tfm_exists.curso_academico,
                fecha_defensa: tfm_exists.fecha_defensa,
                hora_defensa: tfm_exists.hora_defensa,
                tipo: "TFM",
            }
        );
    });

    if((alum_asig_cursadas_final.length + alum_TFM_cursadas_final.length) !== estudiante.convocatorias_cursadas.length){
        return new Response(
            JSON.stringify({error: `Asignaturas y TFMs cursados no encontrados`}),
            {
                status: 404,
            }
        );
    }

    alum_asig_cursadas_final.forEach((asig) => {
        asignaturas_cursadas.push(
            {
                id: asig._id!.toString(),
                asignatura: asig.asignatura.toString(),
                convocatoria_num: asig.convocatoria_num,
                convocatoria_name: asig.convocatoria_name,
                curso: asig.curso,
                nota: asig.nota,
                tipo: "Asignatura",
            }
        );
    });

    alum_TFM_cursadas_final.forEach((asig) => {
        convocatorias_cursadas.push(
            {
                TFM: asig.TFM.toString(),
                bloque: asig.bloque.toString(),
                titulo: asig.titulo,
                curso_academico: asig.curso_academico,
                fecha_defensa: asig.fecha_defensa,
                convocatoria: asig.convocatoria,
                tipo: "TFM",
            }
        );
    });

    const alum_asig_aprobadas: Asignatura_alumno_DB[] = [];
    const alum_TFM_aprobados: TFM_alumno_DB[] = [];

    estudiante.convocatorias_cursadas.forEach((asig) => {
        if(asig.tipo === "Asignatura"){
            alum_asig_aprobadas.push(asig);
        }
        else{
            alum_TFM_aprobados.push(asig);
        }
    });

    const alum_asig_aprobadas_final: Asignatura_alumno_DB[] = [];

    alum_asig_aprobadas.forEach(async (asig) => {
        const asignatura_exists = await AsignaturasCollection.findOne({_id: asig.asignatura});

        if(!asignatura_exists){
            return new Response(
                JSON.stringify({error: `Asignatura con id ${asig.asignatura} no encontrada`}),
                {
                    status: 404,
                }
            );
        }
        else if(asignatura_exists.tipo !== "Asignatura"){
            return new Response(
                JSON.stringify({error: `Bloque de TFMs con id ${asig.asignatura} encontrado en vez de `}),
                {
                    status: 406,
                }
            );
        }

        const asig_exists = asignatura_exists.cursos_academicos.find((asig_data) => {
            if(asig._id === asig_data.id){
                return asig_data;
            }
        });

        if(asig_exists === undefined){
            return new Response(
                JSON.stringify({error: `Asignatura con id ${asig._id!.toString()} no encontrada`}),
                {
                    status: 404,
                }
            );
        }

        alum_asig_aprobadas_final.push(
            {
                _id: asig._id,
                asignatura: asig.asignatura,
                convocatoria_num: asig.convocatoria_num,
                convocatoria_name: asig.convocatoria_name,
                curso: asig.curso,
                nota: asig.nota,
                tipo: "Asignatura",
            }
        );
    });

    const alum_TFM_aprobados_final: TFM_alumno_DB[] = [];

    alum_TFM_aprobados.forEach(async (tfm) => {
        const bloque_exists = await AsignaturasCollection.findOne({_id: tfm.bloque});

        if(!bloque_exists){
            return new Response(
                JSON.stringify({error: `Bloque de TFMs con id ${tfm.bloque} no encontrado`}),
                {
                    status: 404,
                }
            );
        }
        else if(bloque_exists.tipo !== "Bloque TFMs"){
            return new Response(
                JSON.stringify({error: `Asignatura con id ${tfm.bloque} encontrada en vez de bloque de TFMs`}),
                {
                    status: 406,
                }
            );
        }

        const tfm_exists = bloque_exists.TFMs.find((tfm_data) => {
            if(tfm.TFM === tfm_data._id){
                return tfm_data;
            }
        });

        if(tfm_exists === undefined){
            return new Response(
                JSON.stringify({error: `TFM con id ${tfm.TFM} no encontrado`}),
                {
                    status: 404,
                }
            );
        }

        alum_TFM_aprobados_final.push(
            {
                TFM: tfm_exists._id!,
                bloque: tfm_exists.bloque,
                titulo: tfm.titulo,
                convocatoria: tfm_exists.convocatoria,
                curso_academico: tfm_exists.curso_academico,
                fecha_defensa: tfm_exists.fecha_defensa,
                hora_defensa: tfm_exists.hora_defensa,
                tipo: "TFM",
            }
        );
    });

    if((alum_asig_aprobadas_final.length + alum_TFM_aprobados_final.length) !== estudiante.asignaturas_aprobadas.length){
        return new Response(
            JSON.stringify({error: `Asignaturas y TFMs aprobados no encontrados`}),
            {
                status: 404,
            }
        );
    }
    
    alum_asig_aprobadas_final.forEach((asig) => {
        asignaturas_aprobadas.push(
            {
                id: asig._id!.toString(),
                asignatura: asig.asignatura.toString(),
                convocatoria_num: asig.convocatoria_num,
                convocatoria_name: asig.convocatoria_name,
                curso: asig.curso,
                nota: asig.nota,
                tipo: "Asignatura",
            }
        );
    });

    alum_TFM_aprobados_final.forEach((asig) => {
        asignaturas_aprobadas.push(
            {
                TFM: asig.TFM.toString(),
                bloque: asig.bloque.toString(),
                titulo: asig.titulo,
                curso_academico: asig.curso_academico,
                fecha_defensa: asig.fecha_defensa,
                convocatoria: asig.convocatoria,
                tipo: "TFM",
            }
        );
    });

    return new Response(
        JSON.stringify(
            {
                id: estudiante._id!.toString(),
                nombre: estudiante.nombre,
                apellido_1: estudiante.apellido_1,
                apellido_2: estudiante.apellido_2,
                DNI: estudiante.DNI,
                prefijo_movil: estudiante.prefijo_movil,
                numero_movil: estudiante.numero_movil,
                email: estudiante.email,
                rol: "Estudiante",
                grado_academico: estudiante.grado_academico,
                universidad: estudiante.universidad,
                curso_admision: estudiante.curso_admision,
                convocatorias_cursadas: convocatorias_cursadas,
                asignaturas_aprobadas: asignaturas_aprobadas,
            }
        ),
        {
            status: 200,
        }
    );
}*/
