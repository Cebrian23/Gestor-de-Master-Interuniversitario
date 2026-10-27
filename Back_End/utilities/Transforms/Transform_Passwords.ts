import CryptoJS from "crypto-js";
import bcrypt from "bcrypt"

export const Encrypt_Passwords = (password: string) => {
    const DNI_KEY = Deno.env.get("DNI_KEY");
    
    if(!DNI_KEY){
        return undefined;
    }

    return CryptoJS.AES.encrypt(password.trim(), DNI_KEY).toString();
}

export const Decrypt_Passwords = (password: string) => {
    const DNI_KEY = Deno.env.get("DNI_KEY");
    
    if(!DNI_KEY){
        return undefined;
    }

    const bytes = CryptoJS.AES.decrypt(password.trim(), DNI_KEY);

    return bytes.toString(CryptoJS.enc.Utf8);
}

export const Hash_Passwords = async (password: string) => {
    return await bcrypt.hash(password, 10);
}

export const Compare_Passwords = async (password1: string, password2: string) => {
    return await bcrypt.compare(password1, password2);
}