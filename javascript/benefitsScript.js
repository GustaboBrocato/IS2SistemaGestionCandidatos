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
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
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
    const modal = document.getElementById('vacancyModal');
    document.getElementById('modal-title').innerText = vacancy.titulo;
    document.getElementById('modal-thumbnail').src = `../imagenes/${vacancy.id_imagen || 'default.jpeg'}`;
    document.getElementById('modal-description').innerText = vacancy.descripcion;
    document.getElementById('modal-remuneracion').innerText = vacancy.remuneracion;
    document.getElementById('modal-departamento').innerText = vacancy.departamento;
    document.getElementById('modal-ubicacion').innerText = vacancy.ubicacion;
    document.getElementById('modal-fecha').innerText = new Date(vacancy.fecha_publicacion).toLocaleDateString();

    const applyButton = document.getElementById('apply-button');
    const removeButton = document.getElementById('remove-button');

    // Controla visibilidad de botones
    if (isReclutador) {
        applyButton.style.display = 'none';
        removeButton.style.display = 'block';
    } else {
        applyButton.style.display = 'block';
        removeButton.style.display = 'none';
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

    try {
        const response = await fetch(`http://localhost:3000/api/vacancy/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            },
            body: JSON.stringify(id),
        });
        if (response.ok) {
            alert('Vacancy removed successfully.');
            closeVacancyDetail();
            await loadVacancies(); // Refresh vacancies list
        } else {
            alert('Error removing vacancy.');
        }
    } catch (error) {
        console.error('Error removing vacancy:', error);
    }
}

