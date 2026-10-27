import { Coordinador, Coordinador_Short, CoordinadorDB } from "../../types/Personas/Coordinador.ts";

export const Transform_Coordinador = (coordinador: CoordinadorDB): Coordinador => {
    return{
        id: coordinador._id!.toString(),
        nombre: coordinador.nombre,
        apellido_1: coordinador.apellido_1,
        apellido_2: coordinador.apellido_2,
        prefijo_movil: coordinador.prefijo_movil,
        numero_movil: coordinador.numero_movil,
        email: coordinador.email,
        rol: coordinador.rol,
        universidad: coordinador.universidad,
    }
}

export const Short_Coordinador_DB = (coordinador: CoordinadorDB): Coordinador_Short => {
    return{
        id: coordinador._id!.toString(),
        nombre: coordinador.nombre,
        apellido_1: coordinador.apellido_1,
        apellido_2: coordinador.apellido_2,
        email: coordinador.email,
        universidad: coordinador.universidad,
        rol: coordinador.rol,
    };
}