import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { Administrativo } from "../types/Personas/Administrativo.ts";
import type { Coordinador } from "../types/Personas/Coordinador.ts";
import type { Estudiante } from "../types/Personas/Estudiante.ts";
import type { Persona_upt } from "../types/Personas/Persona.ts";
import type { Profesor } from "../types/Personas/Profesor.ts";
import { Validate_Phone } from "../utilities/Validations/Validate_Phone.ts";
import { Encrypt_Passwords } from "../utilities/Transforms/Transform_Passwords.ts";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import SidebarProfesor from "../Sidebar/SidebarProfesor.tsx";
import SidebarCoordinador from "../Sidebar/SidebarCoordinador.tsx";
import Header from "../Header/Header.tsx";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

function UpdateUser() {
    const [user, setUser] = useState<Estudiante | Coordinador | Profesor | Administrativo>();
    const [id, setId] = useState("");
    const [rol, setRol] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido1, setApellido1] = useState("");
    const [apellido2, setApellido2] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [prefix, setPrefix] = useState("+34");
    const [phone, setPhone] = useState("");

    const [nombreError, setNombreError] = useState("");
    const [apellido1Error, setApellido1Error] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [password1Error, setPassword1Error] = useState("");
    const [password2Error, setPassword2Error] = useState("");
    const [passLengthError, setPassLengthError] = useState("");
    const [passCharError, setPassCharError] = useState("");
    const [passNumError, setPassNumError] = useState("");
    const [passSpaceError, setPassSpaceError] = useState("");

    const [buttonAction, setButtonAction] = useState(false);
    const [creationSuccess, setCreationSuccess] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const getUser = async () => {
            const auth = Cookie.get("authTFG");
            if(auth === undefined){
                globalThis.location.href = "/login";
            }

            const url = `https://tfg-back-end.onrender.com/persona/id?id=${auth}`;
            const response = await fetch(url, {
                method: "GET",
            });

            if(response.status !== 200){
                const error = await response.json();
                alert(error.error);
            }
            
            const data = await response.json();

            setUser(data);
            setId(data.id);
            setRol(data.rol);
            setNombre(data.nombre);
            setApellido1(data.apellido_1);

            if(data.apellido_2 !== null && data.apellido_2 !== undefined && data.apellido_2 !== ""){
                setApellido2(data.apellido_2);
            }
            else{
                setApellido2("");
            }

            if(data.prefijo_movil !== null && data.prefijo_movil !== undefined && data.prefijo_movil !== ""){
                setPrefix(data.prefijo_movil);
            }
            else{
                setPrefix("+34");
            }

            if(data.numero_movil !== null && data.numero_movil !== undefined && data.numero_movil !== ""){
                setPhone(data.numero_movil);
            }
            else{
                setPhone("");
            }
        }

        getUser();
    }, []);

    const handleReset = () => {
        if(user !== undefined){
            setNombre(user.nombre);
            setApellido1(user.apellido_1);
            setApellido1(user.apellido_1);

            if(user.apellido_2 !== null && user.apellido_2 !== undefined && user.apellido_2 !== ""){
                setApellido2(user.apellido_2);
            }
            else{
                setApellido2("");
            }

            if(user.prefijo_movil !== null && user.prefijo_movil !== undefined && user.prefijo_movil !== ""){
                setPrefix(user.prefijo_movil);
            }
            else{
                setPrefix("+34");
            }

            if(user.numero_movil !== null && user.numero_movil !== undefined && user.numero_movil !== ""){
                setPhone(user.numero_movil);
            }
            else{
                setPhone("");
            }

            setNombreError("");
            setApellido1Error("");
            setPhoneError("");
            setPassword1Error("");
            setPassword2Error("");
            setPassLengthError("");
            setPassCharError("");
            setPassNumError("");
            setPassSpaceError("");
        
            setButtonAction(false);
        }
    }

    const handleUpdate = async () => {
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
    
        if(user !== undefined && user.rol !== "Estudiante"){
            /*
            if(password1.trim() === ""){
                setPassword1Error("Hay que rellenar este campo");
                error_exists = true;
            }
            else if(password1.length < 12 && password1.length !== 0){
                setPassLengthError("El tamaño de la contraseña debe tener, al menos, 12 caracteres");
                error_exists = true;
            }
            */
            if(password1.trim() !== ""){
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

                if((password1.trim() !== password2.trim()) && (passCharError === "" && passNumError === "" && passSpaceError === "" && password1Error === "")){
                    setPassword2("La contraseña y su validación deben ser iguales");
                    error_exists = true;
                }
            }
        }
    
        if(phoneError === "" && phone !== ""){
            const phone_data = await Validate_Phone(prefix, phone);
        
            if(phone_data.status !== 200){
                const error = await phone_data.json();
    
                setPhoneError(error.error);
                error_exists = true;
            }
        }
        
        const passwordCrypt = Encrypt_Passwords(password1);
        
        if(passwordCrypt === undefined){
            error_exists = true;
        }

        if(error_exists === false){
            const body: Persona_upt = {
                id: id,
                rol: rol,
                nombre: nombre,
                apellido_1: apellido1,
            }

            if(apellido2.trim() !== ""){
                body.apellido_2 = apellido2;
            }

            if(rol !== "Estudiante" && password1.trim() !== ""){
                body.password = passwordCrypt;
            }

            if(phone.trim() !== ""){
                body.prefix = prefix;
                body.phone = phone;
            }

            NProgress.start();

            try{
                const url = "https://tfg-back-end.onrender.com/datos_persona";
                const response = await fetch(url, {
                    method: "PUT",
                    body: JSON.stringify(body),
                });

                if(response.status !== 200){
                    const error = await response.json();

                    alert(error.error);
                    
                    setButtonAction(false);

                    globalThis.location.href = "/paginaPersonal";
                }
                else{
                    const data = await response.json();
                    
                    setMessage(data.message);
                    setCreationSuccess(true);
                }
            }
            finally{
                NProgress.done();
            }
        }
        else{
            setButtonAction(false);
        }
    }

    return(
        <div className="finalPage">
            <Header/>
            <div className="totalPage">
                {
                    rol === "Administrativo" &&
                    <SidebarAdministrativo/>
                }
                {
                    (rol === "Coordinador" || rol === "Coordinador general") &&
                    <SidebarCoordinador/>
                }
                {
                    rol === "Profesor" &&
                    <SidebarProfesor/>
                }
                {
                    creationSuccess === false &&
                    <div className="upt">
                        <form className="uptUserForm">
                            <h2>Actualización de datos de usuario</h2>
                            <div className="column">
                                <label htmlFor="nombre">Nombre:</label>
                                <input id="nombre" name="nombre" type="text" value={nombre} placeholder="Nombre" onChange={(e) => {
                                    setNombre(e.currentTarget.value);
                                    setNombreError("");
                                }} required/>
                                <div className="error">{nombreError}</div>
                            </div>
                            <div className="column">
                                <label htmlFor="1er_apellido">1er Apellido:</label>
                                <input id="1er_apellido" name="1er_apellido" type="text" value={apellido1} placeholder="1er Apellido" onChange={(e) => {
                                    setApellido1(e.currentTarget.value);
                                    setApellido1Error("");
                                }} required/>
                                <div className="error">{apellido1Error}</div>
                            </div>
                            <div className="column">
                                <label htmlFor="2do_apellido">2do Apellido:</label>
                                <input id="2do_apellido" name="2do_apellido" type="text" value={apellido2} placeholder="2do Apellido" onChange={(e) => setApellido2(e.currentTarget.value)}/>
                            </div>
                            <div className="column">
                                <label htmlFor="phone_number">Numero telefónico:</label>
                                <div id="phone_number" className="combo_data">
                                    <select id="prefix" name="prefix" value={prefix !== "" ? prefix : "+34"} className="registerPhoneInput" onChange={(e) => setPrefix(e.currentTarget.value)}>
                                        <option value="+30">+30</option>
                                        <option value="+31">+31</option>
                                        <option value="+32">+32</option>
                                        <option value="+33">+33</option>
                                        <option value="+34">+34</option>
                                        <option value="+39">+39</option>
                                        <option value="+49">+49</option>
                                        <option value="+351">+351</option>
                                    </select>
                                    <input id="phone" name="phone" type="text" value={phone} placeholder="Número telefónico" className="registerPhoneSelect" onChange={(e) => {
                                        setPhone(e.currentTarget.value);
                                        setPhoneError("");
                                    }}/>
                                </div>
                                <div className="">{phoneError}</div>
                            </div>
                            {
                                rol !== "Estudiante" &&
                                <>
                                    <div className="column">
                                        <label htmlFor="password">Contraseña:</label>
                                        <input id="password" name="password" type="password" placeholder="Password" onChange={(e) => {
                                            setPassword1(e.currentTarget.value);
                                            setPassword1Error("");
                                            setPassCharError("");
                                            setPassLengthError("");
                                            setPassNumError("");
                                            setPassSpaceError("");
                                        }} required/>
                                        <div className="error">{password1Error}</div>
                                        <div className="error">{passCharError}</div>
                                        <div className="error">{passLengthError}</div>
                                        <div className="error">{passNumError}</div>
                                        <div className="error">{passSpaceError}</div>
                                    </div>
                                    <div className="column">
                                        <label htmlFor="validation">Repetir contraseña:</label>
                                        <input id="validation" name="validation" type="password" placeholder="Repetir contraseña" onChange={(e) => {
                                            setPassword2(e.currentTarget.value);
                                            setPassword2Error("");
                                        }} required/>
                                        <div className="error">{password2Error}</div>
                                    </div>
                                </>
                            }
                            <div className="buttons">
                                <button type="button" onClick={() => globalThis.location.href = "/paginaPersonal"}>Volver</button>
                                <button type="button" onClick={handleReset}>Vaciar campos</button>
                                <button type="button" onClick={handleUpdate} disabled={buttonAction}>Enviar</button>
                            </div>
                        </form>
                    </div>
                }
                {
                    creationSuccess === true &&
                    <div className="message_response">
                        <div className="column">
                            <h1>{message}</h1>
                        </div>
                        <div className="buttons">
                            <button type="button" onClick={() => globalThis.location.href = "/paginaPersonal"}>Continuar</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default UpdateUser;