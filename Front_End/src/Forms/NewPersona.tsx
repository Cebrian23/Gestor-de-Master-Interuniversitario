import { useEffect, useState } from "react"
import './Forms.css';
import Cookie from "js-cookie";
import type { Persona_ins } from "../types/Personas/Persona.ts";
import { Validate_Email } from "../utilities/Validations/Validate_Email.ts";
import { Validate_Phone } from "../utilities/Validations/Validate_Phone.ts";
import { Encrypt_Passwords } from "../utilities/Transforms/Transform_Passwords.ts";
import { Encrypt_DNI } from "../utilities/Transforms/Transform_DNI.ts";
import SidebarAdministrativo from "../Sidebar/SidebarAdministrativo.tsx";
import { Validate_DNI } from "../utilities/Validations/Validate_DNI.ts";
import Header from "../Header/Header.tsx";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

function NewPersona() {
    const [pagina, setPagina] = useState(1);

    const [nombre, setNombre] = useState("");
    const [apellido1, setApellido1] = useState("");
    const [apellido2, setApellido2] = useState("");
    const [dni, setDNI] = useState("");
    const [prefix, setPrefix] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rol, setRol] = useState("");
    const [universidad, setUniversidad] = useState("");
    const [cursoAcademico, setCursoAcademico] = useState("");
    const [gradoUniversitario, setGrado] = useState("");
    const [titulacion, setTitulacion] = useState("");

    const [universidades, setUniversidades] = useState<string[]>([]);
    const [gradosUniversitarios, setGrados] = useState<string[]>([]);

    const [nombreError, setNombreError] = useState("");
    const [apellido1Error, setApellido1Error] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passLengthError, setPassLengthError] = useState("");
    const [passCharError, setPassCharError] = useState("");
    const [passNumError, setPassNumError] = useState("");
    const [passSpaceError, setPassSpaceError] = useState("");
    const [dniError, setDNIError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [rolError, setRolError] = useState("");

    const [buttonAction, setButtonAction] = useState(false);
    const [creationSuccess, setCreationSuccess] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const getDatosTitulacion = async () => {
            const id_user = Cookie.get("authTFG");

            if(id_user === undefined){
                globalThis.location.href = "/login";
            }
            
            const url_persona = `https://tfg-back-end.onrender.com/persona/id?id=${id_user}`;
            const response_persona = await fetch(url_persona, {
                method: "GET",
            });

            if(response_persona.status !== 200){
                const error = await response_persona.json();
                alert(error.error);

                Cookie.remove("authTFG");
                globalThis.location.href = "/login";
            }

            const data = await response_persona.json();

            if(data.rol !== "Administrativo"){
                alert("Tienes que ser un administrtivo para dar de alta a otras personas");

                globalThis.location.href = "/login";
            }

            const id_titulacion = Cookie.get("TFG_titulacion");

            if(id_titulacion === undefined){
                alert("Hay que tener una titulación para poder dar de alta a otras personas");

                globalThis.location.href = "/paginaPersonal";
            }

            const url = `https://tfg-back-end.onrender.com/titulacion?id=${id_titulacion}`;
            const response = await fetch(url, {
                method: "GET"
            });

            if(response.status !== 200){
                const error = await response.json();
                alert(error.error);
            }
            else{
                const data = await response.json();
                setTitulacion(data.id);
                setUniversidad(data.universidades[0].nombre);
                
                const unis: string[] = [];
                data.universidades.forEach((uni: {nombre: string, principal: boolean}) => {
                    unis.push(uni.nombre);
                });
                
                setUniversidades(unis);
                setGrado(data.grados_aptos[0]);
                setGrados(data.grados_aptos);
            }

            const date = new Date();
            let curso = "Curso ";

            if(date.getMonth()+1 <= 9){
                curso += `${date.getFullYear()}-${date.getFullYear() + 1}`;
            }
            else{
                curso += `${date.getFullYear() + 1}-${date.getFullYear() + 2}`;
            }

            setCursoAcademico(curso)
        }

        getDatosTitulacion();
    }, []);

    const handleReset = () => {
        setNombre("");
        setApellido1("");
        setApellido2("");
        setDNI("");
        setPrefix("+34");
        setPhone("");
        setEmail("");
        setPassword("");
        setRol("");
        setUniversidad(universidades[0]);
        setGrado(gradosUniversitarios[0]);

        setNombreError("");
        setApellido1Error("");
        setPasswordError("");
        setPassLengthError("");
        setPassCharError("");
        setPassNumError("");
        setPassSpaceError("");
        setDNIError("");
        setEmailError("");
        setPhoneError("");
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

        if(dni.trim() === ""){
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

        if(rol.trim() === ""){
            setRolError("Hay que rellenar este campo");
            error_exists = true;
        }

        if(rol !== "Estudiante"){
            if(password.trim() === ""){
                setPasswordError("Hay que rellenar este campo");
                error_exists = true;
            }
            else if(password.length < 12 && password.length !== 0){
                setPassLengthError("El tamaño de la contraseña debe tener, al menos, 12 caracteres");
                error_exists = true;
            }

            let chars_count: number = 0;
            let nums_count: number = 0;
            let space_count: number = 0;

            const Pas_split = password.split("");
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

            if(chars_count === 0 && password.length !== 0){
                setPassCharError("Necesitas insertar en la contraseña alguna letra");
                error_exists = true;
            }

            if(nums_count === 0 && password.length !== 0){
                setPassNumError("Necesitas insertar en la contraseña algún número");
                error_exists = true;
            }

            if(space_count !== 0 && password.length !== 0){
                setPassSpaceError("No puede haber espacios en la contraseña");
                error_exists = true;
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

        const passwordCrypt = Encrypt_Passwords(password);

        if(passwordCrypt === undefined){
            alert("Error al procesar");
            error_exists = true;
        }

        const dniCrypt = Encrypt_DNI(dni);

        if(dniCrypt === undefined){
            alert("Error al procesar");
            error_exists = true;
        }

        if(error_exists === false){
            const body: Persona_ins = {
                nombre: nombre,
                apellido_1: apellido1,
                email: email,
                DNI: dniCrypt!,
                rol: rol,
                titulacion: titulacion,
            }

            if(apellido2.trim() !== ""){
                body.apellido_2 = apellido2;
            }

            if(phone.trim() !== ""){
                body.prefijo_movil = prefix;
                body.numero_movil = phone;
            }

            if(rol === "Profesor" || rol === "Coordinador" || rol === "Coordinador general"){
                body.universidad = universidad;
                body.password = passwordCrypt;
            }
            else if(rol === "Administrativo"){
                body.password = passwordCrypt;
            }
            else if(rol === "Estudiante"){
                body.universidad = universidad;
                body.grado_academico = gradoUniversitario;

                body.curso_admision = cursoAcademico;
            }

            NProgress.start();
                                
            try{
                const url = `https://tfg-back-end.onrender.com/persona`;
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
                    
                    setMessage(data.message);
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
            <div className="totalPage">
                <SidebarAdministrativo/>
                {
                    creationSuccess === false &&
                    <div className={pagina === 1 ? "newUser" : (pagina === 2 && rol === "Administrativo") ? "newAdministrativo" : (pagina === 2 && rol === "Estudiante") ? "newEstudiante" : "newCoordinadorProfesor"}>
                        <form className="registerForm">
                            <h2>Registro de usuario</h2>
                            {
                                pagina === 1 &&
                                <>
                                    <div className="column">
                                        <label htmlFor="nombre">Nombre:</label>
                                        <input id="nombre" name="nombre" type="text" placeholder="Nombre" value={nombre} onChange={(e) => {
                                            setNombre(e.currentTarget.value);
                                            setNombreError("");
                                        }} required/>
                                        <div className="error">{nombreError}</div>
                                    </div>
                                    <div className="column">
                                        <label htmlFor="1er_apellido">1er Apellido:</label>
                                        <input id="1er_apellido" name="1er_apellido" type="text" placeholder="1er Apellido" value={apellido1} onChange={(e) => {
                                            setApellido1(e.currentTarget.value);
                                            setApellido1Error("");
                                        }} required/>
                                        <div className="error">{apellido1Error}</div>
                                    </div>
                                    <div className="column">
                                        <label htmlFor="2do_apellido">2do Apellido:</label>
                                        <input id="2do_apellido" name="2do_apellido" type="text" placeholder="2do Apellido" value={apellido2} onChange={(e) => setApellido2(e.currentTarget.value)}/>
                                    </div>
                                    <div className="column">
                                        <label htmlFor="dni">DNI:</label>
                                        <input id="dni" name="dni" type="text" placeholder="DNI" value={dni} onChange={(e) => {
                                            setDNI(e.currentTarget.value);
                                            setDNIError("");
                                        }} required/>
                                        <div className="error">{dniError}</div>
                                    </div>
                                    <div className="column">
                                        <label htmlFor="rol">Rol:</label>
                                        <select id="rol" name="rol" value={rol} onChange={(e) => {
                                            setRol(e.currentTarget.value);
                                            setRolError("");
                                        }}>
                                            <option value="">Selecciona el rol</option>
                                            <option value="Administrativo">Administrativo</option>
                                            <option value="Coordinador">Coordinador</option>
                                            <option value="Profesor">Profesor</option>
                                            <option value="Estudiante">Estudiante</option>
                                        </select>
                                        <div className="error">{rolError}</div>
                                    </div>
                                </>
                            }
                            {
                                pagina === 2 &&
                                <>
                                    <div className="column">
                                        <label htmlFor="phone_number">Numero telefónico:</label>
                                        <div id="phone_number" className="combo_data">
                                            <select id="prefix" name="prefix" defaultValue="+34" className="registerPhoneInput" onChange={(e) => setPrefix(e.currentTarget.value)}>
                                                <option value="+30">+30</option>
                                                <option value="+31">+31</option>
                                                <option value="+32">+32</option>
                                                <option value="+33">+33</option>
                                                <option value="+34">+34</option>
                                                <option value="+39">+39</option>
                                                <option value="+49">+49</option>
                                                <option value="+351">+351</option>
                                            </select>
                                            <input id="phone" name="phone" type="text" placeholder="Número telefónico" className="registerPhoneSelect" value={phone} onChange={(e) => {
                                                setPhone(e.currentTarget.value);
                                                setPhoneError("");
                                            }}/>
                                        </div>
                                        <div className="">{phoneError}</div>
                                    </div>
                                    <div className="column">
                                        <label htmlFor="email">Email:</label>
                                        <input id="email" name="email" type="text" placeholder="Email" value={email} onChange={(e) => {
                                            setEmail(e.currentTarget.value);
                                            setEmailError("");
                                        }} required/>
                                        <div className="error">{emailError}</div>
                                    </div>
                                    {
                                        rol !== "Estudiante" &&
                                        <div className="column">
                                            <label htmlFor="password">Password:</label>
                                            <input id="password" name="password" type="password" placeholder="Password" value={password} onChange={(e) => {
                                                setPassword(e.currentTarget.value);
                                                setPasswordError("");
                                                setPassCharError("");
                                                setPassLengthError("");
                                                setPassNumError("");
                                                setPassSpaceError("");
                                            }} required/>
                                            <div className="error">{passwordError}</div>
                                            <div className="error">{passCharError}</div>
                                            <div className="error">{passLengthError}</div>
                                            <div className="error">{passNumError}</div>
                                            <div className="error">{passSpaceError}</div>
                                        </div>
                                    }
                                    {
                                        rol !== "Administrativo" &&
                                        <div className="column">
                                            <label htmlFor="universidad">Universidad:</label>
                                            <select id="universidad" name="universidad" value={universidad} onChange={(e) => setUniversidad(e.currentTarget.value)}>
                                                {
                                                    universidades.map((uni) => {
                                                        return(
                                                            <option key={uni} value={uni}>{uni}</option>
                                                        );
                                                    })
                                                }
                                                {
                                                    rol === "Profesor" &&
                                                    <option key="Externo" value="Externo">Externo</option>
                                                }
                                            </select>
                                        </div>
                                    }
                                    {
                                        rol === "Estudiante" &&
                                        <>
                                            {
                                                /*<div className="column">
                                                    <label htmlFor="curso">Curso de admisión:</label>
                                                    <input id="curso" name="curso" type="number" min="2020" max="2060" value={curso} onChange={(e) => {
                                                        setCursito(Number(e.currentTarget.value));
                                                        setCurso(`Curso ${Math.trunc(Number(e.currentTarget.value))}-${Math.trunc(Number(e.currentTarget.value)+1)}`);
                                                    }}/>
                                                </div>*/
                                            }
                                            <div className="column">
                                                <label htmlFor="grado">Grado univesitario cursado que da acceso al Máster:</label>
                                                <select id="grado" name="grado" value={gradoUniversitario} onChange={(e) => setGrado(e.currentTarget.value)}>
                                                    {
                                                        gradosUniversitarios.map((grado) => {
                                                            return(
                                                                <option key={grado} value={grado}>{grado}</option>
                                                            )
                                                        })
                                                    }
                                                </select>
                                            </div>
                                        </>
                                    }
                                </>
                            }
                            <div className="buttons">
                                {
                                    pagina === 1 &&
                                    <>
                                        <button type="button" onClick={() => globalThis.location.href = "/mostrarTitulaciones"}>Volver</button>
                                        <button type="reset" onClick={handleReset}>Vaciar campos</button>
                                        <button
                                            type="button"
                                            disabled={
                                                (
                                                    nombre.trim() !== "" && apellido1.trim() !== "" && dni.trim() !== "" && rol.trim() !== ""
                                                ) ? false : true
                                            }
                                            onClick={() => setPagina(pagina+1)}
                                        >
                                            Siguiente página
                                        </button>
                                    </>
                                }
                                {
                                    pagina === 2 &&
                                    <>
                                        <button type="button" onClick={() => setPagina(pagina-1)}>Página anterior</button>
                                        <button type="reset" onClick={handleReset}>Vaciar campos</button>
                                        <button type="button" onClick={handleNewUser} disabled={buttonAction}>Enviar</button>
                                    </>
                                }
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
                            <button type="button" onClick={() => globalThis.location.href = "/mostrarTitulaciones"}>Continuar</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default NewPersona;