import CryptoJS from "crypto-js";

export const Encrypt_DNI = (dni: string) => {
    const DNI_KEY = Deno.env.get("DNI_KEY");
    
    if(!DNI_KEY){
        return undefined;
    }

    return CryptoJS.AES.encrypt(dni.trim(), DNI_KEY).toString();
}

export const Decrypt_DNI = (dni: string) => {
    const DNI_KEY = Deno.env.get("DNI_KEY");
    
    if(!DNI_KEY){
        return undefined;
    }

    const bytes = CryptoJS.AES.decrypt(dni.trim(), DNI_KEY);

    return bytes.toString(CryptoJS.enc.Utf8);
}