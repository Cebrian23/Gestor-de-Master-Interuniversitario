import { ObjectId } from "npm:mongodb";
import { Administrativo_Short, AdministrativoDB } from "../../types/Personas/Administrativo.ts";
import { Coordinador_Short, CoordinadorDB } from "../../types/Personas/Coordinador.ts";
import { Estudiante_Short, EstudianteDB } from "../../types/Personas/Estudiante.ts";
import { Profesor_Short, ProfesorDB } from "../../types/Personas/Profesor.ts";
import { PersonasCollection } from "../../db/connection.ts";

export const Persona_To_Short_DB = (persona: CoordinadorDB | EstudianteDB | ProfesorDB | AdministrativoDB): (Coordinador_Short | Profesor_Short | Estudiante_Short | Administrativo_Short) => {
    const persona_data = {
        id: persona._id!.toString(),
        nombre: persona.nombre,
        apellido_1: persona.apellido_1,
        apellido_2: persona.apellido_2,
        email: persona.email,
        rol: persona.rol,   
    }

    if(persona.rol === "Administrativo"){
        return persona_data as Administrativo_Short;
    }
    else if(persona.rol === "Coordinador" || persona.rol === "Coordinador general"){
        return persona_data as Coordinador_Short;
    }
    else if(persona.rol === "Profesor"){
        return persona_data as Profesor_Short;
    }

    return persona_data as Estudiante_Short;
}

export const Persona_To_Short_ID = async (persona: ObjectId): Promise<Response> => {
    const persona_exists = await PersonasCollection.findOne({_id: persona});

    if(!persona_exists){
        return new Response(
            JSON.stringify({error: `Persona con id ${persona} no encontrada`}),
            {
                status: 404
            }
        );
    }

    const persona_data = {
        id: persona_exists._id!.toString(),
        nombre: persona_exists.nombre,
        apellido_1: persona_exists.apellido_1,
        apellido_2: persona_exists.apellido_2,
        email: persona_exists.email,
        rol: persona_exists.rol,   
    }

    if(persona_exists.rol === "Administrativo"){
        return new Response(
            JSON.stringify(persona_data as Administrativo_Short),
            {
                status: 200,
            }
        );
    }
    else if(persona_exists.rol === "Coordinador" || persona_exists.rol === "Coordinador general"){
        JSON.stringify(persona_data as Coordinador_Short),
            {
                status: 200,
            }
    }
    else if(persona_exists.rol === "Profesor"){
        JSON.stringify(persona_data as Profesor_Short),
        {
            status: 200,
        }
    }

    return new Response(
        JSON.stringify(persona_data as Estudiante_Short),
        {
            status: 200,
        }
    );
}