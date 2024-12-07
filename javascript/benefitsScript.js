import BASE_URL from '../javascript/config.js';

document.addEventListener("DOMContentLoaded", async function () {
    const benefitCards = document.querySelectorAll(".benefit-card");

    benefitCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = "translateY(0)";
            card.style.opacity = "1";
        }, index * 100); // Delay en cascada
    });

    const closeBtn = document.getElementById('closeButton');
    const applyBtn = document.getElementById('apply-button');
    const removeBtn = document.getElementById('remove-button');

    closeBtn.addEventListener("click", () => {
        closeVacancyDetail();
    });

    applyBtn.addEventListener("click", () => {
        applyToVacancy();
    });

    removeBtn.addEventListener("click", () => {
        removeListing();
    });

    // Load vacancies on page load
    await loadVacancies();
});

//Funcion para revisar el permiso del role
async function checkUserRole(requiredRole) {
    try {
        const token = localStorage.getItem('token');
        const endpoint = "";
        const url = `${BASE_URL}/api/roles/checkRole?requiredRole=${requiredRole}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            },
            mode: 'cors',
        });

        const data = await response.json();
        return data.exists;
    } catch (error) {
        console.error('Función de comprobación de errores:', error);
        throw new Error('Rol de comprobación de errores. Por favor inténtalo de nuevo más tarde..');
    }
}

//Funcion para revisar si el ID de creador de la vacante concuerda con el usuario
async function checkUserID(id) {
    try {
        const token = localStorage.getItem('token');
        const endpoint = "/api/vacancy/checkUserID";
        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            },
            body: JSON.stringify({ usuarioID: id }),
            mode: 'cors',
        });

        const data = await response.json();
        return data.exists;
    } catch (error) {
        console.error('Error al revisar el ID de usuario:', error);
        throw new Error('Error al revisar el ID de usuario.');
    }
}


// Funcion para obtener las vacantes disponibles
async function loadVacancies() {
    const vacanciesContainer = document.getElementById('vacanciesContainer');
    const token = localStorage.getItem('token');
    let vacancyImage = null;

    try {
        const endpoint = "/api/vacancy/available-auth";
        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            },
            mode: 'cors',
        });
        const vacancies = await response.json();

        vacanciesContainer.innerHTML = '';

        vacancies.forEach(vacancy => {
            const vacancyCard = document.createElement('div');
            vacancyCard.classList.add('vacancy-card');
            vacancyCard.setAttribute('data-id', vacancy.id);
            vacancyCard.onclick = () => openVacancyDetail(vacancy);


            if (vacancy.id_imagen == 1) {
                vacancyImage = "developer2.jpeg";
            } else if (vacancy.id_imagen == 2) {
                vacancyImage = "developer.jpeg";
            } else {
                vacancyImage = "3dartist.jpeg";
            }

            vacancyCard.innerHTML = `
                <h3>${vacancy.titulo}</h3>
                <img src="../imagenes/${vacancyImage}" alt="Thumbnail" class="vacancy-thumbnail">
                <p>${vacancy.descripcion}</p>
                <p><strong>Remuneración:</strong> ${vacancy.remuneracion}</p>
            `;

            vacanciesContainer.appendChild(vacancyCard);
        });
    } catch (error) {
        console.error('Error al cargar las vacantes:', error);
    }
}

async function openVacancyDetail(vacancy) {
    const loggedIn = await isUserLoggedIn();
    let isReclutador = false;
    let isUsuario = false;
    let isCreator = false;

    if (loggedIn) {
        isReclutador = await checkUserRole("Reclutador");
        isUsuario = await checkUserRole("Usuario");
        isCreator = await checkUserID(vacancy.idusuario);
    } else {
        isReclutador = false;
        isUsuario = false;
        isCreator = false;
    }

    const modal = document.getElementById('vacancyModal');
    let vacancyImage = null;

    if (vacancy.id_imagen == 1) {
        vacancyImage = "developer2.jpeg";
    } else if (vacancy.id_imagen == 2) {
        vacancyImage = "developer.jpeg";
    } else {
        vacancyImage = "3dartist.jpeg";
    }

    document.getElementById('modal-title').innerText = vacancy.titulo;
    document.getElementById('modal-thumbnail').src = `../imagenes/${vacancyImage}`;
    document.getElementById('modal-description').innerText = vacancy.descripcion;
    document.getElementById('modal-remuneracion').innerText = vacancy.remuneracion;
    document.getElementById('modal-departamento').innerText = vacancy.departamento;
    document.getElementById('modal-ubicacion').innerText = vacancy.ubicacion;
    document.getElementById('modal-fecha').innerText = new Date(vacancy.fecha_publicacion).toLocaleDateString();

    const applyButton = document.getElementById('apply-button');
    const removeButton = document.getElementById('remove-button');
    const warning = document.getElementById('modal-warning');

    // Controla visibilidad de botones
    if (isReclutador && isCreator) {
        applyButton.style.display = 'none';
        removeButton.style.display = 'block';
        warning.style.display = 'none';
    } else if (isReclutador && !isCreator) {
        applyButton.style.display = 'none';
        removeButton.style.display = 'none';
        warning.style.display = 'block';
        warning.textContent = '¡Esta vacante fue creada por otro reclutador o reclutadora!';
    } else if (isUsuario) {
        applyButton.style.display = 'block';
        removeButton.style.display = 'none';
        warning.style.display = 'none';
        // Verifique si el usuario ya postuló para esta vacante
        const alreadyApplied = await checkIfUserApplied(vacancy.id, vacancy.idusuario);
        if (alreadyApplied) {
            applyButton.disabled = true;
            applyButton.style.display = 'none';
            warning.style.display = 'block';
            warning.textContent = '¡Ya has aplicado para esta vacante!';
        }
    } else {
        applyButton.style.display = 'none';
        removeButton.style.display = 'none';
        warning.style.display = 'block';
        warning.textContent = '¡Por favor inicia sesión o inscríbete para poder aplicar a la vacante!';
    }

    // Almacenar el ID de vacante para la acción de eliminación
    removeButton.dataset.vacancyId = vacancy.id;

    // Agregar oyentes para botones
    applyButton.onclick = async () => {
        if (isUsuario) {
            try {
                const token = localStorage.getItem('token');
                let userId = vacancy.idusuario;
                let vacanteId = vacancy.id;

                const endpoint = "/api/application/addApplication";
                const url = `${BASE_URL}${endpoint}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Credentials': 'true',
                        'Access-Control-Allow-Methods': 'GET,OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                    },
                    body: JSON.stringify({ userId, vacanteId }),
                    mode: 'cors',
                });

                if (!response.ok) {
                    alert('Hubo un problema al aplicar a la vacante.');
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al enviar la aplicación.');
                }

                alert('¡Aplicación enviada exitosamente!');
                location.reload();
            } catch (error) {
                console.error('Error en la solicitud de aplicación:', error);
                throw error;
            }
        }
    };

    removeButton.onclick = async () => {
        if (isReclutador && isCreator) {
            const confirmDelete = confirm('¿Estás seguro de que deseas eliminar esta vacante?');
            if (confirmDelete) {
                try {
                    const response = await removeVacancy(vacancy.id);
                    if (response.success) {
                        alert('¡Vacante eliminada exitosamente!');
                        modal.style.display = 'none';
                    } else {
                        alert('Hubo un problema al eliminar la vacante.');
                    }
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    alert('Error al eliminar la vacante.');
                }
            }
        }
    };

    modal.style.display = 'flex';
}

// Función para comprobar si el usuario ya postuló para la vacante
async function checkIfUserApplied(vacanteId, userId) {
    try {
        const endpoint = "/api/application/checkIfApplied";
        const url = `${BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            },
            body: JSON.stringify({ vacanteId, userId }),
        });

        const data = await response.json();
        return data.applied;
    } catch (error) {
        console.error('Error al verificar si el usuario ya aplicó:', error);
        return false;
    }
}

function closeVacancyDetail() {
    document.getElementById('vacancyModal').style.display = 'none';
}

async function applyToVacancy(vacanteId, userId) {
    try {
        const endpoint = "/api/application/addApplication";
        const url = `${BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            },
            body: JSON.stringify({ userId, vacanteId }),
            mode: 'cors',
        });

        if (!response.ok) {
            // Handle HTTP errors (e.g., 4xx or 5xx)
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al enviar la aplicación.');
        }

        const data = await response.json();
        return response.ok;
    } catch (error) {
        console.error('Error en la solicitud de aplicación:', error);
        throw error; // Let the caller handle this error
    }
}

// Funcion para cerrar una vacante (solo para Reclutadores)
async function removeListing() {
    const id = document.getElementById('remove-button').dataset.vacancyId;
    const token = localStorage.getItem('token');

    // Confirmacion
    const userConfirmed = confirm('¿Estás seguro de que deseas cerrar esta vacante? Esta acción no se puede deshacer.');

    if (!userConfirmed) {
        return;
    }

    try {
        const endpoint = "/api/vacancy/delete";
        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            },
            body: JSON.stringify({ id: id }),
            mode: 'cors',
        });

        if (response.ok) {
            alert('La vacante ha sido cerrada.');
            closeVacancyDetail();
            await loadVacancies(); // Refresh vacancies list
        } else {
            const errorData = await response.json();
            alert(`Error al cerrar la vacante: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error al cerrar la vacante:', error);
    }
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
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            },
            mode: 'cors',
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

