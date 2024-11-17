document.addEventListener("DOMContentLoaded", async function() {
    const benefitCards = document.querySelectorAll(".benefit-card");

    benefitCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = "translateY(0)";
            card.style.opacity = "1";
        }, index * 100); // Delay en cascada
    });

    // Load vacancies on page load
    await loadVacancies();
});

//Funcion para revisar el permiso del role
async function checkUserRole(requiredRole) {
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

//Funcion para revisar si el ID de creador de la vacante concuerda con el usuario
async function checkUserID(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/vacancy/checkUserID`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
            },
            body: JSON.stringify({ usuarioID: id})
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
    vacancyImage = null;

    try {
        const response = await fetch('http://localhost:3000/api/vacancy/available-auth', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
            },
        });
        const vacancies = await response.json();

        vacanciesContainer.innerHTML = '';

        vacancies.forEach(vacancy => {
            const vacancyCard = document.createElement('div');
            vacancyCard.classList.add('vacancy-card');
            vacancyCard.setAttribute('data-id', vacancy.id);
            vacancyCard.onclick = () => openVacancyDetail(vacancy);
            

            if (vacancy.id_imagen == 1){
                vacancyImage = "developer2.jpeg";
            } else if (vacancy.id_imagen == 2){
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
        console.error('Error loading vacancies:', error);
    }
}

async function openVacancyDetail(vacancy) {
    const isReclutador = await checkUserRole("Reclutador");
    const isUsuario = await checkUserRole("Usuario");
    const isCreator = await checkUserID(vacancy.idusuario);
    const modal = document.getElementById('vacancyModal');
    vacancyImage = null;

    if (vacancy.id_imagen == 1){
        vacancyImage = "developer2.jpeg";
    } else if (vacancy.id_imagen == 2){
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
    } else if(isReclutador && !isCreator){
        applyButton.style.display = 'none';
        removeButton.style.display = 'none';
        warning.style.display = 'block';
        warning.textContent = '¡Esta vacante fue creada por otro reclutador o reclutadora!';
    } else if (isUsuario) {
        applyButton.style.display = 'block';
        removeButton.style.display = 'none';
        warning.style.display = 'none';
    } else {
        applyButton.style.display = 'none';
        removeButton.style.display = 'none';
        warning.style.display = 'block';
        warning.textContent = '¡Por favor inicia sesión o inscríbete para poder aplicar a la vacante!';
    }

    // Store vacancy ID for removal action
    removeButton.dataset.vacancyId = vacancy.id;

    modal.style.display = 'flex';
}

function closeVacancyDetail() {
    document.getElementById('vacancyModal').style.display = 'none';
}

function redirectToApply() {
    alert('Redirecting to apply/signup page.');
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
        const response = await fetch(`http://localhost:3000/api/vacancy/delete`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id }),
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

