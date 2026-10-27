import { OptionalId } from "npm:mongodb"

export type ProfesorDB = OptionalId<{
    nombre: string,
    apellido_1: string,
    apellido_2?: string,
    DNI: string,
    prefijo_movil?: string,
    numero_movil?: string,
    email: string,
    password: string,
    rol: "Profesor",
    universidad: string,
}>

export type Profesor = {
    id: string,
    nombre: string,
    apellido_1: string,
    apellido_2?: string,
    prefijo_movil?: string,
    numero_movil?: string,
    email: string,
    rol: "Profesor",
    universidad: string,
}

export type Profesor_Short = {
    id: string,
    nombre: string,
    apellido_1: string,
    apellido_2?: string,
    email: string,
    universidad: string,
    rol: "Profesor",
}