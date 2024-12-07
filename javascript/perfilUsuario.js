import BASE_URL from '../javascript/config.js';
// Obtener informacion de perfil de usuario
const token = localStorage.getItem('token');

// Variables
const editEmailButton = document.getElementById("editEmailButton");
const closePasswordButton = document.getElementById("closePasswordPopup");
const closeEmailButton = document.getElementById("closeEmailPopup");
const closeCodeButton = document.getElementById("closeCodePopup");
const passwordPopup = document.getElementById("passwordPopup");
const emailPopup = document.getElementById("emailPopup");
const codePopup = document.getElementById("codePopup");

// Variables for cambiar password
const changePasswordButton = document.getElementById("changePasswordButton");
const changePasswordPopup = document.getElementById("changePasswordPopup");
const closeChangePasswordButton = document.getElementById("closeChangePasswordPopup");
const submitChangePasswordButton = document.getElementById("submitChangePasswordButton");

// Inputs
const oldPasswordInput = document.getElementById("oldPasswordInput");
const newPasswordInput = document.getElementById("newPasswordInput");
const confirmNewPasswordInput = document.getElementById("confirmNewPasswordInput");
const passwordInput = document.getElementById("passwordInput");
const newEmailInput = document.getElementById("newEmailInput");
const codeInput = document.getElementById("verificationCodeInput");

// Botones
const verifyPasswordButton = document.getElementById("verifyPasswordButton");
const sendVerificationCodeButton = document.getElementById("sendVerificationCodeButton");
const confirmEmailButton = document.getElementById("confirmEmailButton");

// Eventos
editEmailButton.addEventListener("click", () => {
    passwordPopup.style.display = "block";
});

//Eventos de cierre de popup
closePasswordButton.addEventListener("click", closePopup);
closeEmailButton.addEventListener("click", closePopup);
closeCodeButton.addEventListener("click", closePopup);

//Cierre de popup password
closeChangePasswordButton.addEventListener("click", () => {
    changePasswordPopup.style.display = "none";
    clearAllFields();
});

// Evento para abrir popup de password
changePasswordButton.addEventListener("click", () => {
    changePasswordPopup.style.display = "block";
});

//Evento de carga de documento
document.addEventListener('DOMContentLoaded', async () => {
    const loggedIn = await isUserLoggedIn();

    if(!loggedIn){
        window.location.href = '/IS2SistemaGestionCandidatos/html/login.html';
    }
    getUserInfo();
});

//Funcion para obtener informacion de perfil
const getUserInfo = async () => {
    try {
        const endpoint = "/api/users/profileUsuario";
        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userInfo = await response.json();

            document.getElementById('recruiterName').textContent = userInfo.nombre;
            document.getElementById('employeeId').innerHTML = `<strong>ID de Empleado: </strong> ${userInfo.nombre}`;
            document.getElementById('recruiterEmail').innerHTML = `<strong>Correo: </strong> ${userInfo.correo}`;
            await getProfileImage();
            //document.getElementById('registrationDate').textContent = userInfo.fecharegistro;
        } else {
            console.error('Failed to fetch user info:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
};

//Funcion para obtener la imagen
const getProfileImage = async () => {
    try {
        const token = localStorage.getItem('token');
        const endpoint = "/api/images/getImage";
        const url = `${BASE_URL}${endpoint}`;
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
            recruiterProfilePicture.src = imageObjectUrl;
        } else {
            menuProfilePicture.src = '../imagenes/Default_Profile.png';
            console.error('Failed to fetch image: ', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching image:', error);
    }
};

// Verificacion de Password
verifyPasswordButton.addEventListener("click", async () => {
    const password = document.getElementById("passwordInput").value;
    const endpoint = "/api/users/verify-password";
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
    });

    if (response.ok) {
        passwordPopup.style.display = "none";
        emailPopup.style.display = "block";
    } else {
        alert("Contraseña incorrecta");
    }
});

// Send Verification Code
sendVerificationCodeButton.addEventListener("click", async () => {
    const newEmail = document.getElementById("newEmailInput").value;
    const endpoint = "/api/users/send-verification-code";
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail })
    });

    if (response.ok) {
        emailPopup.style.display = "none";
        codePopup.style.display = "block";
    } else {
        alert("Error enviando el código");
    }
});

// Confirm Email Change
confirmEmailButton.addEventListener("click", async () => {
    const code = document.getElementById("verificationCodeInput").value;
    const newEmail = document.getElementById("newEmailInput").value;

    const endpoint = "/api/users/confirm-email";
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, newEmail })
    });

    if (response.ok) {
        alert("Correo actualizado exitosamente");
        location.reload();
    } else {
        alert("Código incorrecto o expirado");
    }
});

// Funcion para cambiar la contraseña
submitChangePasswordButton.addEventListener("click", async () => {
    const oldPassword = oldPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;

    // Validaciones
    if (!oldPassword || !newPassword || !confirmNewPassword) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    // Revisar si las contraseñas nuevas coinciden
    if (newPassword !== confirmNewPassword) {
        alert("Las nuevas contraseñas no coinciden.");
        return;
    }

    // Validacion de contraseña (minimo 8 caracteres, 1 letra y 1 numero)
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordPattern.test(newPassword)) {
        alert("La nueva contraseña debe tener al menos 8 caracteres, incluyendo una letra y un número.");
        return;
    }

    try {
        const endpoint = "/api/users/change-password";
        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });

        if (response.ok) {
            alert("Contraseña actualizada exitosamente.");
            changePasswordPopup.style.display = "none";
            clearAllFields();
        } else {
            const errorData = await response.json();
            alert(errorData.message || "Error al cambiar la contraseña.");
        }
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
    }
});

function closePopup() {
    passwordPopup.style.display = "none";
    emailPopup.style.display = "none";
    codePopup.style.display = "none";
    clearAllFields();
}

function clearAllFields() {
    oldPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmNewPasswordInput.value = "";
    passwordInput.value = "";
    newEmailInput.value = "";
    codeInput.value = "";
}

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
        console.error('Error checking login status:', error);
        return false;
    }
}

