import { MongoClient } from "npm:mongodb";
import { ProfesorDB } from "../types/Personas/Profesor.ts";
import { CoordinadorDB } from "../types/Personas/Coordinador.ts";
import { EstudianteDB } from "../types/Personas/Estudiante.ts";
import { AsignaturaDB } from "../types/Asignaturas/Asignatura.ts";
import { AdministrativoDB } from "../types/Personas/Administrativo.ts";
import { TitulacionDB } from "../types/Titulacion/Titulacion.ts";
import { TFM_Block_DB } from "../types/Asignaturas/TFM.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if(!MONGO_URL){
    throw new Error("No se ha encontrado la clave MONGO_URL");
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("Cliente conectado");

const db = client.db("TFM");

export const TitulacionesCollection = db.collection<TitulacionDB>("Titulaciones");
export const AsignaturasCollection = db.collection<(AsignaturaDB | TFM_Block_DB)>("Asignaturas");
export const PersonasCollection = db.collection<(AdministrativoDB | ProfesorDB | CoordinadorDB | EstudianteDB)>("Personas");
