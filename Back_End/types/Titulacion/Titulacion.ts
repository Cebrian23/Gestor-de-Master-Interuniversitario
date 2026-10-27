import { ObjectId, OptionalId } from "npm:mongodb";
import { Asignatura_Short } from "../Asignaturas/Asignatura.ts";
import { TFM_Block_Short } from "../Asignaturas/TFM.ts";
import { Administrativo_Short } from "../Personas/Administrativo.ts";
import { Coordinador_Short } from "../Personas/Coordinador.ts";
import { Profesor_Short } from "../Personas/Profesor.ts";
import { Estudiante_Short } from "../Personas/Estudiante.ts";
import { Practicas_Short } from "../Asignaturas/Practicas.ts";

export type TitulacionDB = OptionalId<{
    nombre: string,
    creacion: number,
    controlCalidad: {
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
    asignaturas: ObjectId[],
    requisitos_TFM: {
        creditos_obligatorios: number,
        creditos_optativos: number,
    },
    TFM: ObjectId,
    practicas?: ObjectId,
    administrativos: ObjectId[],
    docentes: ObjectId[],
    alumnos: ObjectId[],
}>

export type Titulacion = {
    id: string,
    nombre: string,
    creacion?: string,
    controlCalidad?: {
        universidad: string,
        year: number,
        tipo: "anual" | "Cada 3 años" | "Cada 6 años",
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

export type Titulacion_Short = {
    id: string,
    nombre: string,
    TFM: string,
}