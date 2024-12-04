// Obtener informacion de perfil de usuario
const token = localStorage.getItem('token');

//Cambiar correo
const emailPopup = document.getElementById("emailPopup");
const editEmailButton = document.getElementById("editEmailButton");
const closeEmailButton = document.getElementById("closeEmailPopup");

//Cambiar telefono
const telefonoPopup = document.getElementById("telefonoPopup");
const editTelefonoButton = document.getElementById("editPhoneButton");
const closeTelefonoButton = document.getElementById("closeTelefonoPopup");
const confirmTelefonoButton = document.getElementById("confirmTelefonoButton");

//Codio
const codePopup = document.getElementById("codePopup");
const closeCodeButton = document.getElementById("closeCodePopup");

//Actualizar Contraseña
const passwordPopup = document.getElementById("passwordPopup");
const closePasswordButton = document.getElementById("closePasswordPopup");

//habilidades
const skillListElement = document.getElementById("skillsList");
const skillModal = document.getElementById("skillModal");
const skillModalOverlay = document.getElementById("skillModalOverlay");
const skillSelector = document.getElementById("skillSelector");
const addSkillButton = document.getElementById("addSkillButton");
const confirmAddSkillButton = document.getElementById("confirmAddSkillButton");
const cancelSkillModalButton = document.getElementById("cancelSkillModalButton");

//referencias
const referencesListElement = document.getElementById("referencesList");
const referenceModal = document.getElementById("referenceModal");
const referenceModalOverlay = document.getElementById("referenceModalOverlay");
const addReferenceButton = document.getElementById("addReferenceButton");
const cancelReferenceModalButton = document.getElementById("cancelReferenceModalButton");
const referenceForm = document.getElementById("referenceForm");

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
const newTelefonoInput = document.getElementById("newTelefono");

// Botones
const verifyPasswordButton = document.getElementById("verifyPasswordButton");
const sendVerificationCodeButton = document.getElementById("sendVerificationCodeButton");
const confirmEmailButton = document.getElementById("confirmEmailButton");

// Eventos

//Evento de carga de documento
document.addEventListener('DOMContentLoaded', async () => {
    const loggedIn = await isUserLoggedIn();
    const token = localStorage.getItem('token');

    if (!loggedIn) {
        window.location.href = '/IS2SistemaGestionCandidatos/html/login.html';
    }

    const cvAlert = document.getElementById("cvAlert");
    const uploadCVButton = document.getElementById("uploadCVButton");
    const uploadCVInput = document.getElementById("uploadCVInput");

    await getUserInfo();
    await loadSkills();
    await loadReferences();

    // Comprobar si existe un plan de estudios
    const checkCurriculum = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/curriculum/check", {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (data.exists) {
                cvAlert.textContent = "Currículo almacenado.";
                cvAlert.style.color = "green";
            } else {
                cvAlert.textContent = "* No se ha subido ningún currículo.";
                cvAlert.style.color = "red";
            }
        } catch (error) {
            console.error("Error checking curriculum:", error);
        }
    };

    // Subir curriculum
    uploadCVButton.addEventListener("click", () => uploadCVInput.click());

    uploadCVInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Solo se permiten archivos PDF.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:3000/api/curriculum/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, // Keep the Authorization header
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                alert("Currículo cargado correctamente");
                cvAlert.textContent = "Currículo Almacenado.";
                cvAlert.style.color = "green";
            } else {
                alert("Error al subir el currículo");
                alert(data.message || "Error al subir el currículo.");
            }
        } catch (error) {
            console.error("Error uploading curriculum:", error);
        }
    });

    //Funcion para ver curriculo
    const viewCVButton = document.getElementById("viewCVButton");

    viewCVButton.addEventListener("click", async () => {
        try {
            const response = await fetch("http://localhost:3000/api/curriculum/view", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                window.open(url, "_blank");
            } else {
                const data = await response.json();
                alert(data.message || "No se pudo mostrar el curriculum.");
            }
        } catch (error) {
            console.error("Error viewing curriculum:", error);
        }
    });

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

    // Cargar lista de habilidades
    async function loadSkills() {
        try {
            const response = await fetch(`http://localhost:3000/api/candidatos/getSkills`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error fetching skills: ${response.statusText}`);
            }

            const skills = await response.json();

            // Borrar la lista actual
            skillsList.innerHTML = '';

            // Encabezados
            const headerItem = document.createElement('li');
            headerItem.classList.add('skills-header');

            // Agregar el encabezado a la lista
            headerItem.innerHTML = `
            <strong>Habilidad</strong>
            <strong>Acciones</strong>`;

            skillsList.appendChild(headerItem);

            // Complete la lista de habilidades
            skills.forEach(skill => {
                const listItem = document.createElement('li');
                listItem.classList.add('skill-item');
                listItem.innerHTML = `
                    <span>${skill.nombrehabilidad}</span>
                    <button class="delete-skill-button" data-id="${skill.id}">
                        <img src="../imagenes/eliminar_icon.png" alt="Delete" class="delete-icon">
                    </button>
                `;

                // Agregar funcionalidad de eliminación
                listItem.querySelector('.delete-skill-button').addEventListener('click', () => {
                    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar esta habilidad?");
                    if (confirmDelete) {
                        deleteSkill(skill.id);
                    }
                });

                skillsList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error al cargar las habilidades:', error);
        }
    }

    // Borrar habilidad
    async function deleteSkill(skillId) {
        try {
            const response = await fetch(`http://localhost:3000/api/candidatos/deleteSkill`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({ skillId })
            });

            if (!response.ok) {
                throw new Error(`Error al borrar la habilidad: ${response.statusText}`);
            }

            // Recargar habilidades
            await loadSkills();
        } catch (error) {
            console.error('Error al borrar la habilidad:', error);
        }
    }

    // Cargar lista de habilidades
    async function loadReferences() {
        try {
            const response = await fetch(`http://localhost:3000/api/candidatos/getReferences`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener las referencias: ${response.statusText}`);
            }

            const references = await response.json();

            // Borrar la lista actual
            referencesList.innerHTML = '';

            const headerItem = document.createElement('li');
            headerItem.classList.add('reference-header');

            headerItem.innerHTML = `
            <strong>Nombre</strong>
            <strong>Teléfono</strong>
            <strong>Relación</strong>
            <strong>Acciones</strong>
            `;

            // Agregar el encabezado a la lista
            referencesList.appendChild(headerItem);

            references.forEach(reference => {
                const listItem = document.createElement('li');
                listItem.classList.add('reference-item');
                listItem.innerHTML = `
                    <span>${reference.nombrereferencia}</span>
                    <span>${reference.telefonoreferencia}</span>
                    <span>${reference.relacionreferencia}</span>
                    <button class="delete-reference-button" data-id="${reference.id}">
                        <img src="../imagenes/eliminar_icon.png" alt="Delete" class="delete-icon">
                    </button>
                `;

                // Agregar funcionalidad de eliminación
                listItem.querySelector('.delete-reference-button').addEventListener('click', () => {
                    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar esta referencia laboral?");
                    if (confirmDelete) {
                        deleteReference(reference.id);
                    }
                });

                referencesList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error al cargar las referencias:', error);
        }
    }

        // Borrar habilidad
        async function deleteReference(referenceId) {
            try {
                const response = await fetch(`http://localhost:3000/api/candidatos/deleteReference`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-type': 'application/json',
                    },
                    body: JSON.stringify({ referenceId })
                });
    
                if (!response.ok) {
                    throw new Error(`Error al borrar la referencia: ${response.statusText}`);
                }
    
                await loadReferences();
            } catch (error) {
                console.error('Error al borrar la referencia:', error);
            }
        }

    checkCurriculum();

});

// Abrir
editEmailButton.addEventListener("click", () => {
    passwordPopup.style.display = "block";
});

// Abrir
editTelefonoButton.addEventListener("click", () => {
    telefonoPopup.style.display = "block";
});

changePasswordButton.addEventListener("click", () => {
    changePasswordPopup.style.display = "block";
});

// Cierre
closeChangePasswordButton.addEventListener("click", () => {
    changePasswordPopup.style.display = "none";
    clearAllFields();
});

closeTelefonoButton.addEventListener("click", () => {
    telefonoPopup.style.display = "none";
    clearAllFields();
});

closePasswordButton.addEventListener("click", closePopup);
closeEmailButton.addEventListener("click", closePopup);
closeCodeButton.addEventListener("click", closePopup);

// Evento - nueva abilidad
addSkillButton.addEventListener("click", () => {
    populateSkillSelector();
    skillModal.style.display = "block";
    skillModalOverlay.style.display = "block";
});

// Evento para cancelar el modal de habilidades.
cancelSkillModalButton.addEventListener("click", () => {
    skillModal.style.display = "none";
    skillModalOverlay.style.display = "none";
});

// Evento para abrir el modal de referencia.
addReferenceButton.addEventListener("click", () => {
    referenceModal.style.display = "block";
    referenceModalOverlay.style.display = "block";
});

// Evento para cancelar el modal de referencia.
cancelReferenceModalButton.addEventListener("click", () => {
    referenceModal.style.display = "none";
    referenceModalOverlay.style.display = "none";
});

// Evento - boton confirmar nueva habilidad
confirmAddSkillButton.addEventListener("click", async () => {
    const selectedSkill = skillSelector.value;
    if (selectedSkill) {
        try {
            const response = await fetch(`http://localhost:3000/api/candidatos/addSkill`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({ selectedSkill })
            });

            if (!response.ok) {
                throw new Error(`Error al agregar la habilidad: ${response.statusText}`);
            }

            referenceModal.style.display = "none";
            referenceModalOverlay.style.display = "none";
            window.location.reload();
        } catch (error) {
            console.error('Error al agregar la habilidad:', error);
        }
    }
});

// Evento para agregar una nueva referencia
referenceForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Obtiene la informacion del formulario
    const newReference = {
        nombrereferencia: document.getElementById("refName").value,
        telefonoreferencia: document.getElementById("refContact").value,
        relacionreferencia: document.getElementById("refRelacion").value,
    };

    try {
        const response = await fetch(`http://localhost:3000/api/candidatos/addReference`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
            },
            body: JSON.stringify(newReference),
        });

        if (!response.ok) {
            throw new Error(`Error al agregar la referencia: ${response.statusText}`);
        }

        referenceModal.style.display = "none";
        referenceModalOverlay.style.display = "none";
        window.location.reload();
    } catch (error) {
        console.error('Error al agregar la referencia:', error);
    }

    // Reset form
    referenceForm.reset();
});



//Funciones

//Funcion para obtener informacion de perfil
const getUserInfo = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/candidatos/profileCandidato', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userInfo = await response.json();
            document.getElementById('candidateName').textContent = userInfo.nombrecompleto;
            document.getElementById('candidateDNI').innerHTML = `<strong>DNI: </strong> ${userInfo.dni}`;
            document.getElementById('candidateEmail').innerHTML = `<strong>Correo: </strong> ${userInfo.correo}`;
            document.getElementById('candidatePhone').innerHTML = `<strong>Teléfono: </strong> ${userInfo.telefono}`;
            await getProfileImage();
        } else {
            console.error('No se pudo recuperar la información del candidato:', response.statusText);
        }
    } catch (error) {
        console.error('No se pudo recuperar la información del candidato:', error);
    }
};

//Funcion para obtener la imagen
const getProfileImage = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/images/getImageCandidato', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
            }
        });

        if (response.ok) {
            const imageBlob = await response.blob();
            const imageObjectUrl = URL.createObjectURL(imageBlob);

            // Coloca la imagen
            candidateProfilePicture.src = imageObjectUrl;
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
    const response = await fetch('http://localhost:3000/api/candidatos/verify-password', {
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
    const response = await fetch('http://localhost:3000/api/candidatos/send-verification-code', {
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

    const response = await fetch('http://localhost:3000/api/candidatos/confirm-email', {
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

// Cambio Telefono
confirmTelefonoButton.addEventListener("click", async () => {
    const newTelefono = document.getElementById("newTelefono").value;

    const response = await fetch('http://localhost:3000/api/candidatos/update-telefono', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newTelefono })
    });

    if (response.ok) {
        alert("Número de teléfono actualizado exitosamente");
        location.reload();
    } else {
        alert("Error al actualizar el número de teléfono");
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
        const response = await fetch('http://localhost:3000/api/candidatos/change-password', {
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

const availableSkills = [
    // Habilidades Técnicas
    "C#", "C++", "Java", "Python", "JavaScript", "Swift", "Kotlin",
    "Unity", "Unreal Engine", "Godot",
    "Modelado 3D", "Texturizado", "Animación", "Diseño de Niveles", "Diseño UX/UI", "Creación de Activos", "Iluminación y Sombras",
    "Blender", "Autodesk Maya", "Photoshop", "Illustrator", "Substance Painter",
    "Desarrollo Multiplataforma", "Desarrollo de AR/VR", "Optimización para Móviles", "Publicación en Tiendas de Aplicaciones", "Integración de Compras Dentro de la App",
    "Creación de Efectos de Sonido", "Composición de Música de Fondo", "Implementación de Audio",
    "Networking para Multijugador", "Servicios en la Nube (AWS, Firebase)", "Gestión de Bases de Datos", "APIs REST", "Control de Versiones (Git)",
    "Optimización del Rendimiento", "Seguimiento de Errores", "Pruebas de Jugabilidad",
    "Metodologías Ágiles/Scrum", "Documentación de Diseño de Juegos",

    // Habilidades Blandas
    "Resolución de Problemas", "Creatividad", "Habilidades de Comunicación", "Colaboración en Equipo", "Gestión del Tiempo",
    "Adaptabilidad", "Pensamiento Crítico", "Atención a los Detalles", "Resolución de Conflictos", "Liderazgo", "Inglés"
];

// Función para completar el selector de habilidades
function populateSkillSelector() {
    skillSelector.innerHTML = ""; // Clear existing options
    availableSkills
        .forEach(skill => {
            const option = document.createElement("option");
            option.value = skill;
            option.textContent = skill;
            skillSelector.appendChild(option);
        });
}

// Función para representar referencias actuales.
function renderReferences() {
    referencesListElement.innerHTML = "";
    workReferences.forEach(ref => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${ref.name}</strong> - ${ref.position} at ${ref.company} (${ref.contact})`;
        referencesListElement.appendChild(li);
    });
}

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
    newTelefonoInput.value = "";
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

// Representación inicial de habilidades y referencias.
//renderSkills();
//renderReferences();
