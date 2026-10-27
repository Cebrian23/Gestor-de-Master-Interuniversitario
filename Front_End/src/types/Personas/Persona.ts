export type Persona_ins = {
    nombre: string,
    apellido_1: string,
    apellido_2?: string,
    DNI: string,
    prefijo_movil?: string,
    numero_movil?: string,
    email: string,
    password?: string,
    rol: string,
    grado_academico?: string,
    universidad?: string,
    curso_admision?: string,
    titulacion?: string,
}

export type Persona_upt = {
    id: string,
    rol: string,
    nombre: string,
    apellido_1: string,
    apellido_2?: string,
    prefix?: string,
    phone?: string,
    password?: string,
    universidad?: string,
}