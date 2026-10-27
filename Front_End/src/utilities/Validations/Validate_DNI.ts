export const Validate_DNI = (dni: string): Response => {
    if(dni.length !== 9){
        return new Response(
            JSON.stringify({error: "La longitud del DNI tiene ser de 9"}),
            {
                status: 400,
            }
        );
    }

    const dni_split = dni.split("");

    let count = 0;
    dni_split.forEach((data) => {
        if((count >= 0 && count <= 7) && (Number(data) < 0 || Number(data) > 9)){
            return new Response(
                JSON.stringify({error: "Hay posiciones del DNI en la que debería haber números, no los hay o están fuera de rango"}),
                {
                    status: 400,
                }
            );
        }
        else if(count === 8 && (data.charCodeAt(0) < 65 || data.charCodeAt(0) > 90)){
            return new Response(
                JSON.stringify({error: "En el sitio de la letra del DNI debería haber una letra en mayúscula, no una en minúscula o un número "}),
                {
                    status: 400,
                }
            );
        }

        count += 1;
    });

    return new Response(
        JSON.stringify({message: "Todo correcto"}),
        {
            status: 200,
        }
    );
}