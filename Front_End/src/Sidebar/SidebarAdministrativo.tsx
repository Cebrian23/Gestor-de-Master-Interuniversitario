import Cookie from "js-cookie";
import './Sidebar.css';

function SidebarAdministrativo() {
    const handleLogout = () => {
        Cookie.remove("authTFG");
        Cookie.remove("TFG_titulacion");
        Cookie.remove("TFG_asig");
        Cookie.remove("TFG_curso");
        Cookie.remove("TFG_conv");
        Cookie.remove("TFG_TFM");
        Cookie.remove("TFG_TFM_Block");
        Cookie.remove("TFG_cursoTFM");
        
        globalThis.location.href = "/login";
    }

    return(
        <div className="sidebarAdministrativo">
            <h3>Indice</h3>
            <button type="button" onClick={() => globalThis.location.href = "/paginaPersonal"}>Volver al inicio</button>
            <h4>Gestionar titulaciones administradas</h4>
            <button type="button" onClick={() => globalThis.location.href = "/mostrarTitulaciones"}>Ver titulaciones administradas</button>
            <h4>Acciones de los datos del usuario</h4>
            <button type="button" className="button" onClick={() => globalThis.location.href = "/actualizarDatosPersonales"}>Actualizar datos de usuario</button>
            <br/>
            <button type="button" className="button" onClick={handleLogout}>Cerrar sesion</button>
        </div>
    );
}

export default SidebarAdministrativo;