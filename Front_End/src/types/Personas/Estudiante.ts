import type { Asignatura_alumno } from "../Asignaturas/Asignatura.ts";
import type { TFM_alumno } from "../Asignaturas/TFM.ts";

export type Estudiante = {
    id: string,
    nombre: string,
    apellido_1: string,
    apellido_2?: string,
    prefijo_movil?: string,
    numero_movil?: string,
    email: string,
    password?: string,
    rol: "Estudiante",
    grado_academico: string,
    universidad: string,
    curso_admision: string,
    asignaturas_matriculadas: {
        asignatura: string,
        curso_academico: string,
        tipo: "Asignatura" | "TFM",
    }[],
    asignaturas_cursadas: (TFM_alumno | Asignatura_alumno)[],
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