import { ObjectId } from "npm:mongodb";
import { AsignaturasCollection, PersonasCollection, TitulacionesCollection } from "./db/connection.ts";
import { TFM_alumno_DB, TFM_Block, TFM_Block_Curso, TFM_Block_Curso_DB, TFM_Block_DB, TFM_DB } from "./types/Asignaturas/TFM.ts";
import { Short_Coordinador_DB, Transform_Coordinador } from "./utilities/Personas/utils_Coordinadores.ts";
import { Short_Profesor_DB, Transform_Profesor } from "./utilities/Personas/utils_Profesores.ts";
import { Transform_Administrativo } from "./utilities/Personas/utils_Administrativos.ts";
import { Short_Estudiante_DB, Transform_Estudiante } from "./utilities/Personas/utils_Estudiantes.ts";
import { Estudiante_Short, EstudianteDB } from "./types/Personas/Estudiante.ts";
import { Profesor_Short, ProfesorDB } from "./types/Personas/Profesor.ts";
import { Coordinador_Short, CoordinadorDB } from "./types/Personas/Coordinador.ts";
import { Administrativo_Short, AdministrativoDB } from "./types/Personas/Administrativo.ts";
import { Validate_Phone } from "./utilities/Validaciones/Validate_Phone.ts";
import { Validate_Email } from "./utilities/Validaciones/Validate_Email.ts";
import { Persona_To_Short_DB } from "./utilities/Personas/utils_Persona.ts";
import { Transform_Block, Transform_Curso_TFM } from "./utilities/Asignaturas/utils_TFM.ts";
import { Asignatura_curso_DB, Asignatura_curso_docs_short, Asignatura_curso, AlumnoDB, Asignatura_alumno_DB, AsignaturaDB } from "./types/Asignaturas/Asignatura.ts";
import { Short_Asignatura_Curso_Docs_DB, Transform_Curso, Transform_Alumno, Transform_Asignaturas_Notas } from "./utilities/Asignaturas/utils_Asignaturas.ts";
import { Short_Titulacion, Transform_Titulacion } from "./utilities/Titulacion/utils_Titulacion.ts";
import { Error_info } from "./types/Messages/Errors.ts";
import { Decrypt_Passwords } from "./utilities/Transforms/Transform_Passwords.ts";
import { Decrypt_DNI } from "./utilities/Transforms/Transform_DNI.ts";
import { Validate_DNI } from "./utilities/Validaciones/Validate_DNI.ts";

const handler = async (req: Request): Promise<Response> => {
	const method = req.method;
	const url = new URL(req.url);
	const path = url.pathname;
    const searchParams = url.searchParams;

    const headers = new Headers();
	headers.set("Access-Control-Allow-Origin", "*");
	headers.set("Access-Control-Allow-Headers", "*");
	headers.set("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");

    if(method === "OPTIONS"){
       return new Response(null,{
    		status: 204,
    		headers,
    	});
	}
	else if(method === "GET"){
        if(path === "/login"){
            const email = searchParams.get("email");
            const password = searchParams.get("password");

            if(!email || !password){
                return new Response(
                    JSON.stringify({error: "Email o contraseña no encontrada"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const new_password = password.replaceAll(" ", "+");

            const email_validation = await Validate_Email(email);

            if(email_validation.status !== 200){
                return new Response(
                    JSON.stringify(await email_validation.json()),
                    {
                        status: email_validation.status,
                        headers: headers,
                    }
                );
            }

            const persona: (EstudianteDB | ProfesorDB | CoordinadorDB | AdministrativoDB | null) = await PersonasCollection.findOne({email: email});

            if(!persona || Decrypt_Passwords(new_password) !== Decrypt_Passwords(persona.password!)){
                return new Response(
                    JSON.stringify({error: `Email o contraseña equivocada`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            if(persona.rol === "Estudiante"){
                const data = await Transform_Estudiante(persona as EstudianteDB);

                if(data.status !== 200){
                    return new Response(
                        JSON.stringify(await data.json()),
                        {
                            status: 200,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify(await data.json()),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(persona.rol === "Administrativo"){
                const data = await Transform_Administrativo(persona as AdministrativoDB);
                if(data.status !== 200){
                    return new Response(
                        JSON.stringify(await data.json()),
                        {
                            status: 200,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify(await data.json()),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(persona.rol === "Coordinador" || persona.rol === "Coordinador general"){
                return new Response(
                    JSON.stringify(Transform_Coordinador(persona as CoordinadorDB)),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(persona.rol === "Profesor"){
                return new Response(
                    JSON.stringify(Transform_Profesor(persona as ProfesorDB)),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify({error: "Error al loguearse"}),
                {
                    status: 406,
                    headers: headers,
                }
            );
        }
        else if(path === "/persona/id"){
            const id = searchParams.get("id");

            if(!id){
                return new Response(
                    JSON.stringify({error: "Falta algún dato para buscar a la persona"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const personDB = await PersonasCollection.findOne({_id: new ObjectId(id)});

            if(!personDB){
                return new Response(
                    JSON.stringify({error: `Persona con id ${id} no encontrada`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            if(personDB.rol === "Administrativo"){
                const person = await Transform_Administrativo(personDB);

                if(person.status !== 200){
                    return new Response(
                        JSON.stringify(await person.json()),
                        {
                            status: person.status,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify(await person.json()),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(personDB.rol === "Coordinador" || personDB.rol === "Coordinador general"){
                const person = Transform_Coordinador(personDB);

                return new Response(
                    JSON.stringify(person),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(personDB.rol === "Profesor"){
                const person = Transform_Profesor(personDB);

                return new Response(
                    JSON.stringify(person),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(personDB.rol === "Estudiante"){
                const person = await Transform_Estudiante(personDB);

                if(person.status !== 200){
                    return new Response(
                        JSON.stringify(await person.json()),
                        {
                            status: person.status,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify(await person.json()),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify({error: "No se ha podido transformar correctamente los datos de la persona"}),
                {
                    status: 406,
                    headers: headers,
                }
            );
        }
        else if(path === "/personas/alumnos"){
            const titulacion = searchParams.get("titulacion");

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: "Falta algún dato para buscar a la persona o las personas"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${titulacion} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const estudiantes = titulacion_exists.alumnos;

            const peopleDB = await PersonasCollection.find({_id: {$in: estudiantes}}).toArray();

            const people_error = peopleDB.find((person) => {
                if(person.rol !== "Estudiante"){
                    return person;
                }
            });

            if(people_error !== undefined){
                return new Response(
                    JSON.stringify({error: `Persona con id ${people_error._id.toString()} tiene el rol de '${people_error.rol}', no el de 'Estudiante'`}),
                    {
                        status: 406,
                    }
                );
            }

            const people = peopleDB.map((person) => Short_Estudiante_DB(person as EstudianteDB));

            return new Response(
                JSON.stringify(people),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/personas/alumnos_para_asignatura"){
            const titulacion = searchParams.get("titulacion");
            const asignatura = searchParams.get("asignatura");

            if(!titulacion || !asignatura){
                return new Response(
                    JSON.stringify({error: "Falta algún dato para buscar a la persona o las personas"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${titulacion} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignatura_exists = await AsignaturasCollection.findOne(({_id: new ObjectId(asignatura)}));

            if(!asignatura_exists){
                return new Response(
                    JSON.stringify({error: `Asignatura con id ${asignatura} no encontrada`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignatura_error = titulacion_exists.asignaturas.find((asig) => {
                if(asig.toString() === asignatura_exists._id.toString()){
                    return asig;
                }
            });

            if(asignatura_error === undefined){
                return new Response(
                    JSON.stringify({error: `Asignatura con id ${asignatura} no existe en titulación con id ${titulacion}`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const estudiantes = titulacion_exists.alumnos;

            const peopleDB = await PersonasCollection.find({_id: {$in: estudiantes}}).toArray();

            const people_error = peopleDB.find((person) => {
                if(person.rol !== "Estudiante"){
                    return person;
                }
            });

            if(people_error !== undefined){
                return new Response(
                    JSON.stringify({error: `Persona con id ${people_error._id.toString()} tiene el rol de '${people_error.rol}', no el de 'Estudiante'`}),
                    {
                        status: 406,
                    }
                );
            }

            const alumnos_asignatura: EstudianteDB[] = [];

            peopleDB.forEach((person) => {
                if(person.rol === "Estudiante"){
                    let aprobada = false;

                    person.asignaturas_aprobadas.forEach((asig) => {
                        if(asig.tipo === "Asignatura" && asig.asignatura.toString() === asignatura){
                            aprobada = true;
                        }
                    });

                    if(aprobada === false){
                        alumnos_asignatura.push(person);
                    }
                }
            });

            const people = alumnos_asignatura.map((person) => Short_Estudiante_DB(person as EstudianteDB));

            return new Response(
                JSON.stringify(people),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/personas/alumnos_para_TFM"){
            const titulacion = searchParams.get("titulacion");

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: "Falta algún dato para buscar a la persona o las personas"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${titulacion} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const estudiantes = titulacion_exists.alumnos;

            const peopleDB = await PersonasCollection.find({_id: {$in: estudiantes}}).toArray();

            const people_error = peopleDB.find((person) => {
                if(person.rol !== "Estudiante"){
                    return person;
                }
            });

            if(people_error !== undefined){
                return new Response(
                    JSON.stringify({error: `Persona con id ${people_error._id.toString()} tiene el rol de '${people_error.rol}', no el de 'Estudiante'`}),
                    {
                        status: 406,
                    }
                );
            }

            const alumnos_TFM: EstudianteDB[] = [];

            peopleDB.forEach((person) => {
                if(person.rol === "Estudiante"){
                    let aprobada = false;

                    person.asignaturas_aprobadas.forEach((asig) => {
                        if(asig.tipo === "TFM"){
                            aprobada = true;
                        }
                    });

                    if(aprobada === false){
                        alumnos_TFM.push(person);
                    }
                }
            });

            const people = alumnos_TFM.map((person) => Short_Estudiante_DB(person as EstudianteDB));

            return new Response(
                JSON.stringify(people),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/personas/docentes"){
            const titulacion = searchParams.get("titulacion");

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: "Falta algún dato para buscar a la persona o las personas"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${titulacion} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const docentes = titulacion_exists.docentes;

            const peopleDB = await PersonasCollection.find({_id: {$in: docentes}}).toArray();

            const people_error = peopleDB.find((person) => {
                if(person.rol !== "Coordinador" && person.rol !== "Coordinador general" && person.rol !== "Profesor"){
                    return person;
                }
            });

            if(people_error){
                return new Response(
                    JSON.stringify({error: `Persona con id ${people_error._id.toString()} tiene el rol de '${people_error.rol}', no el de 'Profesor' ni el de 'Coordinador'`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const people: (Coordinador_Short | Profesor_Short)[] = [];
            
            peopleDB.forEach((person) => {
                if(person.rol === "Coordinador" || person.rol === "Coordinador general"){
                    people.push(Short_Coordinador_DB(person as CoordinadorDB));
                }
                else if(person.rol === "Profesor"){
                    people.push(Short_Profesor_DB(person as ProfesorDB));
                }
            });

            return new Response(
                JSON.stringify(people),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/personas/coordinadores"){
            const titulacion = searchParams.get("titulacion");

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: "Falta algún dato para buscar a la persona o las personas"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${titulacion} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const docentes = titulacion_exists.docentes;

            const peopleDB = await PersonasCollection.find({_id: {$in: docentes}}).toArray();

            const people_error = peopleDB.find((person) => {
                if(person.rol !== "Coordinador" && person.rol !== "Coordinador general"){
                    return person;
                }
            });

            if(people_error){
                return new Response(
                    JSON.stringify({error: `Persona con id ${people_error._id.toString()} tiene el rol de '${people_error.rol}', no el de 'Coordinador'`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const people: (Coordinador_Short | Profesor_Short)[] = [];
            
            peopleDB.forEach((person) => {
                if(person.rol === "Coordinador" || person.rol === "Coordinador general"){
                    people.push(Short_Coordinador_DB(person as CoordinadorDB));
                }
            });

            return new Response(
                JSON.stringify(people),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/persona/email"){
            const email = searchParams.get("email");

            if(!email){
                return new Response(
                    JSON.stringify({error: "Falta algún dato para buscar a la persona"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const email_validation = await Validate_Email(email);

            if(email_validation.status !== 200){
                return new Response(
                    JSON.stringify(await email_validation.json()),
                    {
                        status: email_validation.status,
                        headers: headers,
                    }
                );
            }

            const personDB = await PersonasCollection.findOne({email: email});

            if(!personDB){
                return new Response(
                    JSON.stringify({error: `Persona con email ${email} no encontrada`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const person = Persona_To_Short_DB(personDB);

            return new Response(
                JSON.stringify(person),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/docente/titulaciones"){
            const docente = searchParams.get("docente");

            if(!docente){
                return new Response(
                    JSON.stringify({error: "ID no encontrado"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacionesDB = await TitulacionesCollection.find({docentes: new ObjectId(docente)}).toArray();

            const titulaciones = titulacionesDB.map((titulacion) => Short_Titulacion(titulacion));

            return new Response(
                JSON.stringify(titulaciones),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/docente/asignaturas"){
            const docente = searchParams.get("docente");
            const titulacion = searchParams.get("titulacion");

            if(!docente || !titulacion){
                return new Response(
                    JSON.stringify({error: "IDs no encontrados"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: "Titulación no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignaturasDB = titulacion_exists.asignaturas;

            const asignaturas_exists = await AsignaturasCollection.find({_id: {$in: asignaturasDB}}).toArray();

            if(asignaturasDB.length !== asignaturas_exists.length){
                return new Response(
                    JSON.stringify({error: `${asignaturasDB.length !== asignaturas_exists.length} asignaturas no encontradas`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                )
            }

            const asig_error = asignaturas_exists.find((asig) => {
                if(asig.tipo !== "Asignatura"){
                    return asig;
                }
            });

            if(asig_error){
                return new Response(
                    JSON.stringify({error: `Bloque de TFMs encontrado entre las asignaturas`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }
            
            const cursosDB: {
                id: string,
                nombre: string,
                curso: Asignatura_curso_DB
            }[] = [];

            asignaturas_exists.forEach((asignatura) => {
                if(asignatura.tipo === "Asignatura"){
                    asignatura.cursos_academicos.forEach((curso) => {
                        curso.profesores.forEach((profesor) => {
                            if(profesor.toString() === docente){
                                cursosDB.push(
                                    {
                                        nombre: asignatura.nombre,
                                        id: asignatura._id.toString(),
                                        curso: curso,
                                    }
                                );
                            }
                        });
                    });
                }
            });

            const cursos_response = await Promise.all(cursosDB.map(async (curso) => await Short_Asignatura_Curso_Docs_DB(curso.curso, curso.id, curso.nombre)));

            const curso_error = cursos_response.find((curso) => {
                if(curso.status !== 200){
                    return curso;
                }
            });

            if(curso_error !== undefined){
                return new Response(
                    JSON.stringify(await curso_error.json()),
                    {
                        status: curso_error.status,
                        headers: headers,
                    }
                );
            }

            const cursos: Asignatura_curso_docs_short[] = await Promise.all(cursos_response.map(async (response) => await response.json()));

            return new Response(
                JSON.stringify(cursos),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/administrativo/titulaciones"){
            const admin = searchParams.get("admin");

            if(!admin){
                return new Response(
                    JSON.stringify({error: "ID del administrativo no encontrado"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacionesDB = await TitulacionesCollection.find({administrativos: new ObjectId(admin)}).toArray();

            const titulaciones_info = titulacionesDB.map((titulacion) => Short_Titulacion(titulacion));

            return new Response(
                JSON.stringify(titulaciones_info),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/asignatura"){
            const id = searchParams.get("id");

            if(!id){
                return new Response(
                    JSON.stringify({error: "ID no encontrado"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const asignatura = await AsignaturasCollection.findOne({_id: new ObjectId(id)});

            if(!asignatura){
                return new Response(
                    JSON.stringify({error: `Asignatura con id ${id} no encontrada`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(asignatura.tipo !== "Asignatura"){
                return new Response(
                    JSON.stringify({error: `Bloque de TFMs con id ${asignatura._id} encontrada en vez de asignatura`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const titulacion = await TitulacionesCollection.findOne({asignaturas: asignatura._id});

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: "Titulacion de la asignatura no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignatura_cursos_data = await Promise.all(asignatura.cursos_academicos.map(async (curso) => await Transform_Curso(curso)));
            const asignatura_curso: Asignatura_curso[] = [];

            const data: (Asignatura_curso | Error_info)[] = await Promise.all(asignatura_cursos_data.map(async (curso) => {
                if(curso.status !== 200){
                    const error = await curso.json();

                    return {
                        tipo: "error",
                        status: curso.status,
                        error: error.error,
                    }
                }
                else{
                    return await curso.json();
                }
            }));

            const data_error = data.find((data_info) => {
                if(data_info.tipo === "error"){
                    return data_info;
                }
                else{
                    asignatura_curso.push(data_info as Asignatura_curso);
                }
            });

            if(data_error !== undefined && data_error.tipo === "error"){
                return new Response(
                    JSON.stringify({error: data_error.error}),
                    {
                        status: data_error.status,
                        headers: headers,
                    }
                );
            }

            if(asignatura.cursos_academicos.length !== asignatura_curso.length){
                return new Response(
                    JSON.stringify({error: `${asignatura.cursos_academicos.length - asignatura_curso.length} cursos no encontrados`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            
            return new Response(
                JSON.stringify(
                    {
                        id: asignatura._id!.toString(),
                        nombre: asignatura.nombre,
                        curso: asignatura.curso,
                        cursos_academicos: asignatura_curso,
                        creditos: asignatura.creditos,
                        optatividad: asignatura.optatividad,
                        titulacion: titulacion._id.toString(),
                        tipo: "Asignatura",
                    }
                ),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/curso"){
            const asignatura = searchParams.get("asignatura");
            const curso = searchParams.get("curso");

            if(!asignatura || !curso){
                return new Response(
                    JSON.stringify({error: "IDs no encontrado"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const asignaturaDB = await AsignaturasCollection.findOne({_id: new ObjectId(asignatura)});

            if(!asignaturaDB){
                return new Response(
                    JSON.stringify({error: "Asignatura no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(asignaturaDB.tipo !== "Asignatura"){
                return new Response(
                    JSON.stringify({error: "Bloque de TFM encontrado en vez de una asignatura"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const curso_exists = asignaturaDB.cursos_academicos.find((cursito) => {
                if(cursito.id.toString() === curso){
                    return curso;
                }
            });

            if(curso_exists === undefined){
                return new Response(
                    JSON.stringify({error: "Curso no encontrado"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const curso_response = await Transform_Curso(curso_exists);

            if(curso_response.status !== 200){
                return new Response(
                    JSON.stringify(await curso_response.json()),
                    {
                        status: curso_response.status,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify(await curso_response.json()),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/convocatoria"){
            const asignatura = searchParams.get("asignatura");
            const curso = searchParams.get("curso");
            const convocatoria = searchParams.get("curso");

            if(!asignatura || !curso || !convocatoria){
                return new Response(
                    JSON.stringify({error: "Falta algún dato para hacer la búsqueda"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const asignatura_exists = await AsignaturasCollection.findOne({_id: new ObjectId(asignatura)});

            if(!asignatura_exists){
                return new Response(
                    JSON.stringify({error: "Asignatura no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(asignatura_exists.tipo !== "Asignatura"){
                return new Response(
                    JSON.stringify({error: "Bloque de TFM encontrado en vez de una asignatura"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const curso_exists = asignatura_exists.cursos_academicos.find((cursito) => {
                if(cursito.curso_academico === curso){
                    return cursito;
                }
            });

            if(curso_exists === undefined){
                return new Response(
                    JSON.stringify({error: `${curso} no encontrado en la asignatura ${asignatura_exists.nombre}`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const alumnosDB = curso_exists.alumnos_ordinaria;

            const alumnos_response = await Promise.all(alumnosDB.map(async (alumno) => await Transform_Alumno(alumno)));

            const error = alumnos_response.find((response) => {
                if(response.status !== 200){
                    return response;
                }
            });

            if(error !== undefined){
                return new Response(
                    JSON.stringify(await error.json()),
                    {
                        status: error.status,
                        headers: headers,
                    }
                );
            }

            const alumnos = await Promise.all(alumnos_response.map(async (response) => {
                const data = await response.json();

                return data;
            }));

            return new Response(
                JSON.stringify(alumnos),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/asignaturas/nombres"){
            const titulacion: string | null = searchParams.get("titulacion");

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: "Faltan datos para hacer la búsqueda"}),
                    {
                        status: 400,
                        headers: headers
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${titulacion} no encontrada`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignaturas_exists = await AsignaturasCollection.find({_id: {$in: titulacion_exists.asignaturas}}).toArray();

            if(titulacion_exists.asignaturas.length !== asignaturas_exists.length){
                return new Response(
                    JSON.stringify({error: `${titulacion_exists.asignaturas.length - asignaturas_exists.length} asignaturas no encontradas`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignatura_error = asignaturas_exists.find((asig) => {
                if(asig.tipo !== "Asignatura"){
                    return asig;
                }
            });

            if(asignatura_error !== undefined){
                return new Response(
                    JSON.stringify({error: "Se ha encontrado un bloque de TFMs en vez de una asignatura"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const nombres: string[] = [];
            
            asignaturas_exists.forEach((asig) => {
                if(asig.tipo === "Asignatura"){
                    nombres.push(asig.nombre);
                }
            });

            return new Response(
                JSON.stringify(nombres),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/asignaturas/notas_curso"){
            const titulacion: string | null = searchParams.get("titulacion");
            const curso: string | null = searchParams.get("curso");
            const universidad: string | null = searchParams.get("universidad");
            const convocatoria: "Ordinaria" | "Extraordinaria" | string | null = searchParams.get("convocatoria");

            if(!titulacion || !curso || !universidad || !convocatoria){
                return new Response(
                    JSON.stringify({error: "Faltan datos para hacer la búsqueda"}),
                    {
                        status: 400,
                        headers: headers
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${titulacion} no encontrada`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignaturas_exists = await AsignaturasCollection.find({_id: {$in: titulacion_exists.asignaturas}}).toArray();

            if(titulacion_exists.asignaturas.length !== asignaturas_exists.length){
                return new Response(
                    JSON.stringify({error: `${titulacion_exists.asignaturas.length - asignaturas_exists.length} asignaturas no encontradas`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignatura_error = asignaturas_exists.find((asig) => {
                if(asig.tipo !== "Asignatura"){
                    return asig;
                }
            });

            if(asignatura_error !== undefined){
                return new Response(
                    JSON.stringify({error: "Se ha encontrado un bloque de TFMs en vez de una asignatura"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const cursos_exists: {
                asignatura: string,
                curso: Asignatura_curso_DB,
            }[] = [];

            asignaturas_exists.forEach((asig) => {
                if(asig.tipo === "Asignatura"){
                    asig.cursos_academicos.forEach((cursito) => {
                        if(cursito.curso_academico === curso){
                            cursos_exists.push(
                                {
                                    asignatura: asig.nombre,
                                    curso: cursito,
                                }
                            );
                        }
                    });
                }
            });

            if(convocatoria === "Ordinaria"){
                const curso_data = await Promise.all(cursos_exists.map(async (cursito) => await Transform_Asignaturas_Notas(
                    {
                        asignatura: cursito.asignatura,
                        curso: cursito.curso.curso_academico,
                        convocatoria: "Ordinaria",
                        universidad: universidad,
                        alumnos: cursito.curso.alumnos_ordinaria,
                        docentes: cursito.curso.profesores,
                    }
                )));

                const curso_error = curso_data.find((data) => {
                    if(data.status !== 200){
                        return data;
                    }
                });

                if(curso_error !== undefined){
                    return new Response(
                        JSON.stringify(await curso_error.json()),
                        {
                            status: curso_error.status,
                            headers: headers,
                        }
                    );
                }

                const respuesta: {
                    asignatura: string,
                    curso: string,
                    convocatoria: string,
                    docentesUniCoordinador: boolean,
                    docentes: (Coordinador_Short | Profesor_Short)[];
                    alumnos: {
                        estudiante: Estudiante_Short,
                        nota: number | string,
                    }[]
                }[] = await Promise.all(curso_data.map(async (data) => await data.json()));

                return new Response(
                    JSON.stringify(respuesta),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(convocatoria === "Extraordinaria"){
                const curso_data = await Promise.all(cursos_exists.map(async (cursito) => await Transform_Asignaturas_Notas(
                    {
                        asignatura: cursito.asignatura,
                        curso: cursito.curso.curso_academico,
                        convocatoria: "Extraordinaria",
                        universidad: universidad,
                        alumnos: cursito.curso.alumnos_extraordinaria,
                        docentes: cursito.curso.profesores,
                    }
                )));

                const curso_error = curso_data.find((data) => {
                    if(data.status !== 200){
                        return data;
                    }
                });

                if(curso_error !== undefined){
                    return new Response(
                        JSON.stringify(await curso_error.json()),
                        {
                            status: curso_error.status,
                            headers: headers,
                        }
                    );
                }

                const respuesta: {
                    asignatura: string,
                    curso: string,
                    convocatoria: string,
                    docentesUniCoordinador: boolean,
                    docentes: (Coordinador_Short | Profesor_Short)[];
                    alumnos: {
                        estudiante: Estudiante_Short,
                        nota: number | string,
                    }[]
                }[] = await Promise.all(curso_data.map(async (data) => await data.json()));

                return new Response(
                    JSON.stringify(respuesta),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(convocatoria === "Ambas"){
                const curso_data_ordinaria = await Promise.all(cursos_exists.map(async (cursito) => await Transform_Asignaturas_Notas(
                    {
                        asignatura: cursito.asignatura,
                        curso: cursito.curso.curso_academico,
                        convocatoria: "Ordinaria",
                        universidad: universidad,
                        alumnos: cursito.curso.alumnos_ordinaria,
                        docentes: cursito.curso.profesores,
                    }
                )));

                const curso_error_ordinaria = curso_data_ordinaria.find((data) => {
                    if(data.status !== 200){
                        return data;
                    }
                });

                if(curso_error_ordinaria !== undefined){
                    return new Response(
                        JSON.stringify(await curso_error_ordinaria.json()),
                        {
                            status: curso_error_ordinaria.status,
                            headers: headers,
                        }
                    );
                }

                const respuesta_ordinaria: {
                    asignatura: string,
                    curso: string,
                    convocatoria: string,
                    docentesUniCoordinador: boolean,
                    docentes: (Coordinador_Short | Profesor_Short)[],
                    alumnos: {
                        estudiante: Estudiante_Short,
                        nota: number | string,
                    }[]
                }[] = await Promise.all(curso_data_ordinaria.map(async (data) => await data.json()));

                const curso_data_extraordinaria = await Promise.all(cursos_exists.map(async (cursito) => await Transform_Asignaturas_Notas(
                    {
                        asignatura: cursito.asignatura,
                        curso: cursito.curso.curso_academico,
                        convocatoria: "Extraordinaria",
                        universidad: universidad,
                        alumnos: cursito.curso.alumnos_extraordinaria,
                        docentes: cursito.curso.profesores,
                    }
                )));

                const curso_error_extraordinaria = curso_data_extraordinaria.find((data) => {
                    if(data.status !== 200){
                        return data;
                    }
                });

                if(curso_error_extraordinaria !== undefined){
                    return new Response(
                        JSON.stringify(await curso_error_extraordinaria.json()),
                        {
                            status: curso_error_extraordinaria.status,
                            headers: headers,
                        }
                    );
                }

                const respuesta_extraordinaria: {
                    asignatura: string,
                    curso: string,
                    convocatoria: string,
                    docentesUniCoordinador: boolean,
                    docentes: (Coordinador_Short | Profesor_Short)[],
                    alumnos: {
                        estudiante: Estudiante_Short,
                        nota: number | string,
                    }[]
                }[] = await Promise.all(curso_data_extraordinaria.map(async (data) => await data.json()));
                
                const respuesta: {
                    asignatura: string,
                    curso: string,
                    convocatoria: string,
                    docentesUniCoordinador: boolean,
                    docentes: (Coordinador_Short | Profesor_Short)[];
                    alumnos: {
                        estudiante: Estudiante_Short,
                        nota: number | string,
                    }[]
                }[] = [];

                respuesta_ordinaria.forEach((resp) => {
                    respuesta.push(resp);
                });

                respuesta_extraordinaria.forEach((resp) => {
                    respuesta.push(resp);
                });

                return new Response(
                    JSON.stringify(respuesta),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify({error: "Error al procesar"}),
                {
                    status: 404,
                    headers: headers,
                }
            );
        }
        else if(path === "/titulaciones/num"){
            const titulaciones = await TitulacionesCollection.find().toArray();

            return new Response(
                JSON.stringify({titulaciones_number: titulaciones.length}),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/titulacion"){
            const id = searchParams.get("id");

            if(!id){
                return new Response(
                    JSON.stringify({error: "ID no encontrado"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion = await TitulacionesCollection.findOne({_id: new ObjectId(id)});

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${id} no encontrada`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const titulacion_info = await Transform_Titulacion(titulacion);

            if(titulacion_info.status !== 200){
                return new Response(
                    JSON.stringify(await titulacion_info.json()),
                    {
                        status: titulacion_info.status,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify(await titulacion_info.json()),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/titulacion/creacion"){
            const titulacion = searchParams.get("titulacion");

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: "Falta el ID de la titulacion"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: "Titulación no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify(titulacion_exists.creacion),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/titulacion/convocatorias"){
            const id = searchParams.get("id");

            if(!id){
                return new Response(
                    JSON.stringify({error: "Falta el ID de la titulacion"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion = await TitulacionesCollection.findOne({_id: new ObjectId(id)});

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${id} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify(titulacion.convocatorias_disponibles),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/titulacion/cursos"){
            const id = searchParams.get("id");

            if(!id){
                return new Response(
                    JSON.stringify({error: "Falta el ID de la titulación"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion = await TitulacionesCollection.findOne({_id: new ObjectId(id)});

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${id} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify({cursos: titulacion.cursos}),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/titulacion/universidades"){
            const id = searchParams.get("id");

            if(!id){
                return new Response(
                    JSON.stringify({error: "Falta el ID de la asignatura"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion = await TitulacionesCollection.findOne({_id: new ObjectId(id)});

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${id} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const unis: string[] = [];

            titulacion.universidades.forEach((uni) => {
                unis.push(uni.nombre);
            });

            return new Response(
                JSON.stringify(unis),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/titulacion/cursos_aptos"){
            const id = searchParams.get("id");

            if(!id){
                return new Response(
                    JSON.stringify({error: "Falta el ID de la asignatura"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion = await TitulacionesCollection.findOne({_id: new ObjectId(id)});

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${id} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify(titulacion.grados_aptos),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/titulacion/estudiantes_notas_universidad"){
            const titulacion = searchParams.get("titulacion");
            const universidad = searchParams.get("universidad");
            const asignatura = searchParams.get("asignatura");

            if(!titulacion || !universidad || !asignatura){
                return new Response(
                    JSON.stringify({error: "Falta algún dato para hacer la búsqueda"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: "Titulación no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignaturas_exists = await AsignaturasCollection.find({_id: {$in: titulacion_exists.asignaturas}}).toArray();

            if(titulacion_exists.asignaturas.length !== asignaturas_exists.length){
                return new Response(
                    JSON.stringify({error: `${titulacion_exists.asignaturas.length - asignaturas_exists.length} asignaturas no encotradas`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignatura_error = asignaturas_exists.find((asignatura) => {
                if(asignatura.tipo !== "Asignatura"){
                    return asignatura;
                }
            });

            if(asignatura_error !== undefined){
                return new Response(
                    JSON.stringify({error: `Se ha encontrado un bloque de TFM en vez de una asignatura`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const alumnos_exists = await PersonasCollection.find({_id: {$in: titulacion_exists.alumnos}}).toArray();

            if(titulacion_exists.alumnos.length !== alumnos_exists.length){
                return new Response(
                    JSON.stringify({error: `${titulacion_exists.alumnos.length !== alumnos_exists.length}`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const alumno_error = alumnos_exists.find((alumno) => {
                if(alumno.rol !== undefined){
                    return alumno;
                }
            });

            if(alumno_error !== undefined){
                return new Response(
                    JSON.stringify({error: `Se ha encontrado un ${alumno_error.rol.toLowerCase()} en vez de un estudiante`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const alumnos_universidad: EstudianteDB[] = [];

            alumnos_exists.forEach((alumno) => {
                if(alumno.rol === "Estudiante" && alumno.universidad === universidad){
                    alumnos_universidad.push(alumno);
                }
            });
        }
        else if(path === "/titulacion/control_calidad"){
            const titulacion = searchParams.get("titulacion");
            const universidad = searchParams.get("universidad");
            const curso = searchParams.get("curso");

            if(!titulacion || !universidad || !curso){
                return new Response(
                    JSON.stringify({error: "Falta algún dato para hacer la búsqueda"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: "Titulación no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignaturas_exists = await AsignaturasCollection.find({_id: {$in: titulacion_exists.asignaturas}}).toArray();

            if(titulacion_exists.asignaturas.length !== asignaturas_exists.length){
                return new Response(
                    JSON.stringify({error: `${titulacion_exists.asignaturas.length - asignaturas_exists.length} asignaturas no encontradas`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignatura_error = asignaturas_exists.find((asig) => {
                if(asig.tipo !== "Asignatura"){
                    return asig;
                }
            });

            if(asignatura_error !== undefined){
                return new Response(
                    JSON.stringify({error: "Se ha encontrado un bloque de TFMs en vez de una asignatura"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const tfm_block = await AsignaturasCollection.findOne({_id: titulacion_exists.TFM});

            if(!tfm_block){
                return new Response(
                    JSON.stringify({error: "Bloque de TFMs no encontrado"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(tfm_block.tipo !== "Bloque TFMs"){
                return new Response(
                    JSON.stringify({error: "Se ha encontrado una asignatura en vez de un bloque de TFM"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            asignaturas_exists.push(tfm_block);

            const alumnos = await PersonasCollection.find({_id: {$in: titulacion_exists.alumnos}, rol: "Estudiante"}).toArray();
            const alumnosError = alumnos.find((alumno) => {
                if(alumno.rol !== "Estudiante"){
                    return alumno;
                }
            });

            if(alumnosError !== undefined){
                return new Response(
                    JSON.stringify({error: `Persona con rol de ${alumnosError.rol} encontrado en vez de un estudiante`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const alumnosUniversidad: EstudianteDB[] = [];

            alumnos.forEach((alumno) => {
                if(alumno.rol === "Estudiante" && universidad !== "Todas" && alumno.universidad === universidad){
                    alumnosUniversidad.push(alumno);
                }
                else if(alumno.rol === "Estudiante" && universidad === "Todas"){
                    alumnosUniversidad.push(alumno);
                }
            });

            let creditos_matriculados = 0;
            let creditos_presentados = 0;
            let creditos_aprobados = 0;

            alumnosUniversidad.forEach((alumno) => {
                alumno.asignaturas_matriculadas.forEach((asig1) => {
                    asignaturas_exists.forEach((asig2) => {
                        if(asig2._id.toString() === asig1.asignatura.toString() && asig1.curso_academico === curso){
                            creditos_matriculados += asig2.creditos;
                        }
                    });
                });
                
                alumno.asignaturas_presentadas.forEach((asig1) => {
                    asignaturas_exists.forEach((asig2) => {
                        if(asig2._id.toString() === asig1.asignatura.toString() && asig1.curso_academico === curso){
                            creditos_presentados += asig2.creditos;
                        }
                    });
                });

                alumno.asignaturas_aprobadas.forEach((asig1) => {
                    asignaturas_exists.forEach((asig2) => {
                        if((asig1.tipo === "Asignatura" && asig2._id.toString() === asig1.asignatura.toString() && asig1.curso === curso) || (asig1.tipo === "TFM" && asig1.bloque.toString() === asig2._id.toString() && asig1.curso_academico === curso)){
                            creditos_aprobados += asig2.creditos;
                        }
                    });
                });
            });

            const tasa_rendimiento = (creditos_aprobados/creditos_matriculados)*100;
            const tasa_evaluacion = (creditos_presentados/creditos_matriculados)*100;
            const tasa_exito = (creditos_aprobados/creditos_presentados)*100;
            let tasa_egresados: string | number = (0)/100;

            const num_cursos_titulacion = titulacion_exists.cursos - 1;
            const creacion_titulacion_num = titulacion_exists.creacion;
            const curso_num = Number(curso.split(" ")[1].split("-")[0]);
            const alumnosMatriculados: EstudianteDB[] = [];
            const alumnosEgresados: EstudianteDB[] = [];

            if(creacion_titulacion_num > (curso_num-num_cursos_titulacion)){
                tasa_egresados = "-";
            }

            if(tasa_egresados !== "-"){
                alumnosUniversidad.forEach((alumno) => {
                    if(Number(alumno.curso_admision.split(" ")[1].split("-")[0]) === (curso_num - num_cursos_titulacion)){
                        alumnosMatriculados.push(alumno);
                    }

                    if(alumno.graduado === true){
                        alumnosEgresados.push(alumno);
                    }
                });

                tasa_egresados = (alumnosEgresados.length/alumnosMatriculados.length)*100;
            }

            return new Response(
                JSON.stringify(
                    {
                        creditos_matriculados: creditos_matriculados,
                        creditos_presentados: creditos_presentados,
                        creditos_aprobados: creditos_aprobados,
                        tasa_rendimiento: tasa_rendimiento,
                        tasa_evaluacion: tasa_evaluacion,
                        tasa_exito: tasa_exito,
                        tasa_egresados: tasa_egresados,
                    }
                ),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/bloque_TFM"){
            const bloque = searchParams.get("bloque");

            if(!bloque){
                return new Response(
                    JSON.stringify({error: "ID no encontrado"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const bloque_exists = await AsignaturasCollection.findOne({_id: new ObjectId(bloque)});

            if(!bloque_exists){
                return new Response(
                    JSON.stringify({error: `Bloque de TFMs con id ${bloque} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(bloque_exists.tipo !== "Bloque TFMs"){
                return new Response(
                    JSON.stringify({error: `Asignatura con id ${bloque_exists} encontrada en vez de bloque de TFMs `}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const bloque_response = await Transform_Block(bloque_exists);

            if(bloque_response.status !== 200){
                return new Response(
                    JSON.stringify(await bloque_response.json()),
                    {
                        status: bloque_response.status,
                        headers: headers,
                    }
                );
            }

            const bloque_data = await bloque_response.json();

            return new Response(
                JSON.stringify(bloque_data),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/cursos_TFM"){
            const titulacion = searchParams.get("titulacion");

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: "ID no encontrado"}),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});
            
            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: "Titulación no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const TFM_Block_exists = await AsignaturasCollection.findOne(titulacion_exists.TFM);

            if(!TFM_Block_exists){
                return new Response(
                    JSON.stringify({error: "Bloque de TFMs no encontrado"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(TFM_Block_exists.tipo !== "Bloque TFMs"){
                return new Response(
                    JSON.stringify({error: "Asignatura encontrada en vez de un bloque de TFMs"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const cursosDB: TFM_Block_Curso_DB[] = [];
            
            TFM_Block_exists.cursos.forEach((curso) => {
                const curso_split = curso.nombre.split(" ")[1].split("-");
                const date = new Date();

                if(date.getFullYear() === Number(curso_split[0]) || date.getFullYear() === Number(curso_split[1])){
                    cursosDB.push(curso);
                }
            });

            const cursos_transform = await Promise.all(cursosDB.map(async (curso) => await Transform_Curso_TFM(curso)));

            const curso_error = cursos_transform.find((response) => {
                if(response.status !== 200){
                    return response;
                }
            });

            if(curso_error !== undefined){
                return new Response(
                    JSON.stringify(await curso_error.json()),
                    {
                        status: curso_error.status,
                        headers: headers,
                    }
                );
            }

            const cursos: TFM_Block_Curso[] = await Promise.all(cursos_transform.map(async (response) => await response.json()));

            return new Response(
                JSON.stringify(cursos),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/bloque_TFM/curso"){
            const bloque = searchParams.get("bloque");
            const curso = searchParams.get("curso")

            if(!bloque || !curso){
                return new Response(
                    JSON.stringify({error: "Faltan datos para realizar la búsqueda"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const bloque_exists = await AsignaturasCollection.findOne({_id: new ObjectId(bloque)});

            if(!bloque_exists){
                return new Response(
                    JSON.stringify({error: `Bloque de TFMs con id ${bloque} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(bloque_exists.tipo !== "Bloque TFMs"){
                return new Response(
                    JSON.stringify({error: `Asignatura con id ${bloque_exists} encontrada en vez de bloque de TFMs `}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const bloque_response = await Transform_Block(bloque_exists);

            if(bloque_response.status !== 200){
                return new Response(
                    JSON.stringify(await bloque_response.json()),
                    {
                        status: bloque_response.status,
                        headers: headers,
                    }
                );
            }

            const bloque_data: TFM_Block = await bloque_response.json();

            const curso_TFM = bloque_data.cursos.find((cursito) => {
                if(cursito.id === curso){
                    return cursito;
                }
            });

            return new Response(
                JSON.stringify(curso_TFM),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/practicas"){}
        else if(path === "/practicas/curso"){}
	}
    else if(method === "POST"){
        if(path === "/persona"){
            const data = await req.json();
            const nombre: string | undefined = data.nombre;
            const apellido_1: string | undefined = data.apellido_1;
            const apellido_2: string | undefined = data.apellido_2;
            const DNI: string | undefined = data.DNI;
            const prefijo_movil: string | undefined = data.prefijo_movil;
            const numero_movil: string | undefined = data.numero_movil;
            const email: string | undefined = data.email;
            const password: string | undefined = data.password;
            const grado_academico: string | undefined = data.grado_academico;
            const universidad: string | undefined = data.universidad;
            const curso_admision: string | undefined = data.curso_admision;
            const rol: "Estudiante" | "Administrativo" | "Coordinador" | "Profesor" | undefined = data.rol;
            const titulacion: string | undefined = data.titulacion;

            if(!nombre || !apellido_1 || !DNI || !email || !rol || !titulacion){
                return new Response(
                    JSON.stringify({error: "Falta información de la persona"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            let surname_2: string | undefined = ""

            if(!apellido_2){
                surname_2 = undefined;
            }
            else{
                surname_2 = apellido_2;
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: "Titulación no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const personas = await PersonasCollection.find({_id: {$in: titulacion_exists.alumnos}}).toArray();
            const persona_email = await PersonasCollection.findOne({email: email});
            const persona_DNI = personas.find((persona) => {
                if(Decrypt_DNI(DNI) === Decrypt_DNI(persona.DNI)){
                    return persona;
                }
            });

            if(persona_email){
                return new Response(
                    JSON.stringify({error: `Persona con email ${email} ya existe`}),
                    {
                        status: 409,
                        headers: headers,
                    }
                );
            }
            else if(persona_DNI !== undefined){
                return new Response(
                    JSON.stringify({error: `Persona con DNI ${Decrypt_DNI(DNI)} ya existe`}),
                    {
                        status: 409,
                        headers: headers,
                    }
                );
            }
            
            const email_validation = await Validate_Email(email);

            if(email_validation.status !== 200){
                return new Response(
                    JSON.stringify(await email_validation.json()),
                    {
                        status: email_validation.status,
                        headers: headers,
                    }
                );
            }

            const dni_validation = Validate_DNI(Decrypt_DNI(DNI));

            if(dni_validation.status !== 200){
                return new Response(
                    JSON.stringify(await dni_validation.json()),
                    {
                        status: dni_validation.status,
                        headers: headers,
                    }
                );
            }

            let phone_prefix: string | undefined = "";
            let phone_number: string | undefined = "";

            if(!prefijo_movil || !numero_movil){
                phone_prefix = undefined;
                phone_number = undefined;
            }
            else{
                const validation = await Validate_Phone(prefijo_movil, numero_movil);

                if(validation.status !== 200){
                    return new Response(
                        JSON.stringify(await validation.json()),
                        {
                            status: validation.status,
                            headers: headers,
                        }
                    );
                }
                else{
                    const phone_error = await PersonasCollection.findOne({prefijo_movil: prefijo_movil, numero_movil: numero_movil});

                    if(phone_error){
                        return new Response(
                            JSON.stringify({error: `Persona con teléfono ${prefijo_movil} ${numero_movil} ya existe`}),
                            {
                                status: 409,
                                headers: headers,
                            }
                        );
                    }

                    phone_prefix = prefijo_movil.replaceAll(" ","+");
                    phone_number = numero_movil;
                }
            }

            if(rol === "Administrativo"){
                if(!password){
                    return new Response(
                        JSON.stringify({error: "Falta información de la persona"}),
                        {
                            status: 400,
                            headers: headers,
                        }
                    );
                }

                const { insertedId } = await PersonasCollection.insertOne(
                    {
                        nombre: nombre,
                        apellido_1: apellido_1,
                        apellido_2: surname_2,
                        DNI: DNI,
                        prefijo_movil: phone_prefix,
                        numero_movil: phone_number,
                        email: email,
                        password: password,
                        rol: "Administrativo",
                    }
                );

                const admins = titulacion_exists.administrativos;
                admins.push(insertedId);

                const { modifiedCount } = await TitulacionesCollection.updateOne(
                    {_id: titulacion_exists._id},
                    {
                        $set: {
                            administrativos: admins,
                        }
                    }
                );

                if(modifiedCount === 0){
                    return new Response(
                        JSON.stringify({error: "Titulacion no encotrada"}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify(
                        {
                            message: `Administrativo exitosamente añadido`,
                        }
                    ),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(rol === "Coordinador"){
                if(!universidad || !password){
                    return new Response(
                        JSON.stringify({error: "Falta información de la persona"}),
                        {
                            status: 400,
                            headers: headers,
                        }
                    );
                }
                const coordinador_universidad1 = await PersonasCollection.findOne({universidad: universidad, rol: "Coordinador"});
                const coordinador_universidad2 = await PersonasCollection.findOne({universidad: universidad, rol: "Coordinador general"});

                if(coordinador_universidad1 !== null && coordinador_universidad2 !== null){
                    return new Response(
                        JSON.stringify({error: `Coordinador de la universidad ${universidad} ya existe`}),
                        {
                            status: 406,
                            headers: headers,
                        }
                    );
                }

                let newPersonID = new ObjectId();

                const uni_principal = titulacion_exists.universidades.find((uni) => {
                    if(uni.principal === true && uni.nombre === universidad){
                        return uni;
                    }
                });

                if(uni_principal === undefined){
                    const { insertedId } = await PersonasCollection.insertOne(
                        {
                            nombre: nombre,
                            apellido_1: apellido_1,
                            apellido_2: surname_2,
                            DNI: DNI,
                            prefijo_movil: phone_prefix,
                            numero_movil: phone_number,
                            email: email,
                            password: password,
                            universidad: universidad,
                            rol: "Coordinador",
                        }
                    );

                    newPersonID = insertedId;
                }
                else{
                    const { insertedId } = await PersonasCollection.insertOne(
                        {
                            nombre: nombre,
                            apellido_1: apellido_1,
                            apellido_2: surname_2,
                            DNI: DNI,
                            prefijo_movil: phone_prefix,
                            numero_movil: phone_number,
                            email: email,
                            password: password,
                            universidad: universidad,
                            rol: "Coordinador general",
                        }
                    );

                    newPersonID = insertedId;
                }

                const coords = titulacion_exists.docentes;
                coords.push(newPersonID);

                const { modifiedCount } = await TitulacionesCollection.updateOne(
                    {_id: titulacion_exists._id},
                    {
                        $set: {
                            docentes: coords,
                        }
                    }
                );

                if(modifiedCount === 0){
                    return new Response(
                        JSON.stringify({error: "Titulacion no encotrada"}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify(
                        {
                            message: `Coordinador exitosamente añadido`,
                        }
                    ),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(rol === "Estudiante"){
                if(!curso_admision || !grado_academico || !universidad){
                    return new Response(
                        JSON.stringify({error: "Falta información de la persona"}),
                        {
                            status: 400,
                            headers: headers,
                        }
                    );
                }

                const { insertedId } = await PersonasCollection.insertOne(
                    {
                        nombre: nombre,
                        apellido_1: apellido_1,
                        apellido_2: surname_2,
                        DNI: DNI,
                        prefijo_movil: phone_prefix,
                        numero_movil: phone_number,
                        email: email,
                        password: password,
                        universidad: universidad,
                        grado_academico: grado_academico,
                        curso_admision: curso_admision,
                        asignaturas_matriculadas: [],
                        asignaturas_presentadas: [],
                        convocatorias_cursadas: [],
                        asignaturas_aprobadas: [],
                        rol: "Estudiante",
                        graduado: false,
                    }
                );

                const alumns = titulacion_exists.alumnos;
                alumns.push(insertedId);

                const { modifiedCount } = await TitulacionesCollection.updateOne(
                    {_id: titulacion_exists._id},
                    {
                        $set: {
                            alumnos: alumns,
                        }
                    }
                );

                if(modifiedCount === 0){
                    return new Response(
                        JSON.stringify({error: "Titulacion no encotrada"}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify(
                        {
                            message: `Estudiante exitosamente añadido`,
                        }
                    ),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(rol === "Profesor"){
                if(!universidad || !password){
                    return new Response(
                        JSON.stringify({error: "Falta información de la persona"}),
                        {
                            status: 400,
                            headers: headers,
                        }
                    );
                }

                const { insertedId } = await PersonasCollection.insertOne(
                    {
                        nombre: nombre,
                        apellido_1: apellido_1,
                        apellido_2: surname_2,
                        DNI: DNI,
                        prefijo_movil: phone_prefix,
                        numero_movil: phone_number,
                        email: email,
                        password: password,
                        universidad: universidad,
                        rol: "Profesor",
                    }
                );

                const profs = titulacion_exists.docentes;
                profs.push(insertedId);

                const { modifiedCount } = await TitulacionesCollection.updateOne(
                    {_id: titulacion_exists._id},
                    {
                        $set: {
                            docentes: profs,
                        }
                    }
                );

                if(modifiedCount === 0){
                    return new Response(
                        JSON.stringify({error: "Titulacion no encotrada"}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify(
                        {
                            message: `Profesor exitosamente añadido`,
                        }
                    ),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify({error: "Persona no encontrada, rol inexistente"}),
                {
                    status: 404,
                    headers: headers,
                }
            );
        }
        else if(path === "/register"){
            const data = await req.json();
            const nombre: string | undefined = data.nombre;
            const apellido_1: string | undefined = data.apellido_1;
            const apellido_2: string | undefined = data.apellido_2;
            const DNI: string | undefined = data.DNI;
            const prefijo_movil: string | undefined = data.prefijo_movil;
            const numero_movil: string | undefined = data.numero_movil;
            const email: string | undefined = data.email;
            const password: string | undefined = data.password;
            const rol: "Administrativo" | undefined = data.rol;

            if(!nombre || !apellido_1 || !DNI || !email || !rol){
                return new Response(
                    JSON.stringify({error: "Falta información de la persona"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            if(rol !== "Administrativo"){
                return new Response(
                    JSON.stringify({error: "El rol de la persona tiene que ser el de 'Administrativo'"}),
                );
            }

            let surname_2: string | undefined = ""

            if(!apellido_2){
                surname_2 = undefined;
            }
            else{
                surname_2 = apellido_2;
            }

            const persona_email = await PersonasCollection.findOne({email: email});
            const persona_DNI = await PersonasCollection.findOne({DNI: DNI});

            if(persona_email || persona_DNI){
                return new Response(
                    JSON.stringify({error: "Persona ya existente"}),
                    {
                        status: 409,
                        headers: headers,
                    }
                );
            }
            
            const email_validation = await Validate_Email(email);

            if(email_validation.status !== 200){
                return new Response(
                    JSON.stringify(await email_validation.json()),
                    {
                        status: email_validation.status,
                        headers: headers,
                    }
                );
            }

            let phone_prefix: string | undefined = "";
            let phone_number: string | undefined = "";

            if(!prefijo_movil || !numero_movil){
                phone_prefix = undefined;
                phone_number = undefined;
            }
            else{
                const validation = await Validate_Phone(prefijo_movil, numero_movil);

                if(validation.status === 200){
                    phone_prefix = prefijo_movil.replaceAll(" ","+");
                    phone_number = numero_movil;
                }
                else{
                    return new Response(
                        JSON.stringify(await validation.json()),
                        {
                            status: validation.status,
                            headers: headers,
                        }
                    );
                }
            }

            if(!password){
                return new Response(
                    JSON.stringify({error: "Falta información de la persona"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const { insertedId } = await PersonasCollection.insertOne(
                {
                    nombre: nombre,
                    apellido_1: apellido_1,
                    apellido_2: surname_2,
                    DNI: DNI,
                    prefijo_movil: phone_prefix,
                    numero_movil: phone_number,
                    email: email,
                    password: password,
                    rol: rol,
                }
            );

            return new Response(
                JSON.stringify(
                    {
                        message: `Administrativo exitosamente añadido`,
                        id: insertedId,
                    }
                ),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/titulacion"){
            const data = await req.json();
            const nombre: string | undefined = data.nombre;
            const universidades: {
                nombre: string,
                principal: boolean,
            }[] | undefined = data.universidades;
            const grados_aptos: string[] | undefined = data.grados_aptos;
            const cursos: number | undefined = data.cursos;
            const convocatorias: number | undefined = data.convocatorias;
            const administrativo: string | undefined = data.administrativo;
            const creditos_obligatorios: number | undefined = data.creditos_obligatorios;
            const creditos_optativos: number | undefined = data.creditos_optativos;
            const creditos_TFM: number | undefined = data.creditos_TFM;
            const asignaturas: {nombre: string, curso: string, creditos: number, optatividad: string}[] | undefined = data.asignaturas;

            if(!nombre || !universidades || !grados_aptos || !cursos || !convocatorias || !administrativo || !creditos_obligatorios || !creditos_optativos || !creditos_TFM){
                return new Response(
                    JSON.stringify({error: "Falta información de la titulación"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({nombre: nombre});

            if(titulacion_exists){
                return new Response(
                    JSON.stringify({error: `Titulación con nombre ${nombre} ya existente`}),
                    {
                        status: 409,
                        headers: headers,
                    }
                );
            }

            const TFM_Info = await AsignaturasCollection.insertOne(
                {
                    curso: `${cursos}º`,
                    creditos: creditos_TFM,
                    cursos: [],
                    optatividad: "Obligatoria",
                    tipo: "Bloque TFMs",
                }
            );

            const administrativo_exists = await PersonasCollection.findOne({_id: new ObjectId(administrativo)});

            if(!administrativo_exists){
                return new Response(
                    JSON.stringify({error: `Administrativo con id ${administrativo} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(administrativo_exists.rol !== "Administrativo"){
                return new Response(
                    JSON.stringify({error: `Persona con id ${administrativo} no tiene el rol de 'Coordinador', sino el de '${administrativo_exists.rol}'`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const administrativos: ObjectId[] = [];
            administrativos.push(administrativo_exists._id);

            const admin: Administrativo_Short[] = [];
            admin.push(
                {
                    id: administrativo_exists._id.toString(),
                    nombre: administrativo_exists.nombre,
                    apellido_1: administrativo_exists.apellido_1,
                    apellido_2: administrativo_exists.apellido_2,
                    email: administrativo_exists.email,
                    rol: administrativo_exists.rol,
                }
            );

            const date = new Date();
            let creationDate = 0;

            if(date.getMonth() + 1 <= 9){
                creationDate = date.getFullYear();
            }
            else{
                creationDate = date.getFullYear() + 1;
            }

            let new_asignaturas: ObjectId[] = [];
            let new_creditos_obligatorios = creditos_obligatorios;

            if(asignaturas){
                let creditos_oblig_totales = 0;

                asignaturas.forEach((asignatura) => {
                    creditos_oblig_totales += asignatura.creditos;
                });

                if(creditos_obligatorios < creditos_oblig_totales){
                    new_creditos_obligatorios = creditos_oblig_totales;
                }

                new_asignaturas = await Promise.all(asignaturas.map(async (asignatura) => {
                    const new_asig = await AsignaturasCollection.insertOne({
                        nombre: asignatura.nombre,
                        curso: asignatura.curso,
                        creditos: asignatura.creditos,
                        cursos_academicos: [],
                        optatividad: asignatura.optatividad,
                        tipo: "Asignatura",
                    });

                    return new_asig.insertedId;
                }));
            }

            const uni_principal = universidades.find((uni) => {
                if(uni.principal === true){
                    return uni;
                }
            });

            if(uni_principal === undefined){
                return new Response(
                    JSON.stringify({error: "No hay una universidad principal"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const { insertedId } = await TitulacionesCollection.insertOne(
                {
                    nombre: nombre,
                    creacion: creationDate,
                    controlCalidad: [],
                    universidades: universidades,
                    grados_aptos: grados_aptos,
                    cursos: cursos,
                    convocatorias_disponibles: convocatorias,
                    asignaturas: new_asignaturas,
                    requisitos_TFM: {
                        creditos_obligatorios: new_creditos_obligatorios,
                        creditos_optativos: creditos_optativos,
                    },
                    TFM: TFM_Info.insertedId,
                    administrativos: administrativos,
                    docentes: [],
                    alumnos: [],
                }
            );

            return new Response(
                JSON.stringify(
                    {
                        message: `Titulación exitosamente añadida`,
                        id: insertedId,
                        TFM: TFM_Info.insertedId,
                    }
                ),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/asignatura"){
            const data = await req.json();
            const nombre: string | undefined = data.nombre;
            const titulacion: string | undefined = data.titulacion;
            const curso: string | undefined = data.curso;
            const creditos: number | undefined = data.creditos;
            const optatividad: string | undefined = data.optatividad;

            if(!nombre || !curso || !creditos || !titulacion || !optatividad){
                return new Response(
                    JSON.stringify({error: "Falta información de la asignatura"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: `Titulación con id ${titulacion} no encontrada`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignaturasID: ObjectId[] = titulacion_exists.asignaturas;

            const asignaturasDB: (AsignaturaDB | TFM_Block_DB | null)[] = await Promise.all(asignaturasID.map(async (asig) => await AsignaturasCollection.findOne({_id: asig})));

            let creditosOblig = 0;
            asignaturasDB.forEach((asig) => {
                if(asig?.tipo === "Asignatura" && asig.optatividad === "Obligatoria"){
                    creditosOblig += asig.creditos;
                }
            });

            if(optatividad === "Obligatoria" && !(titulacion_exists.requisitos_TFM.creditos_obligatorios > (creditosOblig))){
                return new Response(
                    JSON.stringify({error: "No se puede añadir ninguna asignatura obligatoria más"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const asig_response = asignaturasDB.map((asigDB) => {
                if(asigDB !== null && asigDB.tipo !== "Asignatura"){
                    return new Response(
                        JSON.stringify({error: `Bloque de TFM con id ${asigDB._id!.toString()} encontrado`}),
                        {
                            status: 406,
                            headers: headers,
                        }
                    );
                }
                else if(asigDB !== null && asigDB.nombre === nombre){
                    return new Response(
                        JSON.stringify({error: `${nombre} ya existe en la titulación`}),
                        {
                            status: 409,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify({message: "Todo correcto"}),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            });
            
            const bad_response = asig_response.find((response) => {
                if(response.status !== 200){
                    return response;
                }
            });

            if(bad_response !== undefined){
                return new Response(
                    JSON.stringify(await bad_response.json()),
                    {
                        status: bad_response.status,
                        headers: headers,
                    }
                );
            }

            const curso_rep = Number(curso.replace("º",""));
            if(titulacion_exists.cursos < curso_rep){
                return new Response(
                    JSON.stringify({error: "El curso en el que se cursa la asignatura no puede ser superior a los que tiene la titulación"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const { insertedId } = await AsignaturasCollection.insertOne(
                {
                    nombre: nombre,
                    curso: curso,
                    cursos_academicos: [],
                    creditos: creditos,
                    optatividad: optatividad,
                    tipo: "Asignatura",
                }
            );

            asignaturasID.push(insertedId);

            const { modifiedCount } = await TitulacionesCollection.updateOne(
                {
                    _id: titulacion_exists._id,
                },
                {
                    $set: {
                        asignaturas: asignaturasID,
                    }
                }
            );

            if(modifiedCount === 0){
                return new Response(
                    JSON.stringify({error: "No se ha podido insertar la asignatura"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify(
                    {
                        message: `Asignatura exitosamente añadida`,
                        id: insertedId,
                    }
                ),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/curso"){
            const data = await req.json();
            const asignatura: string | undefined = data.asignatura;
            const curso: string | undefined = data.curso;

            if(!asignatura || !curso){
                return new Response(
                    JSON.stringify({error: "Falta algún dato de la asignatura"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const asignatura_exists = await AsignaturasCollection.findOne({_id: new ObjectId(asignatura)});

            if(!asignatura_exists){
                return new Response(
                    JSON.stringify({error: `Asignatura con id ${asignatura} no encontrada`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(asignatura_exists.tipo !== "Asignatura"){
                return new Response(
                    JSON.stringify({error: `Bloque de TFMs con id ${asignatura_exists._id} encontrada en vez de asignatura`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const titulacion_in = await TitulacionesCollection.findOne({asignaturas: asignatura_exists._id});

            if(!titulacion_in){
                return new Response(
                    JSON.stringify({error: "Titulación no encontrada"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }
            else if(titulacion_in.creacion > Number(curso.split(" ")[1].split("-")[0])){
                return new Response(
                    JSON.stringify({error: "La fecha del curso no puede ser inferior a la de creación de la titulación"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const curso_exists = asignatura_exists.cursos_academicos.find((academico) => {
                if(academico.curso_academico === curso){
                    return academico
                }
            });

            if(curso_exists !== undefined){
                return new Response(
                    JSON.stringify({error: `${curso} ya existe en la asignatura`}),
                    {
                        status: 409,
                        headers: headers,
                    }
                );
            }

            const profesores: string[] | undefined = data.profesores;
            const docentes: ObjectId[] = [];

            if(profesores){
                const docentes_exists = await PersonasCollection.find({email: {$in: profesores}}).toArray();

                if(profesores.length !== docentes_exists.length){
                    return new Response(
                        JSON.stringify({error: `${profesores.length - docentes_exists.length} docentes no encontrados`}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                const persona = docentes_exists.find((docente) => {
                    if(docente.rol !== "Coordinador" && docente.rol !== "Coordinador general" && docente.rol !== "Profesor"){
                        return docente;
                    }
                });

                if(persona !== undefined){
                    return new Response(
                        JSON.stringify({error: `Persona con id ${persona._id} tiene el rol de '${persona.rol}', no el de 'Profesor' o el de 'Coordinador'`}),
                        {
                            status: 406,
                            headers: headers,
                        }
                    );
                }

                docentes_exists.forEach((docente) => docentes.push(docente._id));
            }

            const estudiantes: string[] | undefined = data.estudiantes;
            const alumnos: ObjectId[] = [];
            const conv_ordinaria: AlumnoDB[] = [];

            if(estudiantes){
                const estudiantes_exists = await PersonasCollection.find({email: {$in: estudiantes}}).toArray();

                estudiantes_exists.forEach((alumno) => {
                    if(alumno.rol !== "Estudiante"){
                        return new Response(
                            JSON.stringify({error: `Persona con email ${alumno.email} no tiene rol de 'Estudiante', sino de '${alumno.rol}'`}),
                            {
                                status: 406,
                                headers: headers,
                            }
                        );
                    }
                    
                    alumnos.push(alumno._id);
                    
                    if(Number(curso.split(" ")[1].split("-")[0]) < Number(alumno.curso_admision.split(" ")[1].split("-")[0])){
                        let nombre_completo = alumno.nombre + " " + alumno.apellido_1;
                        if(alumno.apellido_2 !== null && alumno.apellido_2 !== undefined && alumno.apellido_2.trim() !== ""){
                            nombre_completo += alumno.apellido_2;
                        }
                        
                        return new Response(
                            JSON.stringify({error: `El alumno ${nombre_completo} no puede matricularse en una asignatura cuando aún no se había inscrito en la titulación`}),
                            {
                                status: 400,
                                headers: headers,
                            }
                        );
                    }

                    const asig_aprobada = alumno.asignaturas_aprobadas.find((asig) => {
                        if(asig.tipo === "Asignatura" && asig._id === new ObjectId(asignatura) && Number(asig.nota) >= 5.0){
                            return asig;
                        }
                    });

                    if(asig_aprobada !== undefined){
                        let nombre_completo = alumno.nombre + " " + alumno.apellido_1;
                        if(alumno.apellido_2 !== null && alumno.apellido_2 !== undefined && alumno.apellido_2.trim() !== ""){
                            nombre_completo += alumno.apellido_2;
                        }

                        return new Response(
                            JSON.stringify({error: `El alumno ${nombre_completo} ya tiene la asignatura aprobada`}),
                            {
                                status: 406,
                                headers: headers,
                            }
                        );
                    }

                    alumno.convocatorias_cursadas.forEach((curso) => {
                        if((curso.tipo === "Asignatura") && (curso.asignatura === new ObjectId(asignatura) && (curso.convocatoria_name === "Extraordinaria"))){
                            alumno.convocatorias_cursadas.push(curso);
                        }
                    });

                    let conv_dinamica: number = 0;

                    if(alumno.convocatorias_cursadas.length === 0){
                        conv_dinamica = 1;
                    }
                    else{
                        alumno.convocatorias_cursadas.forEach((asig) => {
                            if(asig.tipo === "Asignatura"){
                                const asig_split = asig.convocatoria_num.split("º");

                                if(Number(asig_split[0]) > conv_dinamica){
                                    conv_dinamica = Number(asig_split[0]);
                                }
                                else if((Number(asig_split[0]) === conv_dinamica) && (asig.nota === "No presentado")){
                                    conv_dinamica = Number(asig_split[0]);
                                }
                                else if((Number(asig_split[0]) === conv_dinamica) && (Number(asig.nota) < 5.0)){
                                    conv_dinamica = Number(asig_split[0])+1;
                                }
                            }
                        });
                    }

                    if(titulacion_in.convocatorias_disponibles < conv_dinamica){
                        return new Response(
                            JSON.stringify({error: `Alumno con email ${alumno.email} no puede matricularse por exceder el número de convocatorias`}),
                            {
                                status: 406,
                                headers: headers
                            }
                        );
                    }

                    conv_ordinaria.push(
                        {
                            estudiante: alumno._id,
                            convocatoria_num: `${conv_dinamica}º`,
                            convocatoria_name: "Ordinaria",
                            nota: "Sin calificar",
                            tipo: "Alumno",
                        }
                    );
                });

                estudiantes_exists.forEach(async (alumno) => {
                    if(alumno.rol !== "Estudiante"){
                        return;
                    }

                    const newAsigMatriculadas = alumno.asignaturas_matriculadas;

                    newAsigMatriculadas.push(
                        {
                            asignatura: asignatura_exists._id,
                            curso_academico: curso,
                            tipo: "Asignatura",
                        }
                    );
                    const { modifiedCount } = await PersonasCollection.updateOne(
                        {
                            _id: alumno._id
                        },
                        {
                            $set: {
                                asignaturas_matriculadas: newAsigMatriculadas,
                            }
                        }
                    );

                    if(modifiedCount === 0){
                        return new Response(
                            JSON.stringify({error: `No se han podido actualizar las asignaturas matriculas del alumno con email ${alumno.email}`}),
                            {
                                status: 406,
                                headers: headers,
                            }
                        );
                    }
                });
            }

            if(alumnos.length !== conv_ordinaria.length){
                return new Response(
                    JSON.stringify({error: `${alumnos.length - conv_ordinaria.length} alumnos no se han podido insertar en la convocatoria ordinaria`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const new_curso_id: ObjectId = new ObjectId();

            const new_curso: Asignatura_curso_DB = {
                id: new_curso_id,
                curso_academico: curso,
                profesores: docentes,
                estudiantes: alumnos,
                alumnos_ordinaria: conv_ordinaria,
                ordinaria_firmada: false,
                alumnos_extraordinaria: [],
                extraordinaria_firmada: false,
                tipo: "Curso",
            }

            asignatura_exists.cursos_academicos.push(new_curso);

            const { modifiedCount } = await AsignaturasCollection.updateOne(
                {
                    _id: new ObjectId(asignatura),
                },
                {
                    $set: {cursos_academicos: asignatura_exists.cursos_academicos}
                }
            );

            if(modifiedCount === 0){
                return new Response(
                    JSON.stringify({error: "No se ha insertado en curso en la asignatura"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify(
                    {
                        message: `Curso exitosamente añadido`,
                        id: new_curso_id.toString(),
                    }
                ),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/cursoTFM"){
            const data = await req.json();
            const nombre: string | undefined = data.nombre;
            const alumnos: string[] | undefined = data.alumnos;
            const titulacion: string | undefined = data.titulacion;

            if(!nombre || !alumnos || !titulacion){
                 return new Response(
                    JSON.stringify({error: "Falta información del TFM"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id: new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: "Titulación no encontrada"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }
            else if(titulacion_exists.creacion > Number(nombre.split(" ")[1].split("-")[0])){
                return new Response(
                    JSON.stringify({error: "La fecha del curso no puede ser inferior a la de creación de la titulación"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const asignaturas = await AsignaturasCollection.find({_id: {$in: titulacion_exists.asignaturas}}).toArray();

            if(titulacion_exists.asignaturas.length !== asignaturas.length){
                return new Response(
                    JSON.stringify({error: `${titulacion_exists.asignaturas.length - asignaturas.length} asignaturas no encontradas`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const asignatura_error = asignaturas.find((asig) => {
                if(asig.tipo !== "Asignatura"){
                    return asig;
                }
            });

            if(asignatura_error !== undefined){
                return new Response(
                    JSON.stringify({error: "Se ha encontrado un bloque de TFMs en vez de una asignatura"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const TFM_Block_Exists = await AsignaturasCollection.findOne({_id: titulacion_exists.TFM});

            if(!TFM_Block_Exists){
                return new Response(
                    JSON.stringify({error: "Bloque de TFMs no encontrado"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(TFM_Block_Exists.tipo === "Asignatura"){
                return new Response(
                    JSON.stringify({error: "Se ha encontrado una asignatura en vez de un bloque de TFMs"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const curso_error = TFM_Block_Exists.cursos.find((cursito) => {
                if(cursito.nombre === nombre){
                    return cursito;
                }
            });

            if(curso_error !== undefined){
                return new Response(
                    JSON.stringify({error: `${curso_error.nombre} ya existente en la asignatura`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const estudiantes_exists = await PersonasCollection.find({email: {$in: alumnos}}).toArray();

            if(alumnos.length !== estudiantes_exists.length){
                return new Response(
                    JSON.stringify({erro: `${alumnos.length - estudiantes_exists.length} estudiantes no encontrados`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const alumnosDB: ObjectId[] = [];
            
            const rol_error = estudiantes_exists.find((alumno) => {
                if(alumno.rol !== "Estudiante"){
                    return alumno;
                }
                else{
                    alumnosDB.push(alumno._id);
                }
            });

            if(rol_error !== undefined){
                return new Response(
                    JSON.stringify({error: `Persona con email ${rol_error.email} no tiene rol de 'Estudiante', sino de '${rol_error.rol}'`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const asignaturas_aprobadas_error = estudiantes_exists.find((alumno) => {
                if(alumno.rol === "Estudiante"){
                    let creditos_obligatorios_aprobados = 0;
                    let creditos_optativos_aprobados = 0;

                    alumno.asignaturas_aprobadas.forEach((asig1) => {
                        asignaturas.forEach((asig2) => {
                            if(asig1.tipo === "Asignatura" && asig2.tipo === "Asignatura" && asig2._id.toString() === asig1.asignatura.toString()){
                                if(asig2.optatividad === "Obligatoria"){
                                    creditos_obligatorios_aprobados += asig2.creditos;
                                }
                                else if(asig2.optatividad === "Optativa"){
                                    creditos_optativos_aprobados += asig2.creditos;
                                }
                            }
                        });
                    });

                    if(creditos_obligatorios_aprobados < titulacion_exists.requisitos_TFM.creditos_obligatorios){
                        return alumno;
                    }
                    else if(creditos_optativos_aprobados < titulacion_exists.requisitos_TFM.creditos_optativos){
                        return alumno;
                    }
                }
            });

            if(asignaturas_aprobadas_error !== undefined){
                return new Response(
                    JSON.stringify({error: `Alumno con email ${asignaturas_aprobadas_error.email} no tiene todos los creditos obligatorios u optativos aprobados para defender el TFM`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const matricula_error = estudiantes_exists.find((alumno) => {
                if(alumno.rol === "Estudiante"){
                    alumno.asignaturas_matriculadas.forEach((asig) => {
                        if(asig.asignatura.toString() === TFM_Block_Exists._id.toString() && asig.curso_academico === nombre){
                            return alumno;
                        }
                    });
                }
            });

            if(matricula_error !== undefined){
                return new Response(
                    JSON.stringify({error: `Alumno con email ${matricula_error.email} ya está matriculado en el ${nombre}`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const TFM_error = estudiantes_exists.find((alumno) => {
                if(alumno.rol === "Estudiante"){
                    const tfg_aprobado = alumno.asignaturas_aprobadas.find((asig) => {
                        if(asig.tipo === "TFM"){
                            return asig;
                        }
                    });

                    if(tfg_aprobado !== undefined){
                        return alumno;
                    }
                }     
            });

            if(TFM_error !== undefined){
                return new Response(
                    JSON.stringify({error: `Persona con email ${TFM_error.email} tiene el TFM aprobado`})
                );
            }

            estudiantes_exists.forEach(async (alumno) => {
                if(alumno.rol === "Estudiante"){
                    alumno.asignaturas_matriculadas.push(
                        {
                            asignatura: TFM_Block_Exists._id,
                            curso_academico: nombre,
                            tipo: "TFM",
                        }
                    );

                    const { modifiedCount } = await PersonasCollection.updateOne(
                        {
                            _id: alumno._id,
                        },
                        {
                            $set: {
                                asignaturas_matriculadas: alumno.asignaturas_matriculadas,
                            }
                        }
                    );

                    if(modifiedCount === 0){
                        return new Response(
                            JSON.stringify({error: `No se ha modificado las asignaturas matriculadas del alumno con email ${alumno.email}`}),
                            {
                                status: 404,
                                headers: headers,
                            }
                        );
                    }
                }
            });

            const Curso_TFM_Id = new ObjectId();

            TFM_Block_Exists.cursos.push(
                {
                    id: Curso_TFM_Id,
                    nombre: nombre,
                    alumnos: alumnosDB,
                    TFM: [],
                    tipo: "Curso TFM",
                }
            );

            const { modifiedCount } = await AsignaturasCollection.updateOne(
                {
                    _id: TFM_Block_Exists._id
                },
                {
                    $set: {
                        cursos: TFM_Block_Exists.cursos,
                    }
                }
            );

            if(modifiedCount === 0){
                return new Response(
                    JSON.stringify({error: "No se ha podido crear el curso"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify({message: `${nombre} ha sido insertado exitosamente`}),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/cursoPracticas"){}
        else if(path === "/curso/calificar_convocatoria"){
            const data = await req.json();
            const asignatura: string | undefined = data.asignatura;
            const curso: string | undefined = data.curso;
            const convocatoria: "Ordinaria" | "Extraordinaria" | undefined = data.convocatoria;
            const notas: {
                alumno: string,
                nota: "Sin calificar" | "No presentado" | number,
                convocatoria_num: string,
            }[] | undefined = data.notas;
            const academico: string | undefined = data.academico;

            if(!asignatura || !curso || !convocatoria || !notas || !academico){
                return new Response(
                    JSON.stringify({error: `Faltan datos para actualizar las notas de la convocatoria de la asignatura`}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }
            
            /*const currentDate = new Date();
            if(currentDate.getMonth() + 1 < 9 && Number(academico.split(" ")[1].split("-")[0]) <= currentDate.getFullYear()){
                return new Response(
                    JSON.stringify({error: "No se puede calificar una asingatura antes de que empiece"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }
            else if(
                (currentDate.getMonth() + 1 >= 9 && Number(academico.split(" ")[1].split("-")[1]) === currentDate.getFullYear()) ||
                (Number(academico.split(" ")[1].split("-")[1]) > currentDate.getFullYear())
            ){
                return new Response(
                    JSON.stringify({error: `No se puede calificar una asignatura una vez acabado el curso`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }*/

            const asignatura_exists = await AsignaturasCollection.findOne({_id: new ObjectId(asignatura)});

            if(!asignatura_exists){
                return new Response(
                    JSON.stringify({error: "Asignatura no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(asignatura_exists.tipo !== "Asignatura"){
                return new Response(
                    JSON.stringify({error: "Bloque de TFM encontrado en vez de una asignatura"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const curso_exists = asignatura_exists.cursos_academicos.find((cursito) => {
                if(cursito.id.toString() === curso){
                    return cursito;
                }
            });

            if(curso_exists === undefined){
                return new Response(
                    JSON.stringify({error: `Curso no encontrado en ${asignatura_exists.nombre}`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            if(convocatoria === "Extraordinaria" && notas.length === 0){
                curso_exists.extraordinaria_firmada = true;

                const asignatura_upt: AsignaturaDB = {
                    _id: asignatura_exists._id,
                    nombre: asignatura_exists.nombre,
                    curso: asignatura_exists.curso,
                    creditos: asignatura_exists.creditos,
                    cursos_academicos: [],
                    optatividad: asignatura_exists.optatividad,
                    tipo: asignatura_exists.tipo,
                }

                asignatura_exists.cursos_academicos.forEach((curso) => {
                    if(curso.id.toString() === curso_exists.id.toString()){
                        asignatura_upt.cursos_academicos.push(curso_exists);
                    }
                    else{
                        asignatura_upt.cursos_academicos.push(curso);
                    }
                });

                const { modifiedCount } = await AsignaturasCollection.updateOne(
                    {_id: asignatura_upt._id},
                    {
                        $set: {
                            cursos_academicos: asignatura_upt.cursos_academicos,
                        }
                    }
                );

                if(modifiedCount === 0){
                    return new Response(
                        JSON.stringify({error: "No se han podido actualizar las notas de la convocatoria extraordinaria"}),
                        {
                            status: 404,
                            headers: headers, 
                        }
                    );
                }

                return new Response(
                    JSON.stringify({message: "Notas de la convocatoria extraordinaria exitosamente actualizadas"}),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }

            const notasError = notas.find((dato) => {
                if(dato.nota === "Sin calificar"){
                    return dato;
                }
            });

            if(notasError !== undefined){
                return new Response(
                    JSON.stringify({error: "Hay al menos un alumno al que no le han calidficado"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const alumnosNotas = notas.map((nota) => new ObjectId(nota.alumno));

            const alumnosExists = await PersonasCollection.find({_id: {$in: alumnosNotas}}).toArray();

            if(alumnosNotas.length !== alumnosExists.length){
                return new Response(
                    JSON.stringify({error: `${alumnosNotas.length - alumnosExists.length} alumnos no encontrados`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const alumnoError = alumnosExists.find((alumno) => {
                if(alumno.rol !== "Estudiante"){
                    return alumno;
                }
            });

            if(alumnoError !== undefined){
                return new Response(
                    JSON.stringify({error: `Se ha encontrado un ${alumnoError.rol.toLowerCase()} entre los alumnos evaluados`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }
            
            const convocatoria_ordinaria: AlumnoDB[] = [];
            const convocatoria_extraordinaria: AlumnoDB[] = [];

            const asignatura_upt: AsignaturaDB = {
                _id: asignatura_exists._id,
                nombre: asignatura_exists.nombre,
                curso: asignatura_exists.curso,
                creditos: asignatura_exists.creditos,
                cursos_academicos: [],
                optatividad: asignatura_exists.optatividad,
                tipo: asignatura_exists.tipo,
            }
            
            if(convocatoria === "Ordinaria"){
                curso_exists.ordinaria_firmada = true;

                notas.forEach((notaAlumno) => {
                    alumnosExists.forEach(async (alumno) => {
                        if(notaAlumno.alumno === alumno._id.toString() && alumno.rol === "Estudiante"){
                            const asignaturas_presentadas:{
                                asignatura: ObjectId,
                                curso_academico: string,
                                tipo: "Asignatura" | "TFM",
                            }[] = alumno.asignaturas_presentadas;
                            const asignaturas_aprobadas: (TFM_alumno_DB | Asignatura_alumno_DB)[] = alumno.asignaturas_aprobadas;
                            const convocatorias_cursadas: (TFM_alumno_DB | Asignatura_alumno_DB)[] = alumno.convocatorias_cursadas;

                            if(Number(notaAlumno.nota) >= 5){
                                asignaturas_aprobadas.push(
                                    {
                                        asignatura: asignatura_exists._id,
                                        convocatoria_name: convocatoria,
                                        convocatoria_num: notaAlumno.convocatoria_num,
                                        curso: curso_exists.curso_academico,
                                        nota: notaAlumno.nota,
                                        tipo: "Asignatura",
                                    }
                                );
                            }

                            convocatorias_cursadas.push(
                                {
                                    asignatura: asignatura_exists._id,
                                    convocatoria_name: convocatoria,
                                    convocatoria_num: notaAlumno.convocatoria_num,
                                    curso: curso_exists.curso_academico,
                                    nota: notaAlumno.nota,
                                    tipo: "Asignatura",
                                }
                            );

                            if(notaAlumno.nota !== "No presentado"){
                                asignaturas_presentadas.push(
                                    {
                                        asignatura: asignatura_exists._id,
                                        curso_academico: curso_exists.curso_academico,
                                        tipo: "Asignatura",
                                    }
                                );
                            }
                            
                            const { modifiedCount } = await PersonasCollection.updateOne(
                                {
                                    _id: alumno._id,
                                },
                                {
                                    $set: {
                                        asignaturas_presentadas: asignaturas_presentadas,
                                        asignaturas_aprobadas: asignaturas_aprobadas,
                                        convocatorias_cursadas: convocatorias_cursadas,
                                    }
                                }
                            );

                            if(modifiedCount === 0){
                                return new Response(
                                    JSON.stringify({error: `Error al actualizar las notas del alumno con email ${alumno.email}`}),
                                    {
                                        status: 404,
                                        headers: headers,
                                    }
                                );
                            }
                        }
                    });

                    convocatoria_ordinaria.push({
                        "estudiante": new ObjectId(notaAlumno.alumno),
                        "convocatoria_num": notaAlumno.convocatoria_num,
                        "convocatoria_name": "Ordinaria",
                        "nota": notaAlumno.nota,
                        "tipo": "Alumno",
                    });

                    if(Number(notaAlumno.nota) < 5){
                        convocatoria_extraordinaria.push({
                            "estudiante": new ObjectId(notaAlumno.alumno),
                            "convocatoria_num": `${Number(notaAlumno.convocatoria_num.split("º")[0]) + 1}º`,
                            "convocatoria_name": "Extraordinaria",
                            "nota": "Sin calificar",
                            "tipo": "Alumno",
                        });
                    }
                    else if(notaAlumno.nota === "No presentado"){
                        convocatoria_extraordinaria.push({
                            "estudiante": new ObjectId(notaAlumno.alumno),
                            "convocatoria_num": notaAlumno.convocatoria_num,
                            "convocatoria_name": "Extraordinaria",
                            "nota": "Sin calificar",
                            "tipo": "Alumno",
                        });
                    }
                });

                curso_exists.alumnos_ordinaria = convocatoria_ordinaria;
                curso_exists.alumnos_extraordinaria = convocatoria_extraordinaria;
            }
            else if(convocatoria === "Extraordinaria"){
                curso_exists.extraordinaria_firmada = true;

                notas.forEach((notaAlumno) => {
                    alumnosExists.forEach(async (alumno) => {
                        if(notaAlumno.alumno === alumno._id.toString() && alumno.rol === "Estudiante"){
                            const asignaturas_presentadas:{
                                asignatura: ObjectId,
                                curso_academico: string,
                                tipo: "Asignatura" | "TFM",
                            }[] = alumno.asignaturas_presentadas;
                            const asignaturas_aprobadas: (TFM_alumno_DB | Asignatura_alumno_DB)[] = alumno.asignaturas_aprobadas;
                            const convocatorias_cursadas: (TFM_alumno_DB | Asignatura_alumno_DB)[] = alumno.convocatorias_cursadas;

                            if(Number(notaAlumno.nota) >= 5){
                                asignaturas_aprobadas.push(
                                    {
                                        asignatura: asignatura_exists._id,
                                        convocatoria_name: convocatoria,
                                        convocatoria_num: notaAlumno.convocatoria_num,
                                        curso: curso_exists.curso_academico,
                                        nota: notaAlumno.nota,
                                        tipo: "Asignatura",
                                    }
                                );
                            }

                            convocatorias_cursadas.push(
                                {
                                    asignatura: asignatura_exists._id,
                                    convocatoria_name: convocatoria,
                                    convocatoria_num: notaAlumno.convocatoria_num,
                                    curso: curso_exists.curso_academico,
                                    nota: notaAlumno.nota,
                                    tipo: "Asignatura",
                                }
                            );

                            if(notaAlumno.nota !== "No presentado"){
                                const asignatura_presentada = asignaturas_presentadas.find((asig) => {
                                    if(asig.asignatura.toString() === asignatura_exists._id.toString() && asig.curso_academico === curso_exists.curso_academico){
                                        return asig;
                                    }
                                });

                                if(asignatura_presentada === undefined){
                                    asignaturas_presentadas.push(
                                        {
                                            asignatura: asignatura_exists._id,
                                            curso_academico: curso_exists.curso_academico,
                                            tipo: "Asignatura",
                                        }
                                    );
                                }
                            }

                            const { modifiedCount } = await PersonasCollection.updateOne(
                                {
                                    _id: alumno._id,
                                },
                                {
                                    $set: {
                                        asignaturas_presentadas: asignaturas_presentadas,
                                        asignaturas_aprobadas: asignaturas_aprobadas,
                                        convocatorias_cursadas: convocatorias_cursadas,
                                    }
                                }
                            );

                            if(modifiedCount === 0){
                                return new Response(
                                    JSON.stringify({error: `Error al actualizar las notas del alumno con email ${alumno.email}`}),
                                    {
                                        status: 404,
                                        headers: headers,
                                    }
                                );
                            }
                        }
                    });

                    convocatoria_extraordinaria.push({
                        "estudiante": new ObjectId(notaAlumno.alumno),
                        "convocatoria_num": notaAlumno.convocatoria_num,
                        "convocatoria_name": "Extraordinaria",
                        "nota": notaAlumno.nota,
                        "tipo": "Alumno",
                    });
                });

                curso_exists.alumnos_extraordinaria = convocatoria_extraordinaria;
            }

            asignatura_exists.cursos_academicos.forEach((cursito) => {
                if(cursito.id.toString() === curso_exists.id.toString()){
                    asignatura_upt.cursos_academicos.push(curso_exists);
                }
                else{
                    asignatura_upt.cursos_academicos.push(cursito);
                }
            });

            const { modifiedCount } = await AsignaturasCollection.updateOne(
                {
                    _id: asignatura_upt._id,
                },
                {
                    $set: {
                        cursos_academicos: asignatura_upt.cursos_academicos,
                    }
                }
            );

            if(modifiedCount === 0){
                return new Response(
                JSON.stringify({message: "No se han podido actualizar las notas"}),
                {
                    status: 404,
                    headers: headers,
                }
            );
            }

            return new Response(
                JSON.stringify({message: "Notas exitosamente actualizadas"}),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/TFM"){
            const data = await req.json();
            const titulacion: string | undefined = data.titulacion;
            const titulo: string | undefined = data.titulo;
            const alumno: string | undefined = data.alumno;
            const director: string[] | undefined = data.director;
            const tribunal: string[] | undefined = data.tribunal;
            const curso: string | undefined = data.curso;
            const fecha_def: string | undefined = data.fecha_def;
            const hora_def: string | undefined  = data.hora_def;
            const convocatoria: string | undefined = data.convocatoria;
            const nota: number | "No presentado" | undefined = data.nota;

            if(!titulacion || !titulo || !alumno || !director || !tribunal || !curso || !fecha_def || !hora_def || !convocatoria || !nota){
                return new Response(
                    JSON.stringify({error: "Falta información del TFM"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }
            
            const currentDate = new Date();
            if(currentDate.getMonth() + 1 < 9 && Number(curso.split(" ")[1].split("-")[0]) <= currentDate.getFullYear()){
                return new Response(
                    JSON.stringify({error: "No se puede calificar un TFM antes de que su curso empiece"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }
            else if(currentDate.getFullYear() >= (Number(curso.split(" ")[1].split("-")[1]) + 1)){
                return new Response(
                    JSON.stringify({error: `No se puede calificar un TFM ${currentDate.getFullYear() - Number(curso.split(" ")[1].split("-")[1]) + 1} años tarde`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const titulacion_exists = await TitulacionesCollection.findOne({_id:  new ObjectId(titulacion)});

            if(!titulacion_exists){
                return new Response(
                    JSON.stringify({error: "La titulación del TFM no ha sido encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(titulacion_exists.creacion > Number(fecha_def.split("-")[2])){
                return new Response(
                    JSON.stringify({error: "La fecha de la defensa no puede ser inferior a la de creación de la titulación"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const TFM_block = await AsignaturasCollection.findOne({_id: titulacion_exists.TFM});

            if(!TFM_block){
                return new Response(
                    JSON.stringify({error: `Bloque de TFM de la titulación ${titulacion_exists.nombre} no ha sido encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(TFM_block.tipo !== "Bloque TFMs"){
                return new Response(
                    JSON.stringify({error: `Asignatura con id ${TFM_block._id} encontrada en vez de bloque de TFMs`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const alumno_exists = await PersonasCollection.findOne({DNI: alumno});

            if(!alumno_exists){
                return new Response(
                    JSON.stringify({error: `Alumno con DNI ${alumno} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(alumno_exists.rol !== "Estudiante"){
                return new Response(
                    JSON.stringify({error: `Persona con DNI ${alumno} no tiene rol de 'Estudiante', sino de '${alumno_exists.rol}'`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const tfm_presentado = alumno_exists.asignaturas_presentadas.find((asig) => {
                if(asig.tipo === "TFM" && asig.asignatura.toString() === TFM_block._id.toString() && asig.curso_academico === curso){
                    return asig;
                }
            });

            if(tfm_presentado === undefined && nota !== "No presentado"){
                alumno_exists.asignaturas_presentadas.push(
                    {
                        asignatura: TFM_block._id,
                        curso_academico: curso,
                        tipo: "TFM",
                    }
                );
            }

            const asignaturas_alumno: Asignatura_alumno_DB[] = []
            const tfms_alumno: TFM_alumno_DB[]= []

            alumno_exists.asignaturas_aprobadas.forEach((asignatura) => {
                if(asignatura.tipo === "Asignatura"){
                    asignaturas_alumno.push(asignatura);
                }
                else if(asignatura.tipo === "TFM"){
                    tfms_alumno.push(asignatura);
                }
            });

            if(tfms_alumno.length === 1){
                const block_exists = await AsignaturasCollection.findOne({_id: titulacion_exists.TFM});

                if(!block_exists){
                    return new Response(
                        JSON.stringify({error: "Bloque de TFMs no encontrado"}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }
                else if(block_exists.tipo === "Asignatura"){
                    return new Response(
                        JSON.stringify({error: "Asignatura encontrada en vez de bloque de TFMs"}),
                        {
                            status: 406,
                            headers: headers,
                        }
                    );
                }

                const TFM_exists = alumno_exists.asignaturas_aprobadas.find((asig) => {
                    if(asig.tipo === "TFM"){
                        return asig;
                    }
                });

                if(TFM_exists !== undefined && TFM_exists.tipo === "TFM" && TFM_exists.convocatoria.nota !== "Sin calificar" && TFM_exists.convocatoria.nota !== "No presentado" && Number(TFM_exists.convocatoria.nota) >= 5.0){
                    return new Response(
                        JSON.stringify({error: "El alumno ya ha presentado el TFM"}),
                        {
                            status: 406,
                            headers: headers,
                        }
                    );
                }
                else if(TFM_exists !== undefined && (TFM_exists.tipo === "TFM" && (TFM_exists.convocatoria.nota === "Sin calificar" || TFM_exists.convocatoria.nota === "No presentado" || Number(TFM_exists.convocatoria.nota) < 5.0))){
                    return new Response(
                        JSON.stringify({error: "Error al catalogar el TFM"}),
                        {
                            status: 406,
                            headers: headers,
                        }
                    );
                }
                else if(TFM_exists !== undefined && TFM_exists.tipo === "Asignatura"){
                    return new Response(
                        JSON.stringify({error: "Se ha encontrado una asignatura en vez de un TFM"}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }
            }
            else if(tfms_alumno.length >= 2){
                return new Response(
                    JSON.stringify({error: "El alumno no ha podido presentar más de un TFM"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const asignaturas_alumno_id = asignaturas_alumno.map((asignatura) => asignatura.asignatura);

            const asignaturas_exists = await AsignaturasCollection.find({_id: {$in: asignaturas_alumno_id}}).toArray();

            const asignatura_exists_error = asignaturas_exists.find((asignatura) => {
                if(asignatura.tipo === "Bloque TFMs"){
                    return asignatura;
                }
            });

            if(asignaturas_alumno_id.length !== asignaturas_exists.length){
                return new Response(
                    JSON.stringify({error: `${asignaturas_alumno_id.length - asignaturas_exists.length} asignaturas no encontradas`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            if(asignatura_exists_error !== undefined){
                return new Response(
                    JSON.stringify({error: "Bloque de TFMs encontrado en vez de asignatura"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            let creditos_asigs_obligatorias = 0;
            let creditos_asigs_optativas = 0;

            asignaturas_exists.forEach((asignatura) => {
                if(asignatura.tipo === "Asignatura" && asignatura.optatividad === "Obligatoria"){
                    creditos_asigs_obligatorias += asignatura.creditos;
                }
                else if(asignatura.tipo === "Asignatura" && asignatura.optatividad === "Optativa"){
                    creditos_asigs_optativas += asignatura.creditos;
                }
            });

            if(titulacion_exists.requisitos_TFM.creditos_obligatorios > creditos_asigs_obligatorias){
                return new Response(
                    JSON.stringify({error: `Al alumno le faltan ${titulacion_exists.requisitos_TFM.creditos_obligatorios - creditos_asigs_obligatorias} creditos de asignaturas obligatorias para poder presentar el TFM`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }
            else if(titulacion_exists.requisitos_TFM.creditos_optativos > creditos_asigs_optativas){
                return new Response(
                    JSON.stringify({error: `Al alumno le faltan ${titulacion_exists.requisitos_TFM.creditos_optativos - creditos_asigs_optativas} creditos de asignaturas optativas para poder presentar el TFM`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const director_id = director.map((docente) => new ObjectId(docente));            
            const director_exists = await PersonasCollection.find({_id: {$in: director_id}}).toArray();

            if(director.length !== director_exists.length){
                return new Response(
                    JSON.stringify({error: `${director.length - director_exists.length} director/es no encontrados`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const director_rol = director_exists.find((docente) => {
                if(docente.rol !== "Profesor" && docente.rol !== "Coordinador" && docente.rol !== "Coordinador general"){
                    return docente;
                }
            });

            if(director_rol !== undefined){
                return new Response(
                    JSON.stringify({error: `Persona con rol de '${director_rol.rol}' debería tener el rol de 'Profesor' ni de 'Coordinador'`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }
            
            const id_director: ObjectId[] = director_exists.map((docente) => docente._id);

            const tribunal_id = tribunal.map((miembro) => new ObjectId(miembro));

            const tribunal_exists = await PersonasCollection.find({_id: {$in: tribunal_id}}).toArray();

            if(tribunal.length !== tribunal_exists.length){
                return new Response(
                    JSON.stringify({error: `${tribunal.length - tribunal_exists.length} miembro/s del tribunal no encontrados`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const tribunal_rol = tribunal_exists.find((docente) => {
                if(docente.rol !== "Profesor" && docente.rol !== "Coordinador" && docente.rol !== "Coordinador general"){
                    return docente;
                }
            });

            if(tribunal_rol !== undefined){
                return new Response(
                    JSON.stringify({error: `Persona con rol de '${tribunal_rol.rol}' debería tener el rol de 'Profesor' ni de 'Coordinador'`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const id_tribunal: ObjectId[] = tribunal_exists.map((miembro) => miembro._id);

            if(typeof nota === "string" && nota !== "No presentado"){
                return new Response(
                    JSON.stringify({error: `La nota tiene que ser un número o 'No presentado', no '${nota}'`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const TFM_curso_exists = alumno_exists.convocatorias_cursadas.find((asig) => {
                if((asig.tipo === "TFM") && (asig.curso_academico === curso) && (asig.convocatoria.nombre === convocatoria)){
                    return asig;
                }
            });

            if(TFM_curso_exists !== undefined){
                return new Response(
                    JSON.stringify({error: `Alumno con email ${alumno_exists.email} ya se presentó en el ${curso.toLowerCase()} en la convocatoria ${convocatoria}`}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            const TFM_aprobado = alumno_exists.convocatorias_cursadas.find((asig) => {
                if((asig.tipo === "TFM") && (Number(asig.convocatoria.nota) >= 5)){
                    return asig;
                }
            });

            if(TFM_aprobado !== undefined){
                return new Response(
                    JSON.stringify({error: `Alumno con email ${alumno_exists.email} ya ha aprobado el TFM`}),
                    {
                        headers: headers,
                    }
                );
            }

            const TFM_new_ID = new ObjectId();

            let convNum = 0;

            alumno_exists.convocatorias_cursadas.forEach((asig) => {
                if(asig.tipo === "TFM" && Number(asig.convocatoria_num.split("º")[0]) > convNum){
                    convNum = Number(asig.convocatoria_num.split("º")[0]);
                }
            });

            const new_TFM: TFM_DB = {
                _id: TFM_new_ID,
                bloque: TFM_block._id,
                titulo: titulo,
                curso_academico: curso,
                estudiante: alumno_exists._id,
                director: id_director,
                miembros_tribunal: id_tribunal,
                fecha_defensa: fecha_def,
                hora_defensa: hora_def,
                convocatoria: {
                    nombre: convocatoria,
                    nota: nota,
                },
                convocatoria_num: `${convNum + 1}º`,
                tipo: "TFM",
            }

            const new_cursos: TFM_Block_Curso_DB[] = [];

            const curso_academico = TFM_block.cursos.find((curs) => {
                if(curs.nombre === curso){
                    return curs;
                }
                else{
                    new_cursos.push(curs);
                }
            });

            if(curso_academico === undefined){
                return new Response(
                    JSON.stringify({error: "No se ha encontrado el curso de los TFM"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            curso_academico.TFM.push(new_TFM);

            new_cursos.push(curso_academico);

            const { modifiedCount } = await AsignaturasCollection.updateOne(
                {
                    _id: TFM_block._id,
                },
                {
                    $set: {
                        cursos: new_cursos,
                    }
                }
            );

            if(modifiedCount === 0){
                return new Response(
                    JSON.stringify({error: "Bloque de TFMs no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            const new_TFM_data: TFM_alumno_DB = {
                TFM: TFM_new_ID,
                bloque: TFM_block._id,
                titulo: titulo,
                curso_academico: curso,
                fecha_defensa: fecha_def,
                hora_defensa: hora_def,
                convocatoria: {
                    nombre: convocatoria,
                    nota: nota,
                },
                convocatoria_num: `${convNum + 1}º`,
                tipo: "TFM",
            }

            alumno_exists.convocatorias_cursadas.push(new_TFM_data);

            if((nota !== "No presentado") && (nota >= 5.0)){
                alumno_exists.asignaturas_aprobadas.push(new_TFM_data);
                alumno_exists.graduado = true;
            }

            const alumno_update = await PersonasCollection.updateOne(
                {_id: alumno_exists._id},
                {
                    $set: {
                        asignaturas_presentadas: alumno_exists.asignaturas_presentadas,
                        convocatorias_cursadas: alumno_exists.convocatorias_cursadas,
                        asignaturas_aprobadas: alumno_exists.asignaturas_aprobadas,
                        graduado: alumno_exists.graduado,
                    }
                }
            );

            if(alumno_update.modifiedCount === 0){
                return new Response(
                    JSON.stringify({error: `Alumno con id ${alumno_exists._id.toString()} no actualizado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify(
                    {
                        message: `TFM ha sido exitosamente insertado`,
                        id: TFM_new_ID.toString(),
                    }
                ),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
    }
    else if(method === "PUT"){
        if(path === "/datos_persona"){
            const data = await req.json();
            const id: string | undefined = data.id;
            const rol: "Estudiante" | "Profesor" | "Coordinador" | "Administrativo" | undefined = data.rol;
            const nombre: string | undefined = data.nombre;
            const apellido_1: string | undefined = data.apellido_1;
            const apellido_2: string | undefined = data.apellido_2;
            const password: string | undefined = data.password;
            const prefix: string | undefined = data.prefix;
            const phone: string | undefined = data.phone;

            if(!id && !rol){
                return new Response(
                    JSON.stringify({error: "ID y rol no encontrado"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                )
            }
            
            let pass = "";
            if(password === undefined || password === null || password === ""){
                const user = await PersonasCollection.findOne({_id: new ObjectId(id)});

                if(!user){
                    return new Response(
                        JSON.stringify({error: "Persona no encontrada"}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }
                else if(user.rol !== "Estudiante"){
                    pass = user.password;
                }
            }
            else{
                pass = password;
            }

            if(!nombre && !apellido_1){
                return new Response(
                    JSON.stringify({error: "Tienes que aportar algún dato para actualizar"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }
            
            if(prefix && phone){
                const data = await Validate_Phone(prefix, phone);

                if(data.status !== 200){
                    return new Response(
                        JSON.stringify(await data.json()),
                        {
                            status: data.status,
                            headers: headers,
                        }
                    );
                }

                const phone_error = await PersonasCollection.findOne({prefijo_movil: prefix, numero_movil: phone});

                if(phone_error && phone_error._id.toString() && id){
                    return new Response(
                        JSON.stringify({error: `Teléfono ${prefix} ${phone} ya pertenece a otra persona`}),
                        {
                            status: 409,
                            headers: headers,
                        }
                    );
                }
            }

            if(rol === "Estudiante"){
                const { modifiedCount } = await PersonasCollection.updateOne(
                    {_id: new ObjectId(id)},
                    {$set:
                        {
                            nombre: nombre,
                            apellido_1: apellido_1,
                            apellido_2: apellido_2,
                            prefijo_movil: prefix,
                            numero_movil: phone,
                        }
                    }
                );

                if(modifiedCount === 0){
                    return new Response(
                        JSON.stringify({error: `Los datos del estudiante eran los mismos que se intentaban actualizar`}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify({message: "Estudiante exitosamente modificado"}),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(rol === "Administrativo"){
                const { modifiedCount } = await PersonasCollection.updateOne(
                    {_id: new ObjectId(id)},
                    {$set:
                        {
                            nombre: nombre,
                            apellido_1: apellido_1,
                            apellido_2: apellido_2,
                            prefijo_movil: prefix,
                            numero_movil: phone,
                            password: pass,
                        }
                    }
                );

                if(modifiedCount === 0){
                    return new Response(
                        JSON.stringify({error: `Los datos del administrativo eran los mismos que se intentaban actualizar`}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify({message: "Administrativo exitosamente modificado"}),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(rol === "Coordinador"){
                const { modifiedCount } = await PersonasCollection.updateOne(
                    {_id: new ObjectId(id)},
                    {$set:
                        {
                            nombre: nombre,
                            apellido_1: apellido_1,
                            apellido_2: apellido_2,
                            prefijo_movil: prefix,
                            numero_movil: phone,
                            password: pass,
                        }
                    }
                );

                if(modifiedCount === 0){
                    return new Response(
                        JSON.stringify({error: `Los datos del coordinador eran los mismos que se intentaban actualizar`}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify({message: "Coordinador exitosamente modificado"}),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }
            else if(rol === "Profesor"){
                const { modifiedCount } = await PersonasCollection.updateOne(
                    {_id: new ObjectId(id)},
                    {$set:
                        {
                            nombre: nombre,
                            apellido_1: apellido_1,
                            apellido_2: apellido_2,
                            prefijo_movil: prefix,
                            numero_movil: phone,
                            password: pass,
                        }
                    }
                );

                if(modifiedCount === 0){
                    return new Response(
                        JSON.stringify({error: `Los datos del profesor eran los mismos que se intentaban actualizar`}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                return new Response(
                    JSON.stringify({message: "Profesor exitosamente modificado"}),
                    {
                        status: 200,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify({error: "Persona no encontrada"}),
                {
                    status: 404,
                    headers: headers,
                }
            );
        }
        /*else if(path === "/datos_titulacion"){
            const data = await req.json();
            const id: string | undefined = data.id;
            const nombre: string | undefined = data.nombre;
            //const universidades: string[] | undefined = data.universidades;
            //const grados_aptos: string[] | undefined = data.grados_aptos;
            const cursos: number | undefined = data.cursos;
            const convocatorias: number | undefined = data.convocatorias;
            const creditos_TFM: number| undefined = data.creditos_TFM;

            if(!id){
                return new Response(
                    JSON.stringify({error: "ID no encontrado"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                )
            }

            if(!nombre && !cursos && !convocatorias && !creditos_TFM){
                return new Response(
                    JSON.stringify({error: "Faltan datos para actualizar"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const titulacion = await TitulacionesCollection.findOne({_id: new ObjectId(id)});

            if(!titulacion){
                return new Response(
                    JSON.stringify({error: "Titulacion no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            
            let new_nombre = "";
            if(nombre){
                const titulacion_error = await TitulacionesCollection.findOne({nombre: nombre});

                if(titulacion_error && titulacion_error._id.toString() !== id){
                    return new Response(
                        JSON.stringify({error: `Titulación con nombre ${nombre} ya existe`}),
                        {
                            status: 409,
                            headers: headers,
                        }
                    );
                }

                new_nombre = nombre;
            }
            else{
                new_nombre = titulacion.nombre;
            }

            const new_asignaturas: ObjectId[] = [];
            let new_cursos = 1;
            if(cursos){
                new_cursos = cursos;
                const asignaturas = await AsignaturasCollection.find({_id: {$in: titulacion.asignaturas}}).toArray();

                if(titulacion.asignaturas.length !== asignaturas.length){
                    return new Response(
                        JSON.stringify({error: `${titulacion.asignaturas.length - asignaturas.length} asignaturas no encontradas`}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                let count = 0;
                const asig_aux: AsignaturaDB[] = []
                const asig_error = asignaturas.find((asig) => {
                    if(asig.tipo === "Bloque TFMs"){
                        return asig;
                    }
                    else if(count === asignaturas.length - 1){
                        return undefined;
                    }

                    asig_aux.push(asig);
                    count += 1;
                });

                if(asig_error){
                    return new Response(
                        JSON.stringify({error: "Se ha encontrado un bloque de TFM entre las asignaturas"}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                const asignaturas_upt: Response[] = await Promise.all(asig_aux.map(async (asignatura) => {
                    if(Number(asignatura.curso.split("º")[0]) > cursos){
                        const asig: AsignaturaDB = {
                            _id: asignatura._id,
                            nombre: asignatura.nombre,
                            curso: `${cursos}º`,
                            cursos_academicos: asignatura.cursos_academicos,
                            creditos: asignatura.creditos,
                            tipo: asignatura.tipo,
                        }

                        const { modifiedCount } = await AsignaturasCollection.updateOne(
                            {_id: asig._id},
                            {$set: {
                                curso: asig.curso,
                            }}
                        );

                        if(modifiedCount === 0){
                            return new Response(
                                JSON.stringify({error: `${asig.nombre} no actualizado`}),
                                {
                                    status: 404,
                                    headers: headers,
                                }
                            );
                        }
                    
                        return new Response(
                            JSON.stringify(asig._id),
                            {
                                status: 200,
                                headers: headers,
                            }
                        );
                    }
                    else{
                        const asig: AsignaturaDB = {
                            _id: asignatura._id,
                            nombre: asignatura.nombre,
                            curso: asignatura.curso,
                            cursos_academicos: asignatura.cursos_academicos,
                            creditos: asignatura.creditos,
                            tipo: asignatura.tipo,
                        }

                        return new Response(
                            JSON.stringify(asig._id),
                            {
                                status: 200,
                                headers: headers,
                            }
                        );
                    }
                }));

                let count_error = 0;
                const error = asignaturas_upt.find(async (asig) => {
                    if(asig.status !== 200){
                        return asig;
                    }
                    else if(count_error === asignaturas_upt.length - 1){
                        return undefined;
                    }

                    new_asignaturas.push(await asig.json())
                    count_error += 1;
                });

                if(error !== undefined){
                    return new Response(
                        JSON.stringify(await error.json()),
                        {
                            status: error.status,
                            headers: headers,
                        }
                    );
                }
            }
            else{
                new_cursos = titulacion.cursos;
                titulacion.asignaturas.forEach((asignatura) => {
                    new_asignaturas.push(asignatura);
                });
            }

            let new_convocatorias = 0
            if(convocatorias){
                new_convocatorias = convocatorias;
            }
            else{
                new_convocatorias = titulacion.convocatorias_disponibles;
            }
            
            let bloque_upd = false;
            if(creditos_TFM){
                const bloque = await AsignaturasCollection.findOne({_id: titulacion.TFM});

                if(!bloque){
                    return new Response(
                        JSON.stringify({error: "Bloque de TFMs no encontrado"}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }
                else if(bloque.tipo !== "Bloque TFMs"){
                    return new Response(
                        JSON.stringify({error: "Se ha intentado modificar una asignatura"}),
                        {
                            status: 406,
                            headers: headers,
                        }
                    );
                }

                const { modifiedCount } = await AsignaturasCollection.updateOne(
                    {_id: bloque._id},
                    {$set: {
                        curso: `${cursos}º`,
                        creditos: creditos_TFM,
                    }}
                );

                if(modifiedCount > 0){
                    bloque_upd = true;
                }
            }

            const { modifiedCount } = await TitulacionesCollection.updateOne(
                {_id: titulacion._id},
                {$set: {
                    nombre: new_nombre,
                    cursos: new_cursos,
                    convocatorias_disponibles: new_convocatorias,
                    asignaturas: new_asignaturas,
                }}
            );

            if(modifiedCount === 0 && bloque_upd === false){
                return new Response(
                    JSON.stringify({error: "Los datos de la titulación eran los mismos que se intentaban actualizar"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify({message: "Titulación exitosamente actualizada"}),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/datos_asignatura"){
            const data = await req.json();
            const id: string | undefined = data.id;
            const nombre: string | undefined = data.name;
            const curso: string | undefined = data.curso;
            const creditos: number | undefined = data.creditos;

            if(!id){
                return new Response(
                    JSON.stringify({error: "ID no encontrado"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                )
            }

            if(!nombre && !curso && !creditos){
                return new Response(
                    JSON.stringify({error: "Faltan datos para actualizar"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            const asignatura = await AsignaturasCollection.findOne({_id: new ObjectId(id)});

            if(!asignatura){
                return new Response(
                    JSON.stringify({error: "Asignatura no encontrada"}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }
            else if(asignatura.tipo !== "Asignatura"){
                return new Response(
                    JSON.stringify({error: "Se ha intentado modificar un bloque de TMFs no una asignatura"}),
                    {
                        status: 406,
                        headers: headers,
                    }
                );
            }

            let new_nombre = "";
            if(nombre){
                new_nombre = nombre;
            }
            else{
                new_nombre = asignatura.nombre;
            }

            let new_curso = "1º"; 
            if(curso){
                const curso_split = curso.split("º");

                const titulacion_in = await TitulacionesCollection.findOne({asignaturas: new ObjectId(id)});
                
                if(!titulacion_in){
                    return new Response(
                        JSON.stringify({error: `Titulación de la asignatura con id ${id} no encontrada`}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                if(Number(curso_split[0]) > titulacion_in.cursos){
                    return new Response(
                        JSON.stringify({error: `Curso de la asignatura debe ser inferior a ${titulacion_in.cursos}`}),
                        {
                            status: 406,
                            headers: headers,
                        }
                    );
                }

                new_curso = curso;
            }
            else{
                new_curso = asignatura.curso;
            }

            let new_creditos = 0;
            if(creditos){
                new_creditos = creditos;
            }
            else{
                new_creditos = asignatura.creditos;
            }

            const { modifiedCount } = await AsignaturasCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: {
                    nombre: new_nombre,
                    curso: new_curso,
                    creditos: new_creditos,
                }}
            );

            if(modifiedCount === 0){
                return new Response(
                    JSON.stringify({error: `Los datos de la asignatura eran los mismos que se intentaban actualizar`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify({message: "Asignatura exitosamente actualizada"}),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }
        else if(path === "/datos_curso"){
            const data = await req.json();
            const id: string | undefined = data.id;
            const nombre: string | undefined = data.name;
            //const alumnos: any | undefined = data.alumnos;
            //const docentes: any | undefined = data.docentes;

            if(!id){
                return new Response(
                    JSON.stringify({error: "ID no encontrado"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                )
            }

            if(!nombre){
                return new Response(
                    JSON.stringify({error: "Faltan datos para actualizar"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            //const 
        }
        else if(path === "/datos_TFM_block"){
            const data = await req.json();
            const id: string | undefined = data.id;
            const curso: string | undefined = data.curso;
            const creditos: number | undefined = data.creditos;

            if(!id){
                return new Response(
                    JSON.stringify({error: "ID no encontrado"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                )
            }

            if(!curso && !creditos){
                return new Response(
                    JSON.stringify({error: "Faltan datos para actualizar"}),
                    {
                        status: 400,
                        headers: headers,
                    }
                );
            }

            if(curso){
                const curso_split = curso.split("º");

                const titulacion_in = await TitulacionesCollection.findOne({TFM: new ObjectId(id)});
                
                if(!titulacion_in){
                    return new Response(
                        JSON.stringify({error: `Titulación del bloque de TFMs con id ${id} no encontra`}),
                        {
                            status: 404,
                            headers: headers,
                        }
                    );
                }

                if(Number(curso_split[0]) > titulacion_in.cursos){
                    return new Response(
                        JSON.stringify({error: `Curso del bloque de TFMs debe ser inferior a ${titulacion_in.cursos}`}),
                        {
                            status: 406,
                            headers: headers,
                        }
                    );
                }
            }

            const { modifiedCount } = await AsignaturasCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: {curso: curso, creditos: creditos}}
            );

            if(modifiedCount === 0){
                return new Response(
                    JSON.stringify({error: `Bloque de TFMs con id ${id} no encontrado`}),
                    {
                        status: 404,
                        headers: headers,
                    }
                );
            }

            return new Response(
                JSON.stringify({message: "Asignatura exitosamente actualizada"}),
                {
                    status: 200,
                    headers: headers,
                }
            );
        }*/
    }

	return new Response(
		"Path not found",
		{
			status: 404,
            headers: headers,
		}
	);
};

Deno.serve(
	{
		port: Number(Deno.env.get("PORT")) || 4000,
		hostname: "0.0.0.0",
	},
	handler
);
