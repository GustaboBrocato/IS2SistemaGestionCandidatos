import BASE_URL from '../javascript/config.js';
let usuario = false;
//Funcion para revisar si esta loggeado el usuario
async function isUserLoggedIn() {
    try {
        // Obtiene el token del storage
        const token = localStorage.getItem('token');

        if (!token) {
            // Si el token no existe el usuario no esta loggeado
            return false;
        }
        const endpoint = "/authenticate";
        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
            },
        });

        if (response.ok) {
            // Usuario loggeado
            const data = await response.json();

            return data.loggedIn;  // true or false
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error al comprobar el estado de inicio de sesión:', error);
        return false;
    }
}



//Funcion para revisar el permiso del role
async function checkRole(requiredRole) {
    try {
        const token = localStorage.getItem('token');
        const endpoint = "";
        const url = `${BASE_URL}/api/roles/checkRole?requiredRole=${requiredRole}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
            },
        });

        const data = await response.json();
        return data.exists;
    } catch (error) {
        console.error('Función de comprobación de errores:', error);
        throw new Error('Rol de comprobación de errores. Inténtelo de nuevo más tarde.');
    }
}

// Funcion para mostrar el segundo menu y foto de perfil
function showDropdownMenu(user) {
    const loginSignupButtons = document.getElementById('loginSignupButtons');
    const userDropdown = document.getElementById('userDropdown');
    const profilePicture = document.getElementById('profilePicture');
    const profileDropdownLink = document.getElementById('profileDropdownLink');
    const navAplicaciones = document.getElementById('navAplicaciones');

    // Esconde los botones de login y signup
    loginSignupButtons.style.display = 'none';

    // muestra el menu en cascada
    userDropdown.style.display = 'block';

    // Coloca el enlace a la pagina de perfil
    profileDropdownLink.href = 'index.html';

    // Show or hide 'Aplicaciones' based on user truthiness
    if (user) {
        navAplicaciones.style.display = 'block'; // Show 'Aplicaciones' if user exists
    } else {
        navAplicaciones.style.display = 'none'; // Hide 'Aplicaciones' if no user
    }
}

// Funcion para logout y cambiar el menu
async function logout() {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No se encontró ningún token en localStorage');
            return;
        }

        // Controla la desautorizacion del token a nivel de servidor
        const endpoint = "/signout";
        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Quita el token del storage local
            localStorage.removeItem('token');

            // Show success message and redirect
            showToast('¡Su sesión ha sido cerrada!');
            setTimeout(() => {
                window.location.href = '/IS2SistemaGestionCandidatos/html/index.html';
            }, 2000);
        } else {
            // Handle the error response
            const errorMessage = await response.json();
            console.error('No se pudo cerrar sesión:', errorMessage.error);
        }
    } catch (error) {
        console.error('Se produjo un error al cerrar sesión.:', error);
    }
}


// Revisa si un token existe y muestra el menu concorde el permiso
document.addEventListener('DOMContentLoaded', async () => {
    const loggedIn = await isUserLoggedIn();
    const loginSignupButtons = document.getElementById('loginSignupButtons');
    const userDropdown = document.getElementById('userDropdown');

    if (loggedIn) {
        // Esconde los botones de login signup
        loginSignupButtons.style.display = 'none';

        // Revisa los roles del usuario
        const isAdmin = await checkRole('Admin');
        const isReclutador = isAdmin ? false : await checkRole('Reclutador');
        const isUsuario = !isAdmin && !isReclutador; // Valor predeterminado para el usuario si no es administrador o reclutador

        showDropdownMenu(isUsuario);

        //Carga imagen de perfil
        await setProfileImage();

        // Actualiza los enlaces de navegacion
        const mainNavLinks = [
            { id: 'navHome', text: 'Inicio', href: 'index.html' },
            { id: 'navHistoria', text: 'Historia', href: 'historia.html' },
            { id: 'navProyectos', text: 'Portafolio', href: 'proyectos.html' },
            { id: 'navVacantes', text: 'Empleos', href: 'vacantes.html' },
            { id: 'navPerfil', text: 'Perfil', href: 'perfil.html' }
        ];

        if (isAdmin) {
            // Menu personalizado para administrador
            updateMainNav(mainNavLinks, [
                { text: 'Inicio', href: 'homeAdmin.html' },
                { text: 'Reclutadores', href: 'gestionReclutador.html' },
                { text: 'Manage Projects', href: '/admin-projects.html' },
                { text: 'Manage Vacancies', href: '/admin-vacancies.html' },
                { id: 'navPerfil', text: 'Perfil', href: 'perfil.html' }
            ]);
        } else if (isReclutador) {
            // Menu personalizado para reclutador
            updateMainNav(mainNavLinks, [
                { text: 'Inicio', href: 'homeReclutador.html' },
                { text: 'Empleos', href: 'vacantes.html' },
                { text: 'Aplicaciones', href: 'aplicaciones.html' },
                { text: 'Evaluaciones', href: 'evaluaciones.html' },
                { id: 'navPerfil', text: 'Perfil', href: 'perfilReclutador.html' }
            ]);
        } else if (isUsuario) {
            // Menu personalizado para usuario
            updateMainNav(mainNavLinks, [
                { text: 'Inicio', href: 'index.html' },
                { text: 'Historia', href: 'historia.html' },
                { text: 'Portafolio', href: 'proyectos.html' },
                { text: 'Empleos', href: 'vacantes.html' },
                { id: 'navPerfil', text: 'Perfil', href: 'perfilCandidato.html' }
            ]);
        }

        // Muestra el menu en cascada
        userDropdown.style.display = 'block';

        // Evento para boton de logout
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', logout);
        }
    } else {
        // Mostrar botones de login/logout si no esta loggeado
        loginSignupButtons.style.display = 'block';
    }
});

// Funcion para ayudar a actualizar la navegacion
function updateMainNav(navLinks, newValues) {
    navLinks.forEach((link, index) => {
        const element = document.getElementById(link.id);
        if (element) {
            element.textContent = newValues[index].text;
            element.href = newValues[index].href;
        }
    });
}


//funcion para mostrar un mensaje
function showToast(message) {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.innerText = message;
    toastMessage.style.display = 'block';
    setTimeout(() => {
        toastMessage.style.display = 'none';
    }, 2000);
}

//Funcion para obtener la imagen de perfil
const setProfileImage = async () => {
    try {

        const isAdmin = await checkRole('Admin');
        const isReclutador = isAdmin ? false : await checkRole('Reclutador');
        const isUsuario = !isAdmin && !isReclutador;
        let endpoint = "/api/images/getImage";
        let url = `${BASE_URL}${endpoint}`;

        if (isUsuario) {
            endpoint = "/api/images/getImageCandidato";
            url = `${BASE_URL}${endpoint}`;
        };

        const menuProfilePicture = document.getElementById('profilePicture');
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const imageBlob = await response.blob();
            const imageObjectUrl = URL.createObjectURL(imageBlob);

            // Coloca la imagen
            menuProfilePicture.src = imageObjectUrl;
        } else {
            menuProfilePicture.src = '../imagenes/Default_Profile.png';
            console.error('No se pudo recuperar la imagen: ', response.statusText);
        }
    } catch (error) {
        console.error('Error al obtener la imagen:', error);
    }
};