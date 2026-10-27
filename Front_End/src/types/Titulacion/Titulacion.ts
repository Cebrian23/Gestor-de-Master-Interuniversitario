import type { Asignatura_Short } from "../Asignaturas/Asignatura.ts";
import type { Practicas_Short } from "../Asignaturas/Practicas.ts";
import type { TFM_Block_Short } from "../Asignaturas/TFM.ts";
import type { Administrativo_Short } from "../Personas/Administrativo.ts";
import type { Coordinador_Short } from "../Personas/Coordinador.ts";
import type { Estudiante_Short } from "../Personas/Estudiante.ts";
import type { Profesor_Short } from "../Personas/Profesor.ts";

export type Titulacion = {
    id: string,
    nombre: string,
    creacion?: string,
    controlCalidad?: {
        universidad: string,
        year: number,
    }[],
    universidades: {
        nombre: string,
        principal: boolean,
    }[],
    grados_aptos: string[],
    cursos: number,
    convocatorias_disponibles: number,
    asignaturas: Asignatura_Short[],
    requisitos_TFM: {
        creditos_obligatorios: number,
        creditos_optativos: number,
    },
    TFM: TFM_Block_Short,
    practicas?: Practicas_Short,
    administrativos: Administrativo_Short[],
    docentes: (Coordinador_Short | Profesor_Short)[],
    alumnos: Estudiante_Short[],
}

export type Titulacion_ins = {
    nombre: string,
    universidades: {
        nombre: string,
        principal: boolean,
    }[],
    grados_aptos: string[],
    cursos: number,
    convocatorias: number,
    asignaturas?: {nombre: string, curso: string, creditos: number}[],
    creditos_obligatorios: number,
    creditos_optativos: number,
    creditos_TFM: number,
    creditos_practicas?: number,
    administrativo: string,
}

export type Titulacion_upt = {
    id: string,
    nombre: string,
    cursos: number,
    convocatorias: number,
    creditos_TFM: number,
}

export type Titulacion_Short = {
    id: string,
    nombre: string,
}