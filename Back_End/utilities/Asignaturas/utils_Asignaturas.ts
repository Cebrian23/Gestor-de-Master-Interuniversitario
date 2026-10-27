import { ObjectId } from "npm:mongodb";
import { AsignaturasCollection, PersonasCollection } from "../../db/connection.ts";
import { Alumno, AlumnoDB, Asignatura_alumno, Asignatura_alumno_DB, Asignatura_curso_DB, Asignatura_curso_short, Asignatura_Short, AsignaturaDB } from "../../types/Asignaturas/Asignatura.ts";
import { Coordinador_Short } from "../../types/Personas/Coordinador.ts";
import { Estudiante_Short, EstudianteDB } from "../../types/Personas/Estudiante.ts";
import { Profesor_Short } from "../../types/Personas/Profesor.ts";
import { Short_Coordinador_DB } from "../Personas/utils_Coordinadores.ts";
import { Short_Estudiante_DB, Short_Estudiante_ID } from "../Personas/utils_Estudiantes.ts";
import { Short_Profesor_DB } from "../Personas/utils_Profesores.ts";

export const Transform_Curso = async (curso_in: Asignatura_curso_DB): Promise<Response> => {
    const asignatura = await AsignaturasCollection.findOne({cursos_academicos: curso_in});

    if(!asignatura){
        return new Response(
            `Curso con id ${curso_in.id} no encontrado`,
            {
                status: 404,
            }
        );
    }
    else if(asignatura.tipo !== "Asignatura"){
        return new Response(
            JSON.stringify({error: `Bloque de TFMs con id ${asignatura._id} encontrada en vez de asignatura`}),
            {
                status: 406,
            }
        );
    }

    const profesores = await PersonasCollection.find({_id: {$in: curso_in.profesores}}).toArray();
    const docentes: (Profesor_Short | Coordinador_Short)[] = [];

    profesores.forEach((docente) => {
        if(docente.rol === "Coordinador" || docente.rol === "Coordinador general"){
            docentes.push(Short_Coordinador_DB(docente));
        }
        else if(docente.rol === "Profesor"){
            docentes.push(Short_Profesor_DB(docente));
        }
        else{
            return new Response(
                JSON.stringify({error: `Persona con id ${docente._id} no tiene rol de 'Profesor' ni de 'Coordinador', sino ${docente.rol}`}),
                {
                    status: 406,
                }
            );
        }
    });

    const estudiantes = await PersonasCollection.find({_id: {$in: curso_in.estudiantes}}).toArray();
    const alumnos: Estudiante_Short[] = [];

    estudiantes.forEach((estudiante) => {
        if(estudiante.rol === "Estudiante"){
            alumnos.push(Short_Estudiante_DB(estudiante));
        }
        else{
            return new Response(
                JSON.stringify({error: `Persona con id ${estudiante._id} no tiene rol de 'Estudiante', sino ${estudiante.rol}`}),
                {
                    status: 406,
                }
            );
        }
    });

    const estudiantes_ordinaria_id = curso_in.alumnos_ordinaria.map((alumno) => alumno.estudiante);
    const estudiantes_ordinaria = await PersonasCollection.find({_id: {$in: estudiantes_ordinaria_id}}).toArray();

    if(estudiantes_ordinaria_id.length !== estudiantes_ordinaria.length){
        return new Response(
            JSON.stringify({error: `${estudiantes_ordinaria_id.length - estudiantes_ordinaria.length} estudiantes en ordinaria no encontrados`}),
            {
                status: 404,
            }
        );
    }

    const alumnos_ordinaria_response: Response[] = await Promise.all(curso_in.alumnos_ordinaria.map(async (alumno) => {
        const response = await Short_Estudiante_ID(alumno.estudiante);
        
        if(response.status !== 200){
            return new Response(
                JSON.stringify({error: await response.json()}),
                {
                    status: response.status,
                }
            );
        }

        return new Response(
            JSON.stringify(
                {
                    estudiante: await response.json(),
                    convocatoria_name: alumno.convocatoria_name,
                    convocatoria_num: alumno.convocatoria_num,
                    nota: alumno.nota,
                    tipo: alumno.tipo,
                }
            ),
            {
                status: response.status,
            }
        );
    }));

    const ordinaria_error = alumnos_ordinaria_response.find((response) => {
        if(response.status !== 200){
            return response;
        }
    });

    if(ordinaria_error !== undefined){
        return new Response(
            JSON.stringify(await ordinaria_error.json()),
            {
                status: ordinaria_error.status,
            }
        );
    }

    const alumnos_ordinaria: Alumno[] = await Promise.all(alumnos_ordinaria_response.map(async (response) => {
        return await response.json();
    }));

    if(curso_in.alumnos_ordinaria.length !== alumnos_ordinaria.length){
        return new Response(
            JSON.stringify({error: `${curso_in.alumnos_ordinaria.length - alumnos_ordinaria.length} alumnos en ordinaria no encontrados`}),
            {
                status: 404,
            }
        );
    }
    
    const estudiantes_extraordinaria_id = curso_in.alumnos_extraordinaria.map((alumno) => alumno.estudiante);
    const estudiantes_extraordinaria = await PersonasCollection.find({_id: {$in: estudiantes_extraordinaria_id}}).toArray();

    if(estudiantes_extraordinaria.length !== estudiantes_extraordinaria_id.length){
        return new Response(
            JSON.stringify({error: `${estudiantes_extraordinaria_id.length - estudiantes_extraordinaria.length} estudiantes en extraordinaria no encontrados`}),
            {
                status: 404,
            }
        );
    }
    
    const alumnos_extraordinaria_response: Response[] = await Promise.all(curso_in.alumnos_extraordinaria.map(async (alumno) => {
        const response = await Short_Estudiante_ID(alumno.estudiante);
        
        if(response.status !== 200){
            return new Response(
                JSON.stringify({error: await response.json()}),
                {
                    status: response.status,
                }
            );
        }

        return new Response(
            JSON.stringify(
                {
                    estudiante: await response.json(),
                    convocatoria_name: alumno.convocatoria_name,
                    convocatoria_num: alumno.convocatoria_num,
                    nota: alumno.nota,
                    tipo: alumno.tipo,
                }
            ),
            {
                status: response.status,
            }
        );
    }));

    const extraordinaria_error = alumnos_extraordinaria_response.find((response) => {
        if(response.status !== 200){
            return response;
        }
    });

    if(extraordinaria_error !== undefined){
        return new Response(
            JSON.stringify(await extraordinaria_error.json()),
            {
                status: extraordinaria_error.status,
            }
        );
    }

    const alumnos_extraordinaria: Alumno[] = await Promise.all(alumnos_extraordinaria_response.map(async (response) => {
        return await response.json();
    }));

    if(curso_in.alumnos_extraordinaria.length !== alumnos_extraordinaria.length){
        return new Response(
            JSON.stringify({error: `${curso_in.alumnos_extraordinaria.length - alumnos_extraordinaria.length} alumnos en extraordinaria no encontrados`}),
            {
                status: 404,
            }
        );
    }

    return new Response(
        JSON.stringify(
            {
                id: curso_in.id.toString(),
                id_asig: asignatura._id.toString(),
                nombre: asignatura.nombre,
                curso_academico: curso_in.curso_academico,
                profesores: docentes,
                estudiantes: alumnos,
                alumnos_ordinaria: alumnos_ordinaria,
                ordinaria_firmada: curso_in.ordinaria_firmada,
                alumnos_extraordinaria: alumnos_extraordinaria,
                extraordinaria_firmada: curso_in.extraordinaria_firmada,
            }
        ),
        {
            status: 200,
        }
    );
}

export const Transform_Alumno = async (alumno: AlumnoDB): Promise<Response> => {
    const alumno_exists = await PersonasCollection.findOne({_id: alumno.estudiante});

    if(!alumno_exists){
        return new Response(
            JSON.stringify({error: `Alumno con id ${alumno.estudiante} no encontrado`}),
            {
                status: 404,
            }
        );
    }
    else if(alumno_exists.rol !== "Estudiante"){
        return new Response(
            JSON.stringify({error: `Persona con id ${alumno_exists._id} no tiene rol de 'Profesor' ni de 'Coordinador', sino ${alumno_exists.rol}`}),
            {
                status: 406,
            }
        );
    }

    return new Response(
        JSON.stringify(
            {
                estudiante: Short_Estudiante_DB(alumno_exists as EstudianteDB),
                convocatoria_num: alumno.convocatoria_num,
                convocatoria_name: alumno.convocatoria_name,
                nota: alumno.nota,
            }
        ),
        {
            status: 200,
        }
    )
}

export const Get_Alumno_Info = async (alumno: AlumnoDB): Promise<Response> => {
    const id = await PersonasCollection.findOne({_id: alumno.estudiante});

    if(!id){
        return new Response(
            JSON.stringify({error: `Alumno con id ${alumno.estudiante} no encontrado`}),
            {
                status: 404,
            }
        );
    }
    else if(id.rol !== "Estudiante"){
        return new Response(
            JSON.stringify({error: `Persona con id ${id._id} tiene el rol de '${id.rol}', no el de 'Estudiante'`}),
            {
                status: 406,
            }
        );
    }

    return new Response(
        JSON.stringify(
            {
                id: id._id,
                email: id.email,
                DNI: id.DNI,
            }
        ),
        {
            status: 200,
        }
    );
}

export const Short_Asignatura_DB = (asignatura: AsignaturaDB): Asignatura_Short => {
    return {
        id: asignatura._id!.toString(),
        nombre: asignatura.nombre,
        curso: asignatura.curso,
        cursos_academicos: asignatura.cursos_academicos.length,
        creditos: asignatura.creditos,
        optatividad: asignatura.optatividad,
        tipo: "Asignatura",
    }
}

export const Short_Asignatura_ID = async (id: ObjectId): Promise<Response> => {
    const asig_exists = await AsignaturasCollection.findOne({_id: new ObjectId});

    if(!asig_exists){
        return new Response(
            JSON.stringify({error: `Asignatura con id ${id} no encontrada`}),
            {
                status: 404,
            }
        );
    }
    else if(asig_exists.tipo !== "Asignatura"){
        return new Response(
            JSON.stringify({error: `Bloque de TFMs con id ${asig_exists._id} encontrada en vez de asignatura`}),
            {
                status: 406,
            }
        );
    }

    return new Response(
        JSON.stringify(
            {
                id: asig_exists._id!.toString(),
                nombre: asig_exists.nombre,
                curso: asig_exists.curso,
                creditos: asig_exists.creditos,
                tipo: "Asignatura",
            }
        ),
        {
            status: 200,
        }
    )
}

export const Short_Asignatura_Curso_DB = (curso: Asignatura_curso_DB, id: string, name: string): Asignatura_curso_short => {
    return(
        {
            id: curso.id.toString(),
            id_asig: id,
            nombre: name,
            curso_academico: curso.curso_academico,
            tipo: curso.tipo,
        }
    )
}

export const Short_Asignatura_Curso_Docs_DB = async (curso: Asignatura_curso_DB, id: string, name: string): Promise<Response> => {
    const docentesDB = await PersonasCollection.find({_id: {$in: curso.profesores}}).toArray();

    if(curso.profesores.length !== docentesDB.length){
        return new Response(
            JSON.stringify({error: `${curso.profesores.length - docentesDB.length} no encontrados`}),
            {
                status: 404,
            }
        );
    }

    const docente_error = docentesDB.find((docente) => {
        if(docente.rol !== "Coordinador" && docente.rol !== "Coordinador general" && docente.rol !== "Profesor"){
            return docente;
        }
    });

    if(docente_error !== undefined){
        return new Response(
            JSON.stringify({error: `${docente_error.rol} encontrado en vez de un docente con rol de "Coordinador" o "Profesor"`}),
            {
                status: 406,
            }
        );
    }

    const docentes: (Profesor_Short | Coordinador_Short)[] = []
    
    docentesDB.map((docente) => {
        if(docente.rol === "Coordinador" || docente.rol === "Coordinador general"){
            docentes.push(Short_Coordinador_DB(docente));
        }
        else if(docente.rol === "Profesor"){
            docentes.push(Short_Profesor_DB(docente));
        }
    });

    return new Response(
        JSON.stringify(
            {
                id: curso.id.toString(),
                id_asig: id,
                nombre: name,
                curso_academico: curso.curso_academico,
                profesores: docentes,
                tipo: curso.tipo,
            }
        ),
        {
            status: 200,
        }
    )
}

export const Transform_Asignatura_alumno_DB = async (asig: Asignatura_alumno_DB): Promise<Response> => {
    const asignatura = await AsignaturasCollection.findOne({_id: asig.asignatura});
    
    if(!asignatura){
        return new Response(
            JSON.stringify({error: `Asignatura con id ${asig.asignatura} no encontrada`}),
            {
                status: 404,
            }
        );
    }
    else if(asignatura.tipo !== "Asignatura"){
        return new Response(
            JSON.stringify({error: `Se ha encontrado un bloque de TFMs en vez de una asignatura`}),
            {
                status: 406,
            }
        );
    }

    const new_asig: Asignatura_alumno = {
        id: asig._id!.toString(),
        asignatura: asignatura._id.toString(),
        convocatoria_name: asig.convocatoria_name,
        convocatoria_num: asig.convocatoria_num,
        curso: asig.curso,
        nota: asig.nota,
        tipo: asig.tipo,
    }

    return new Response(
        JSON.stringify(new_asig),
        {
            status: 200,
        }
    );
}

export const Transform_Asignaturas_MatriculadasPresentadas = async (asig: {asignatura: ObjectId, curso_academico: string, tipo: "Asignatura"}): Promise<Response> => {
    const asignatura = await AsignaturasCollection.findOne({_id: asig.asignatura});
    
    if(!asignatura){
        return new Response(
            JSON.stringify({error: `Asignatura con id ${asig.asignatura} no encontrada`}),
            {
                status: 404,
            }
        );
    }
    else if(asignatura.tipo !== "Asignatura"){
        return new Response(
            JSON.stringify({error: `Se ha encontrado un bloque de TFMs en vez de una asignatura`}),
            {
                status: 406,
            }
        );
    }

    const new_asig: {
        asignatura: string,
        curso_academico: string,
        tipo: "Asignatura"
    } = {
        asignatura: asignatura._id.toString(),
        curso_academico: asig.curso_academico,
        tipo: asig.tipo,
    }

    return new Response(
        JSON.stringify(new_asig),
        {
            status: 200,
        }
    );
}

export const Transform_Asignaturas_Notas = async (asig: {asignatura: string, curso: string, convocatoria: string, universidad: string, alumnos: AlumnoDB[], docentes: ObjectId[]}): Promise<Response> => {
    const alumnos_exists = await Promise.all(asig.alumnos.map(async (alumno) => await Transform_Alumno(alumno)));

    const alumno_error = alumnos_exists.find((response) => {
        if(response.status !== 200){
            return response;
        }
    });

    if(alumno_error !== undefined){
        return new Response(
            JSON.stringify(await alumno_error.json()),
            {
                status: alumno_error.status,
            }
        )
    }

    const estudiantes:{
        estudiante: Estudiante_Short,
        convocatoria_num: string,
        convocatoria_name: "Ordinaria" | "Extraordinaria",
        nota: number | "Sin calificar" | "No presentado",
    }[] = await Promise.all(alumnos_exists.map(async (alumno) => await alumno.json()));

    const alumnos: {
        estudiante: Estudiante_Short,
        nota: number | string,
    }[] = [];

    estudiantes.forEach((alumno) => {
        if(alumno.estudiante.universidad === asig.universidad){
            alumnos.push(
                {
                    estudiante: (alumno.estudiante as Estudiante_Short),
                    nota: alumno.nota,
                }
            );
        }
    });

    const docentes_exists = await PersonasCollection.find({_id: {$in: asig.docentes}}).toArray();

    if(asig.docentes.length !== docentes_exists.length){
        return new Response(
            JSON.stringify({error: `${asig.docentes.length - docentes_exists.length} docentes no encontrados`}),
            {
                status: 404,
            }
        );
    }

    const docente_error = docentes_exists.find((docente) => {
        if(docente.rol !== "Coordinador" && docente.rol !== "Coordinador general" && docente.rol !== "Profesor"){
            return docente;
        }
    });

    if(docente_error !== undefined){
        return new Response(
            JSON.stringify({error: `Persona con rol de ${docente_error.rol.toLowerCase()} e email ${docente_error.email} encontrado en vez de un coordinador o un profesor`}),
            {
                status: 406,
            }
        );
    }

    const docenteUniCoord = docentes_exists.find((docente) => {
        if((docente.rol === "Coordinador" || docente.rol === "Coordinador general" || docente.rol === "Profesor") && docente.universidad === asig.universidad){
            return docente;
        }
    });

    let docenteInfo = false;

    if(docenteUniCoord !== undefined){
        docenteInfo = true;
    }

    const new_docentes: (Profesor_Short | Coordinador_Short)[] = [];

    docentes_exists.forEach((docente) => {
        if((docente.rol === "Coordinador" || docente.rol === "Coordinador general") && docente.universidad === asig.universidad){
            new_docentes.push(Short_Coordinador_DB(docente));
        }
        else if(docente.rol === "Profesor" && docente.universidad === asig.universidad){
            new_docentes.push(Short_Profesor_DB(docente));
        }
    });

    const asig_data: {
        asignatura: string,
        curso: string,
        convocatoria: string,
        docentesUniCoordinador: boolean,
        docentes: (Coordinador_Short | Profesor_Short)[],
        alumnos: {
            estudiante: Estudiante_Short,
            nota: number | string,
        }[]
    } = {
        asignatura: asig.asignatura,
        curso: asig.curso,
        convocatoria: asig.convocatoria,
        docentesUniCoordinador: docenteInfo,
        docentes: new_docentes,
        alumnos: alumnos,
    };    

    return new Response(
        JSON.stringify(asig_data),
        {
            status: 200,
        }
    );
}