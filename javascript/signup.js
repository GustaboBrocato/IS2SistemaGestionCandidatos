import BASE_URL from '../javascript/config.js';
// Variables
let isEmailValid = false;
let isPasswordValid = false;
let confirmationCode = null;
let resendTimeout = null;

document.getElementById("correo").addEventListener("input", function () {
    validateEmail(this);
});
document.getElementById("passwd1").addEventListener("input", validatePasswordStrength);
document.getElementById("passwd2").addEventListener("input", validatePasswordMatch);
document.getElementById("dni").addEventListener("input", function () {
    validateDNI(this);
});

//Funcion para validar el DNI
function validateDNI(input) {
    const dniError = document.getElementById('dniError');

    // Eliminar caracteres no numéricos
    input.value = input.value.replace(/[^0-9]/g, '');

    // Compruebe si la longitud de entrada es 13
    if (input.value.length !== 0 && input.value.length !== 13) {
        dniError.style.display = 'block';
    } else {
        dniError.style.display = 'none';
    }
}

//Funcion para validar el correo
function validateEmail(input) {
    const emailError = document.getElementById('emailError');

    // Expresión regular para validar correo electrónico.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (input.value === '' || emailRegex.test(input.value)) {
        //Entrada válida o vacía (oculta el mensaje de error)
        isEmailValid = true;
        emailError.style.display = 'none';
    } else {
        // Correo invalido
        emailError.style.display = 'block';
    }
}

// Validar el formato de la contraseña
function validatePasswordStrength() {
    const passwordInput = document.getElementById('passwd1');
    const passwordStrengthError = document.getElementById('passwordStrengthError');

    // Regex de al menos 8 caracteres, 1 letra y 1 número
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

    if (passwordRegex.test(passwordInput.value)) {
        // Password valido
        isEmailValid = true;
        passwordStrengthError.style.display = 'none';
        passwordInput.style.border = '1px solid green';
    } else {
        // Password invalido
        passwordStrengthError.style.display = 'block';
        passwordInput.style.border = '1px solid red';
    }
}

// Validar si las contraseñas coinciden
function validatePasswordMatch() {
    const password1 = document.getElementById('passwd1').value;
    const password2 = document.getElementById('passwd2').value;
    const passwordMatchError = document.getElementById('passwordMatchError');

    if (password1 === password2) {
        // Contraseñas coinciden
        isPasswordValid = true;
        passwordMatchError.style.display = 'none';
        document.getElementById('passwd2').style.border = '1px solid green';
    } else {
        // Contraseñas no coinciden
        passwordMatchError.style.display = 'block';
        document.getElementById('passwd2').style.border = '1px solid red';
    }
}

//Cuando se carga el documento obtiene los niveles educativos
document.addEventListener('DOMContentLoaded', async () => {
    const educacionSelect = document.getElementById('educacion');
    const educacionError = document.getElementById('educacionError');

    try {
        const endpoint = "/api/niveles/getNiveles";
        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        const niveles = data.niveles;

        // Rellena el elemento
        niveles.forEach((nivel) => {
            const option = document.createElement('option');
            option.value = nivel.id;
            option.textContent = nivel.nombrenivel;
            educacionSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar los niveles educativos:', error);
        educacionError.style.display = 'block';
    }
});

//Listener para evento de crear cuenta
document.getElementById('submitButton').addEventListener('click', async (e) => {
    e.preventDefault();

    //Form
    const primerNombre = document.getElementById('nombre1').value;
    const segundoNombre = document.getElementById('nombre2').value;
    const apellidoPaterno = document.getElementById('apellido1').value;
    const apellidoMaterno = document.getElementById('apellido2').value;
    const fechaNac = document.getElementById('fechaNac').value;
    const correo = document.getElementById('correo').value;
    const telefono = document.getElementById('telefono').value;
    const dni = document.getElementById('dni').value;
    const passwd = document.getElementById('passwd1').value;
    const genero = document.getElementById('genero').value;
    const educacion = document.getElementById('educacion').value;

    const requiredFields = [
        primerNombre,
        apellidoPaterno,
        fechaNac,
        correo,
        telefono,
        dni,
        genero,
        educacion
    ];

    const emptyField = requiredFields.find(field => field === null || field === "");

    if (emptyField !== undefined) {
        alert('Por favor, llenar todos los campos. Si solo tiene un nombre o apellido, deje el segundo nombre y apellido materno en blanco.');
        return;
    }

    if (!isEmailValid) {
        alert('El correo ingresado no es correcto.');
        return;
    }

    if (!isPasswordValid) {
        alert('Las Contraseñas no coinciden.');
        return;
    }

    // Recopilar datos del formulario
    const formData = new FormData(document.querySelector('#signup-form'));
    const email = formData.get('correo');

    // Enviar código de confirmación
    confirmationCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit code
    const endpoint = "/sendCode";
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email,
            confirmationCode: confirmationCode
        }),
    });

    if (response.ok) {
        alert('Código enviado al correo.');
        document.getElementById('signup-container').style.display = 'none';
        document.getElementById('email-confirmation').style.display = 'block';

        startResendTimer();
    } else {
        alert('Error al enviar el código. Intenta nuevamente.');
    }
});

//Listener para boton de verificar codigo
document.getElementById('verify-code-btn').addEventListener('click', () => {
    const userInput = document.getElementById('confirmation-code').value;
    if (userInput === confirmationCode.toString()) {
        alert('Código verificado.');
        proceedToCreateAccount();
    } else {
        alert('Código incorrecto.');
    }
});

//Funcion para crear la cuenta
async function proceedToCreateAccount() {
    const accountData = {
        primerNombre: document.getElementById('nombre1').value,
        segundoNombre: document.getElementById('nombre2').value,
        apellidoPaterno: document.getElementById('apellido1').value,
        apellidoMaterno: document.getElementById('apellido2').value,
        fechaNac: document.getElementById('fechaNac').value,
        correo: document.getElementById('correo').value,
        telefono: document.getElementById('telefono').value,
        dni: document.getElementById('dni').value,
        passwd: document.getElementById('passwd1').value,
        genero: document.getElementById('genero').value,
        educacion: document.getElementById('educacion').value,
    };

    try {
        const endpoint = "/signup";
        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(accountData),
        });

        const result = await response.json();
        if (response.ok) {
            showToast('¡Cuentra Creada! Redirigiendo…');

            setTimeout(async () => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            alert(`Error al crear cuenta: ${result.error}`);
        }
    } catch (error) {
        console.error('Error en el proceso de creación de cuenta:', error);
        alert('Hubo un problema al crear la cuenta. Inténtalo de nuevo.');
    }
}


//Listener para reenviar codigo
document.getElementById('resend-code-btn').addEventListener('click', () => {
    clearTimeout(resendTimeout);
    confirmationCode = Math.floor(100000 + Math.random() * 900000);
    alert(`Nuevo código enviado: ${confirmationCode}`); // Replace this with API call
    startResendTimer();
});

//Funcion para temporizador
function startResendTimer() {
    const resendButton = document.getElementById('resend-code-btn');
    const resendMessage = document.getElementById('resend-message');
    resendButton.disabled = true;
    resendMessage.style.display = 'block';

    resendTimeout = setTimeout(() => {
        resendButton.disabled = false;
        resendMessage.style.display = 'none';
    }, 60000); // 60 seconds
}