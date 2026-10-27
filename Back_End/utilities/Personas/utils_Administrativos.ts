import { ObjectId } from "npm:mongodb";
import { Administrativo_Short, AdministrativoDB } from "../../types/Personas/Administrativo.ts";
import { PersonasCollection, TitulacionesCollection } from "../../db/connection.ts";
import { Short_Titulacion } from "../Titulacion/utils_Titulacion.ts";

export const Transform_Administrativo = async (administrativo: AdministrativoDB): Promise<Response> => {
    const titulacionesDB = await TitulacionesCollection.find({administrativos: administrativo._id}).toArray();

    const titulaciones = titulacionesDB.map((titulacion) => Short_Titulacion(titulacion));

    return new Response(
        JSON.stringify(
            {
                id: administrativo._id!.toString(),
                nombre: administrativo.nombre,
                apellido_1: administrativo.apellido_1,
                apellido_2: administrativo.apellido_2,
                prefijo_movil: administrativo.prefijo_movil,
                numero_movil: administrativo.numero_movil,
                email: administrativo.email,
                rol: administrativo.rol,
                titulaciones: titulaciones,
            }
        )
    );
}

export const Short_Administrativo_DB = (persona: AdministrativoDB): Administrativo_Short => {
    return{
        id: persona._id!.toString(),
        nombre: persona.nombre,
        apellido_1: persona.apellido_1,
        apellido_2: persona.apellido_2,
        email: persona.email,
        rol: persona.rol,
    };
}

export const Short_Administrativo_ID = async (id: ObjectId): Promise<Response> => {
    const admin_exists = await PersonasCollection.findOne({_id: new ObjectId});

    if(!admin_exists){
        return new Response(
            JSON.stringify({error: `Asignatura con id ${id} no encontrada`}),
            {
                status: 404,
            }
        );
    }
    else if(admin_exists.rol !== "Administrativo"){
        return new Response(
            JSON.stringify({error: `Persona con id ${admin_exists._id.toString()} tiene el rol de '${admin_exists.rol}', no el de 'Administrativo'`}),
            {
                status: 406,
            }
        );
    }

    return new Response(
        JSON.stringify(
            {
                id: admin_exists._id!.toString(),
                nombre: admin_exists.nombre,
                apellido_1: admin_exists.apellido_1,
                apellido_2: admin_exists.apellido_2,
                email: admin_exists.email,
                rol: admin_exists.rol,
            }
        )
    )
}