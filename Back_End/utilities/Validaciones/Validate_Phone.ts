import { Phone_Ninja } from "../../types/Validaciones/Validaciones.ts";

export const Validate_Phone = async (prefijo: string, numero: string): Promise<Response> => {
    const full_number = prefijo+numero;

    const API_KEY = Deno.env.get("API_KEY");

    if(!API_KEY){
        throw new Error("Falta el API_KEY");
    }

    const URL_API = `https://api.api-ninjas.com/v1/validatephone?number=${full_number}`;

    const data = await fetch(URL_API,
        {
            headers: {
                "X-Api-Key": API_KEY,
            }
        }
    );

    if(data.status !== 200){
        return new Response(
            JSON.stringify({error: "Error en la API"}),
            {
                status: data.status,
            }
        );
    }

    const valid_phone: Phone_Ninja = await data.json();

    if(valid_phone.is_valid === false){
        return new Response(
            JSON.stringify({error: "Teléfono no válido"}),
            {
                status: 406,
            }
        );
    }

    return new Response(
        JSON.stringify({message: "Teléfono válido"}),
        {
            status: 200,
        }
    );
}