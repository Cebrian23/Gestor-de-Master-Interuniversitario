import { ObjectId, OptionalId } from "npm:mongodb";
import { Asignatura_alumno, Asignatura_alumno_DB } from "../Asignaturas/Asignatura.ts";
import { TFM_alumno, TFM_alumno_DB } from "../Asignaturas/TFM.ts";

export type EstudianteDB = OptionalId<{
    nombre: string,
    apellido_1: string,
    apellido_2?: string,
    DNI: string,
    prefijo_movil?: string,
    numero_movil?: string,
    email: string,
    password?: string,
    rol: "Estudiante",
    grado_academico: string,
    universidad: string,
    curso_admision: string,
    asignaturas_matriculadas: {
        asignatura: ObjectId,
        curso_academico: string,
        tipo: "Asignatura" | "TFM",
    }[],
    asignaturas_presentadas: {
        asignatura: ObjectId,
        curso_academico: string,
        tipo: "Asignatura" | "TFM",
    }[],
    convocatorias_cursadas: (TFM_alumno_DB | Asignatura_alumno_DB)[],
    asignaturas_aprobadas: (TFM_alumno_DB | Asignatura_alumno_DB)[],
    graduado: boolean,
}>

export type Estudiante = {
    id: string,
    nombre: string,
    apellido_1: string,
    apellido_2?: string,
    prefijo_movil?: string,
    numero_movil?: string,
    email: string,
    rol: "Estudiante",
    grado_academico: string,
    universidad: string,
    curso_admision: string,
    asignaturas_matriculadas: {
        asignatura: string,
        curso_academico: string,
        tipo: "Asignatura" | "TFM",
    }[],
    asignaturas_presentadas: {
        asignatura: string,
        curso_academico: string,
        tipo: "Asignatura" | "TFM",
    }[],
    convocatorias_cursadas: (TFM_alumno | Asignatura_alumno)[],
    asignaturas_aprobadas: (TFM_alumno | Asignatura_alumno)[],
    graduado: boolean,
}

export type Estudiante_Short = {
    id: string,
    nombre: string,
    apellido_1: string,
    apellido_2?: string,
    DNI: string,
    email: string,
    universidad: string,
    curso_admision: string,
    rol: "Estudiante",
}