import { ObjectId, OptionalId } from "npm:mongodb";
import { Estudiante_Short } from "../Personas/Estudiante.ts";

export type Practicas_DB = OptionalId<{
    curso: "2º" | string,
    creditos: number,
    cursos: Practicas_Curso_DB[],
    optatividad: "Obligatoria",
    tipo: "Prácticas",
}>

export type Practicas = {
    id: string,
    titulacion: string,
    curso: "2º" | string,
    creditos: number,
    cursos: Practicas_Curso[],
    optatividad: "Obligatoria",
    tipo: "Prácticas",
}

export type Practicas_Short = {
    id: string,
    titulacion: string,
    curso: "2º" | string,
    creditos: number,
    optatividad: "Obligatoria",
    cursos: number,
    tipo: "Prácticas",
}

export type Practicas_Curso_DB = {
    id: ObjectId,
    nombre: string,
    alumnos: ObjectId[],
    practicas: {
        estudiante: ObjectId,
        empresa?: string,
        nota: "Sin calificación" | number,
    }[],
    tipo: "Curso Prácticas",
}

export type Practicas_Curso = {
    id: string,
    nombre: string,
    alumnos: Estudiante_Short[],
    practicas: {
        estudiante: Estudiante_Short,
        empresa?: string,
        nota: "Sin calificación" | number,
    }[],
    tipo: "Curso Prácticas",
}