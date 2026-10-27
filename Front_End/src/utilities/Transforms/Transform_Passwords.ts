import CryptoJS from "crypto-js";

export const Encrypt_Passwords = (password: string) => {
    const DNI_KEY = import.meta.env.VITE_DNI_KEY;
    
    if(!DNI_KEY){
        return undefined;
    }

    return CryptoJS.AES.encrypt(password.trim(), DNI_KEY).toString();
}

export const Decrypt_Passwords = (password: string) => {
    const DNI_KEY = import.meta.env.VITE_DNI_KEY;
    
    if(!DNI_KEY){
        return undefined;
    }

    const bytes = CryptoJS.AES.decrypt(password.trim(), DNI_KEY);

    return bytes.toString(CryptoJS.enc.Utf8);
}