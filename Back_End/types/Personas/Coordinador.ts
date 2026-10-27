import { OptionalId } from "npm:mongodb";

export type CoordinadorDB = OptionalId<{
    nombre: string,
    apellido_1: string,
    apellido_2?: string,
    DNI: string,
    prefijo_movil?: string,
    numero_movil?: string,
    email: string,
    password: string,
    rol: "Coordinador" | "Coordinador general", 
    universidad: string,
}>

export type Coordinador = {
    id: string,
    nombre: string,
    apellido_1: string,
    apellido_2?: string,
    prefijo_movil?: string,
    numero_movil?: string,
    email: string,
    rol: "Coordinador" | "Coordinador general",
    universidad: string,
}

export type Coordinador_Short = {
    id: string,
    nombre: string,
    apellido_1: string,
    apellido_2?: string,
    email: string,
    universidad: string,
    rol: "Coordinador" | "Coordinador general",
}