import { ObjectId, OptionalId } from "npm:mongodb";
import { Coordinador_Short } from "../Personas/Coordinador.ts";
import { Estudiante_Short } from "../Personas/Estudiante.ts";
import { Profesor_Short } from "../Personas/Profesor.ts";
import { Convocatoria } from "./Convocatoria.ts";

export type TFM_Block_DB = OptionalId<{
    curso: "2º" | string,
    creditos: number,
    cursos: TFM_Block_Curso_DB[],
    optatividad: "Obligatoria",
    tipo: "Bloque TFMs",
}>

export type TFM_Block = {
    id: string,
    titulacion: string,
    curso: "2º" | string,
    creditos: number,
    cursos: TFM_Block_Curso[],
    optatividad: "Obligatoria",
    tipo: "Bloque TFMs",
}

export type TFM_Block_Short = {
    id: string,
    titulacion: string,
    curso: "2º" | string,
    creditos: number,
    optatividad: "Obligatoria",
    cursos: number,
    tipo: "Bloque TFMs",
}

export type TFM_Block_Curso_DB = {
    id: ObjectId,
    nombre: string,
    alumnos: ObjectId[],
    TFM: TFM_DB[],
    tipo: "Curso TFM",
}

export type TFM_Block_Curso = {
    id: string,
    nombre: string,
    alumnos: Estudiante_Short[],
    TFM: TFM[],
    tipo: "Curso TFM",
}

export type TFM_DB = OptionalId<{
    bloque: ObjectId,
    titulo: string,
    curso_academico: string,
    estudiante: ObjectId,
    director: ObjectId[],
    miembros_tribunal: ObjectId[],
    fecha_defensa: string,
    hora_defensa: string,
    convocatoria: Convocatoria,
    convocatoria_num: "1º" | "2º"  | "3º" | "4º" | "5º" | "6º" | string,
    tipo: "TFM",
}>

export type TFM = {
    id: string,
    bloque: string,
    titulo: string,
    curso_academico: string,
    estudiante: Estudiante_Short,
    director: (Profesor_Short | Coordinador_Short)[],
    miembros_tribunal: (Profesor_Short | Coordinador_Short)[],
    fecha_defensa: string,
    hora_defensa: string,
    convocatoria: Convocatoria,
    convocatoria_num: "1º" | "2º"  | "3º" | "4º" | "5º" | "6º" | string,
    tipo: "TFM",
}

export type TFM_alumno_DB = {
    TFM: ObjectId,
    bloque: ObjectId,
    titulo: string,
    curso_academico: string,
    fecha_defensa: string,
    hora_defensa: string,
    convocatoria: Convocatoria,
    convocatoria_num: "1º" | "2º"  | "3º" | "4º" | "5º" | "6º" | string,
    tipo: "TFM",
}

export type TFM_alumno = {
    TFM: string,
    bloque: string,
    titulo: string,
    curso_academico: string,
    fecha_defensa: string,
    convocatoria: Convocatoria,
    convocatoria_num: "1º" | "2º"  | "3º" | "4º" | "5º" | "6º" | string,
    tipo: "TFM",
}