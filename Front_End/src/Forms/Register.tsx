import { useState } from "react";
import type { Persona_ins } from "../types/Personas/Persona.ts";
import { Validate_Email } from "../utilities/Validations/Validate_Email.ts";
import { Validate_Phone } from "../utilities/Validations/Validate_Phone.ts";
import { Encrypt_Passwords } from "../utilities/Transforms/Transform_Passwords.ts";
import { Encrypt_DNI } from "../utilities/Transforms/Transform_DNI.ts";
import { Validate_DNI } from "../utilities/Validations/Validate_DNI.ts";
import Header from "../Header/Header.tsx";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

function Register() {
    const [nombre, setNombre] = useState("");
    const [apellido1, setApellido1] = useState("");
    const [apellido2, setApellido2] = useState("");
    const [dni, setDNI] = useState("");
    const [prefix, setPrefix] = useState("+34");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [rol, setRol] = useState("Administrativo");

    const [nombreError, setNombreError] = useState("");
    const [apellido1Error, setApellido1Error] = useState("");
    const [dniError, setDNIError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [password1Error, setPassword1Error] = useState("");
    const [passLengthError, setPassLengthError] = useState("");
    const [passCharError, setPassCharError] = useState("");
    const [passNumError, setPassNumError] = useState("");
    const [passSpaceError, setPassSpaceError] = useState("");
    const [password2Error, setPassword2Error] = useState("");

    const [buttonAction, setButtonAction] = useState(false);

    const handleReset = () => {
        setNombre("");
        setApellido1("");
        setApellido2("");
        setDNI("");
        setPrefix("+34");
        setPhone("");
        setEmail("");
        setPassword1("");
        setPassword2("");
        setRol("Administrativo");

        setNombreError("");
        setApellido1Error("");
        setDNIError("");
        setEmailError("");
        setPhoneError("");
        setPassword1Error("");
        setPassword2Error("");
        setPassLengthError("");
        setPassCharError("");
        setPassNumError("");
        setPassSpaceError("");
    }

    const handleNewUser = async () => {
        setButtonAction(true);

        let error_exists = false;

        if(nombre.trim() === ""){
            setNombreError("Hay que rellenar este campo");
            error_exists = true;
        }

        if(apellido1.trim() === ""){
            setApellido1Error("Hay que rellenar este campo");
            error_exists = true;
        }

        if(email.trim() === ""){
            setEmailError("Hay que rellenar este campo");
            error_exists = true;
        }
        else{
            const email_data = await Validate_Email(email);

            if(email_data.status !== 200){
                const error = await email_data.json();

                setEmailError(error.error);
                error_exists = true;
            }
        }

        if(dni === ""){
            setDNIError("Hay que rellenar este campo");
            error_exists = true;
        }
        else{
            const dni_data = Validate_DNI(dni);
    
            if(dni_data.status !== 200){
                const error = await dni_data.json();
    
                setDNIError(error.error);
                error_exists = true;
            }
        }

        if(phone !== ""){
            const phone_data = await Validate_Phone(prefix, phone);
        
            if(phone_data.status !== 200){
                const error = await phone_data.json();

                setPhoneError(error.error);
                error_exists = true;
            }
        }

        const password1_aux = password1.trim();
        if(password1_aux === ""){
            setPassword1Error("Hay que rellenar este campo");
            error_exists = true;
        }

        const password2_aux = password2.trim();
        if(password2_aux === ""){
            setPassword2Error("Hay que rellenar este campo");
            error_exists = true;
        }

        if(password1.length < 12 && password1.length !== 0){
            setPassLengthError("El tamaño de la contraseña debe tener, al menos, 12 caracteres");
            error_exists = true;
        }

        let chars_count: number = 0;
        let nums_count: number = 0;
        let space_count: number = 0;

        const Pas_split = password1.split("");
        const Pas_ASCII = Pas_split.map((a) => a.charCodeAt(0));

        Pas_ASCII.forEach((a) => {
            if(a>=48 && a<=57){
                nums_count = nums_count+1;
            }
            else if((a>=65 && a<=90) || (a>=97 && a<=122)){
                chars_count = chars_count+1;
            }
            else if(a == 32){
                space_count = space_count+1;
            }
        });

        if(chars_count === 0 && password1.length !== 0){
            setPassCharError("Necesitas insertar en la contraseña alguna letra");
            error_exists = true;
        }

        if(nums_count === 0 && password1.length !== 0){
            setPassNumError("Necesitas insertar en la contraseña algún número");
            error_exists = true;
        }

        if(space_count !== 0 && password1.length !== 0){
            setPassSpaceError("No puede haber espacios en la contraseña");
            error_exists = true;
        }

        if((password1 !== password2) && (passCharError === "" && passLengthError === "" && passNumError === "" && passSpaceError === "")){
            setPassword2Error("La password y su verificacion deben ser iguales");
            error_exists = true;
        }

        const passwordCrypt = Encrypt_Passwords(password1);
        
        if(passwordCrypt === undefined){
            error_exists = true;
        }

        const dniCrypt = Encrypt_DNI(dni);

        if(dniCrypt === undefined){
            error_exists = true;
        }

        if(error_exists === false){
            const body: Persona_ins = {
                nombre: nombre,
                apellido_1: apellido1,
                email: email,
                password: passwordCrypt,
                DNI: dniCrypt!,
                rol: rol,
            }

            if(apellido2.trim() !== ""){
                body.apellido_2 = apellido2;
            }

            if(phone.trim() !== ""){
                body.prefijo_movil = prefix;
                body.numero_movil = phone;
            }

            NProgress.start();
                                            
            try{
                const url = `https://tfg-back-end.onrender.com/register`;
                const response = await fetch(url, {
                    method: "POST",
                    body: JSON.stringify(body),
                });

                if(response.status !== 200){
                    const error = await response.json();
                    alert(error.error);

                    setButtonAction(false);
                }
                else{
                    const data = await response.json();
                    alert(data.message);
                    globalThis.location.href = "/paginaPersonal"
                }
            }
            finally{
                NProgress.done();
            }
        }
        else{
            alert("Falta rellenar algún campo");
            setButtonAction(false);
        }
    }

    return (
        <div className="finalPage">
            <Header/>
            <div className="register">
                <form className="registerForm">
                    <h2>Registro de usuario</h2>
                    <div className="column">
                        <label htmlFor="nombre">Nombre:</label>
                        <input id="nombre" name="nombre" type="text" placeholder="Nombre" onChange={(e) => {
                            setNombre(e.currentTarget.value);
                            setNombreError("");
                        }} required/>
                        <div className="error">{nombreError}</div>
                    </div>
                    <div className="column">
                        <label htmlFor="1er_apellido">1er Apellido:</label>
                        <input id="1er_apellido" name="1er_apellido" type="text" placeholder="1er Apellido" onChange={(e) => {
                            setApellido1(e.currentTarget.value);
                            setApellido1Error("");
                        }} required/>
                        <div className="error">{apellido1Error}</div>
                    </div>
                    <div className="column">
                        <label htmlFor="2do_apellido">2do Apellido:</label>
                        <input id="2do_apellido" name="2do_apellido" type="text" placeholder="2do Apellido" onChange={(e) => setApellido2(e.currentTarget.value)}/>
                    </div>
                    <div className="column">
                        <label htmlFor="dni">DNI:</label>
                        <input id="dni" name="dni" type="text" placeholder="DNI" onChange={(e) => {
                            setDNI(e.currentTarget.value);
                            setDNIError("");
                        }} required/>
                        <div className="error">{dniError}</div>
                    </div>
                    <div className="column">
                        <label htmlFor="phone_number">Numero telefónico:</label>
                        <div id="phone_number" className="combo_data">
                            <select id="prefix" name="prefix" defaultValue="+34" className="registerPhoneInput"  onChange={(e) => setPrefix(e.currentTarget.value)}>
                                <option value="+30">+30</option>
                                <option value="+31">+31</option>
                                <option value="+32">+32</option>
                                <option value="+33">+33</option>
                                <option value="+34">+34</option>
                                <option value="+39">+39</option>
                                <option value="+49">+49</option>
                                <option value="+351">+351</option>
                            </select>
                            <input id="phone" name="phone" type="text" placeholder="Número telefónico" className="registerPhoneSelect" onChange={(e) => {
                                setPhone(e.currentTarget.value);
                                setPhoneError("");
                            }}/>
                        </div>
                        <div className="error">{phoneError}</div>
                    </div>
                    <div className="column">
                        <label htmlFor="email">Email:</label>
                        <input id="email" name="email" type="text" placeholder="Email" onChange={(e) => {
                            setEmail(e.currentTarget.value);
                            setEmailError("");
                        }} required/>
                        <div className="error">{emailError}</div>
                    </div>
                    <div className="column">
                        <label htmlFor="password">Contraseña:</label>
                        <input id="password" name="password" type="password" placeholder="Contraseña" onChange={(e) => {
                            setPassword1(e.currentTarget.value);
                            setPassword1Error("");
                            setPassLengthError("");
                            setPassSpaceError("");
                            setPassCharError("");
                            setPassNumError("");
                        }} required/>
                        <div className="error">{password1Error}</div>
                        <div className="error">{passCharError}</div>
                        <div className="error">{passLengthError}</div>
                        <div className="error">{passNumError}</div>
                        <div className="error">{passSpaceError}</div>
                    </div>
                    <div className="column">
                        <label htmlFor="verificacion">Repite la contraseña:</label>
                        <input id="verificacion" name="verificacion" type="password" placeholder="Verificacion de la contraseña" onChange={(e) => {
                            setPassword2(e.currentTarget.value);
                            setPassword2Error("");
                        }} required/>
                        <div className="error">{password2Error}</div>
                    </div>
                    <div className="buttons">
                        <button type="reset" onClick={handleReset}>Vaciar campos</button>
                        <button type="button" disabled={buttonAction} onClick={handleNewUser}>Enviar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;