import { useEffect, useState } from "react"
import './Forms.css';
import Cookie from "js-cookie";
import type { Administrativo } from "../types/Personas/Administrativo.ts";
import type { Coordinador } from "../types/Personas/Coordinador.ts";
import type { Estudiante } from "../types/Personas/Estudiante.ts";
import type { Profesor } from "../types/Personas/Profesor.ts";
import { Validate_Email } from "../utilities/Validations/Validate_Email.ts";
import { Encrypt_Passwords } from "../utilities/Transforms/Transform_Passwords.ts";
import Header from "../Header/Header.tsx";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [emptyError, setEmptyError] = useState("");
    const [validationError, setValidationError] = useState("");

    const [buttonAction, setButtonAction] = useState(false);
    const [creationSuccess, setCreationSuccess] = useState(false);

    useEffect(() => {
        const Verify_Id = () => {
            const auth = Cookie.get("authTFG");

            if(auth !== undefined){
                globalThis.location.href = "/paginaPersonal";
            }
        }

        Verify_Id();
    }, []);

    const handleReset = () => {
        setEmail("");
        setPassword("");
        
        setEmailError("");
        setPasswordError("");
        setEmptyError("");
        setValidationError("");
        
        setButtonAction(false);
    }

    const handleLogin = async () => {
        setButtonAction(true);

        let error_exists = false;

        const email_aux = email.trim();
        const password_aux = password.trim();
        if(email_aux === "" || password_aux === ""){
            setEmptyError("Hay que rellenar todos los parámetros");
            error_exists = true;
        }

        if(email_aux !== ""){
            const validate_email = await Validate_Email(email);

            if(validate_email.status !== 200){
                const objeto = await validate_email.json();
                setValidationError(objeto.error);
                error_exists = true;
            }
        }

        const passwordCrypt = Encrypt_Passwords(password);

        if(passwordCrypt === undefined){
            error_exists = true;
        }
        
        if(error_exists === false){
            NProgress.start();

            try{
                const URL = `https://tfg-back-end.onrender.com/login?email=${email}&password=${passwordCrypt}`;
                const response = await fetch(URL, {
                    method: "GET",
                });

                if(response.status !== 200){
                    const error = await response.json();

                    alert(error.error);
                    
                    setButtonAction(false);
                }
                else{
                    const data: (Coordinador | Estudiante | Profesor | Administrativo) = await response.json();

                    Cookie.set("authTFG", data.id, {expires: 7});
                    setCreationSuccess(true);
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
            {
                creationSuccess === false &&
                <div className="login">
                    <form className="loginForm" onSubmit={(e) => e.preventDefault()}>
                        <h2>Inicio de sesión</h2>
                        <div className="column">
                            <label htmlFor="email">Email:</label>
                            <input id="email" name="email" type="text" placeholder="Email" onChange={(e) => {
                                setEmail(e.currentTarget.value);
                                setEmptyError("");
                                setEmailError("");
                                setValidationError("");
                            }}/>
                            <div className="error">{emailError}</div>
                            <div className="error">{validationError}</div>
                        </div>
                        <div className="column">
                            <label htmlFor="password">Contraseña:</label>
                            <input id="password" name="password" type="password" placeholder="Contraseña" onChange={(e) => {
                                setPassword(e.currentTarget.value);
                                setPasswordError("");
                                setEmptyError("");
                            }}/>
                            <div className="error">{passwordError}</div>
                        </div>
                        <div className="error">{emptyError}</div>
                        <div className="buttons">
                            <button type="reset" onClick={handleReset}>Vaciar campos</button>
                            <button type="button" onClick={handleLogin} disabled={buttonAction}>Enviar</button>
                        </div>
                    </form>
                </div>
            }
            {
                creationSuccess === true &&
                <div className="message_response">
                    <div className="column">
                        <h1>Inicio de sesión exitoso</h1>
                    </div>
                    <div className="buttons">
                        <button type="button" onClick={() => globalThis.location.href = "/paginaPersonal"}>Continuar</button>
                    </div>
                </div>
            }
        </div>
    )
}

export default Login;