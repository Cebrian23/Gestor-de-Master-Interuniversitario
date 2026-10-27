import { Email_Ninja } from "../../types/Validaciones/Validaciones.ts";

export const Validate_Email = async (email: string): Promise<Response> => {
    const API_KEY = Deno.env.get("API_KEY");

    if(!API_KEY){
        throw new Error("Falta el API_KEY");
    }

    const URL_API = `https://api.api-ninjas.com/v1/validateemail?email=${email}`;

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

    const valid_email: Email_Ninja = await data.json();

    if(valid_email.is_valid === false){
        return new Response(
            JSON.stringify({error: "Email no válido"}),
            {
                status: 406,
            }
        );
    }

    return new Response(
        JSON.stringify({message: "Email válido"}),
        {
            status: 200,
        }
    );
}