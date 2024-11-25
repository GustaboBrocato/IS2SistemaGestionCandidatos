// Select the form and input fields
const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('user');
const passwordInput = document.getElementById('passwd');
const contenedorError = document.getElementById('contenedor-error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS',
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('La respuesta no fue correcta');
        }

        const data = await response.json();

        // Guarda el token en local storage
        localStorage.setItem('token', data.token);
        showToast('¡El inicio de sesión ha sido exitoso! Redirigiendo…');

        setTimeout(async () => {
            try {
                // Obtener la ruta de redireccion
                const redirectRoute = await getRedirectRoute();
                window.location.href = redirectRoute;
            } catch (err) {
                console.error('Error during redirection:', err);
                window.location.href = 'index.html';
            }
        }, 2000);

    } catch (error) {
        console.error('Error: ', error);
        contenedorError.textContent = 'Usuario o Contraseña incorrecta';
    }
});


// Show a toast message
function showToast(message) {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.innerText = message;
    toastMessage.style.display = 'block';
    setTimeout(() => {
        toastMessage.style.display = 'none';
    }, 2000);
}

//Funcion para obtener ruta donde redirigir
async function getRedirectRoute() {
    const token = localStorage.getItem('token');

    // Si no hay ningún token, redirigir a la pantalla de login
    if (!token) {
        return '/html/login.html';
    }

    try {
        // usar la funcion de checkrole para revisar el usuario
        const isAdmin = await checkRole('Admin');
        const isReclutador = await checkRole('Reclutador');
        const isUsuario = await checkRole('Usuario');

        // Determina la ruta basado en el rol
        if (isAdmin) {
            return 'index.html';
        } else if (isReclutador) {
            return 'homeReclutador.html';
        } else if (isUsuario) {
            return 'index.html';
        } else {
            return 'index.html';
        }

    } catch (error) {
        console.error('Error checking role:', error);
        return 'index.html';
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

