// Select the form and input fields
import BASE_URL from '../javascript/config.js';
const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('user');
const passwordInput = document.getElementById('passwd');
const contenedorError = document.getElementById('contenedor-error');
const emailPopup = document.getElementById("emailPopup");
const codePopup = document.getElementById("codePopup");
let email = "";

//botones
const sendVerificationCodeButton = document.getElementById("sendVerificationCodeButton");
const closeEmailButton = document.getElementById("closeEmailPopup");
const closeCodeButton = document.getElementById("closeCodePopup");
const confirmCodeButton = document.getElementById("confirmEmailButton");

//input
const newEmailInput = document.getElementById("newEmailInput");
const codeInput = document.getElementById("verificationCodeInput");

//eventos
//Eventos de cierre de popup
closeEmailButton.addEventListener("click", closePopup);
closeCodeButton.addEventListener("click", closePopup);

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const endpoint = "/login";
        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
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
            return 'homeAdmin.html';
        } else if (isReclutador) {
            return 'homeReclutador.html';
        } else if (isUsuario) {
            return 'perfilCandidato.html';
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
        console.error('Error checking role:', error);
        throw new Error('Error checking role. Please try again later.');
    }
}

document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault();

    // Show the email input popup
    emailPopup.style.display = "block";

});

// Handle the sendVerificationCodeButton event to send the verification request
sendVerificationCodeButton.addEventListener('click', async (e) => {
    e.preventDefault();

    email = newEmailInput.value.trim();

    if (!email) {
        alert("Debe ingresar un correo electrónico antes de enviar el código.");
        return;
    }

    try {
        // Send a request to initiate the password reset process
        const endpoint = "/api/candidatos/forgotPassword";
        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();

        if (response.ok) {
            emailPopup.style.display = "none"; // Hide the email popup
            codePopup.style.display = "block"; // Show the code popup for verification
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error al enviar la solicitud de restablecimiento de contraseña:", error);
        alert("Hubo un error al procesar su solicitud. Por favor, intente de nuevo más tarde.");
    }
});

// Confirmar Codigo
confirmEmailButton.addEventListener("click", async () => {
    const resetCode = document.getElementById("verificationCodeInput").value;
    const email = document.getElementById("newEmailInput").value;

    const endpoint = "/api/candidatos/confirmCode";
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resetCode })
    });

    if (response.ok) {
        alert("Contraseña reestablecida, revise su correo");
        location.reload();
    } else {
        alert("Código incorrecto o expirado");
    }
});

function closePopup() {
    emailPopup.style.display = "none";
    codePopup.style.display = "none";
    clearAllFields();
}

function clearAllFields() {
    newEmailInput.value = "";
    codeInput.value = "";
}