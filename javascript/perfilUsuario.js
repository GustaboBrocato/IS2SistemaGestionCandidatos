// Obtener informacion de perfil de usuario
const token = localStorage.getItem('token');
// Variables
const editEmailButton = document.getElementById("editEmailButton");
const passwordPopup = document.getElementById("passwordPopup");
const emailPopup = document.getElementById("emailPopup");
const codePopup = document.getElementById("codePopup");
// Botones
const verifyPasswordButton = document.getElementById("verifyPasswordButton");
const sendVerificationCodeButton = document.getElementById("sendVerificationCodeButton");
const confirmEmailButton = document.getElementById("confirmEmailButton");

const getUserInfo = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/users/profileUsuario', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userInfo = await response.json();
            
            document.getElementById('recruiterName').textContent = userInfo.nombre;
            document.getElementById('employeeId').innerHTML= `<strong>ID de Empleado: </strong> ${userInfo.nombre}`;
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
        const response = await fetch('http://localhost:3000/api/images/getImage', {
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

// Eventos
editEmailButton.addEventListener("click", () => {
    passwordPopup.style.display = "block";
});

// Verificacion de Password
verifyPasswordButton.addEventListener("click", async () => {
    const password = document.getElementById("passwordInput").value;
    const response = await fetch('http://localhost:3000/api/users/verify-password', {
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
    const response = await fetch('http://localhost:3000/api/users/send-verification-code', {
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

    const response = await fetch('http://localhost:3000/api/users/confirm-email', {
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

//Evento de carga de documento
document.addEventListener('DOMContentLoaded', () => {
    getUserInfo();
});
