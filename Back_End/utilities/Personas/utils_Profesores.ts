import { Profesor, Profesor_Short, ProfesorDB } from "../../types/Personas/Profesor.ts";

export const Transform_Profesor = (profesor: ProfesorDB): Profesor => {
    return{
        id: profesor._id!.toString(),
        nombre: profesor.nombre,
        apellido_1: profesor.apellido_1,
        apellido_2: profesor.apellido_2,
        prefijo_movil: profesor.prefijo_movil,
        numero_movil: profesor.numero_movil,
        email: profesor.email,
        rol: profesor.rol,
        universidad: profesor.universidad,
    }
}

export const Short_Profesor_DB = (profesor: ProfesorDB): Profesor_Short => {
    return{
        id: profesor._id!.toString(),
        nombre: profesor.nombre,
        apellido_1: profesor.apellido_1,
        apellido_2: profesor.apellido_2,
        email: profesor.email,
        universidad: profesor.universidad,
        rol: profesor.rol,
    };
}