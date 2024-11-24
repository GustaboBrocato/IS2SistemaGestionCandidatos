//Funcion para revisar si esta loggeado el usuario
async function isUserLoggedIn() {
    try {
        // Obtiene el token del storage
        const token = localStorage.getItem('token');
        
        if (!token) {
            // Si el token no existe el usuario no esta loggeado
            return false;
        }

        const response = await fetch('http://localhost:3000/authenticate', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
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
        console.error('Error checking login status:', error);
        return false;
    }
}



//Funcion para revisar el permiso del role
async function checkRole(requiredRole) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/roles/checkRole?requiredRole=${requiredRole}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            },
        });

        const data = await response.json();
        return data.exists;
    } catch (error) {
        console.error('Error checking role:', error);
        throw new Error('Error checking role. Please try again later.');
    }
}

// Funcion para mostrar el segundo menu y foto de perfil
function showDropdownMenu() {
    const loginSignupButtons = document.getElementById('loginSignupButtons');
    const userDropdown = document.getElementById('userDropdown');
    const profilePicture = document.getElementById('profilePicture');
    const profileDropdownLink = document.getElementById('profileDropdownLink');

    // Esconde los botones de login y signup
    loginSignupButtons.style.display = 'none';

    // muestra el menu en cascada
    userDropdown.style.display = 'block';



    // Coloca el enlace a la pagina de perfil
    profileDropdownLink.href = 'profile.html';
}

// Funcion para logout y cambiar el menu
async function logout() {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No token found in localStorage');
            return;
        }

        // Controla la desautorizacion del token a nivel de servidor
        const response = await fetch('http://localhost:3000/signout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
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
            console.error('Failed to logout:', errorMessage.error);
        }
    } catch (error) {
        console.error('An error occurred during logout:', error);
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
        showDropdownMenu();

        //Carga imagen de perfil
        await setProfileImage();

        // Revisa los roles del usuario
        const isAdmin = await checkRole('Admin');
        const isReclutador = isAdmin ? false : await checkRole('Reclutador'); // Only check if not Admin
        const isUsuario = !isAdmin && !isReclutador; // Default to User if not Admin or Recruiter

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
                { text: 'Admin Dashboard', href: '/admin-dashboard.html' },
                { text: 'Company History', href: '/admin-history.html' },
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
                { id: 'navPerfil', text: 'Perfil', href: 'perfil.html' }
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
        const menuProfilePicture = document.getElementById('profilePicture');
        const token = localStorage.getItem('token'); // Get the JWT token from localStorage
        const response = await fetch('http://localhost:3000/api/images/getImage', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Send the token in the Authorization header
            }
        });

        if (response.ok) {
            const imageBlob = await response.blob();
            const imageObjectUrl = URL.createObjectURL(imageBlob);

            // Coloca la imagen
            menuProfilePicture.src = imageObjectUrl;
        } else {
            menuProfilePicture.src = '../imagenes/Default_Profile.png';
            console.error('Failed to fetch image: ', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching image:', error);
    }
};