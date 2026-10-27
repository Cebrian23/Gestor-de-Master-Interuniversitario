import { ObjectId, OptionalId } from "npm:mongodb";
import { Coordinador_Short } from "../Personas/Coordinador.ts";
import { Estudiante_Short } from "../Personas/Estudiante.ts";
import { Profesor_Short } from "../Personas/Profesor.ts";

export type AsignaturaDB = OptionalId<{
    nombre: string,
    curso: "1º" | "2º" | string,
    cursos_academicos: Asignatura_curso_DB[],
    creditos: number,
    optatividad: "Obligatoria" | "Optativa" | string,
    tipo: "Asignatura",
}>

export type Asignatura = {
    id: string,
    nombre: string,
    curso: "1º" | "2º" | string,
    cursos_academicos: Asignatura_curso[],
    creditos: number,
    titulacion: string,
    optatividad: "Obligatoria" | "Optativa" | string,
    tipo: "Asignatura",
}

export type Asignatura_Short = {
    id: string,
    nombre: string,
    curso: "1º" | "2º" | string,
    cursos_academicos: number,
    creditos: number,
    tipo: "Asignatura",
    optatividad: "Obligatoria" | "Optativa" | string,
}

export type Asignatura_curso_DB = {
    id: ObjectId,
    curso_academico: string,
    profesores: ObjectId[],
    estudiantes: ObjectId[],
    alumnos_ordinaria: AlumnoDB[],
    ordinaria_firmada?: boolean,
    alumnos_extraordinaria: AlumnoDB[],
    extraordinaria_firmada?: boolean,
    tipo: "Curso",
}

export type Asignatura_curso = {
    id: string,
    id_asig: string,
    nombre: string,
    curso_academico: string,
    profesores: (Profesor_Short | Coordinador_Short)[],
    estudiantes: Estudiante_Short[],
    alumnos_ordinaria: Alumno[],
    ordinaria_firmada: boolean,
    alumnos_extraordinaria: Alumno[],
    extraordinaria_firmada: boolean,
    tipo: "Curso",
}

export type Asignatura_curso_short = {
    id: string,
    id_asig: string,
    nombre: string,
    curso_academico: string,
    tipo: "Curso",
}

export type Asignatura_curso_docs_short = {
    id: string,
    id_asig: string,
    nombre: string,
    curso_academico: string,
    profesores: (Profesor_Short | Coordinador_Short)[],
    tipo: "Curso",
}

export type AlumnoDB = {
    estudiante: ObjectId,
    convocatoria_num: "1º" | "2º"  | "3º" | "4º" | "5º" | "6º" | string,
    convocatoria_name: "Ordinaria" | "Extraordinaria",
    nota: number | "Sin calificar" | "No presentado",
    tipo: "Alumno",
}

export type Alumno = {
    estudiante: Estudiante_Short,
    convocatoria_num: "1º" | "2º"  | "3º" | "4º" | "5º" | "6º" | string,
    convocatoria_name: "Ordinaria" | "Extraordinaria",
    nota: number | "Sin calificar" | "No presentado",
    tipo: "Alumno",
}

export type Asignatura_alumno_DB = OptionalId<{
    asignatura: ObjectId,
    convocatoria_num: "1º" | "2º"  | "3º" | "4º" | "5º" | "6º" | string,
    convocatoria_name: "Ordinaria" | "Extraordinaria",
    curso: string,
    nota: number | "Sin calificar" | "No presentado",
    tipo: "Asignatura",
}>

export type Asignatura_alumno = {
    id: string,
    asignatura: string,
    convocatoria_num: "1º" | "2º"  | "3º" | "4º" | "5º" | "6º" | string,
    convocatoria_name: "Ordinaria" | "Extraordinaria",
    curso: string,
    nota: number | "Sin calificar" | "No presentado",
    tipo: "Asignatura",
}