document.addEventListener("DOMContentLoaded", async () => {
    const loggedIn = await isUserLoggedIn();

    if (!loggedIn) {
        window.location.href = '/IS2SistemaGestionCandidatos/html/login.html';
    }

    const pendingApplications = document.getElementById('pendingApplications');
    const vacancySections = document.getElementById('vacancySections');
    const applicationModal = document.getElementById('applicationModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.querySelector('.close-btn');

    // Funcion para obtenener las aplicaciones
    async function fetchApplications() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3000/api/application/get-applications', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching applications: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
            return { pending: [], dynamic: [] }; // Return empty arrays if there's an error
        }
    }

    // Función para renderizar una tarjeta de aplicación.
    function renderApplicationCard(application) {
        const card = document.createElement('div');
        card.classList.add('application-card');
        card.innerHTML = `
            <img src="${application.imagen || '../imagenes/Default_Profile.png'}" alt="Profile Picture">
            <h3>${application.primernombre} ${application.apellidopaterno}</h3>
            <p>${application.vacancyname}</p>
            <span class="tag">${application.estado}</span>
        `;
        // Para obtener la informacion detallada del candidato al dar click
        card.addEventListener('click', () => openModal(application.idcandidato, application.idestado, application.id, application.comentario));
        return card;
    }

    // Funcion para obtener la informacion detallada del candidato
    async function fetchCandidateDetails(candidateId) {
        try {
            const response = await fetch(`http://localhost:3000/api/application/application-details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ id: candidateId })
            });
            if (!response.ok) {
                throw new Error(`Error fetching candidate details: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    // Funcion para calcular la edad desde la fecha de nacimiento
    function calculateAge(birthdate) {
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Funcion para mostrar los detalles del candidato en el modal
    function renderCandidateDetails(data, idestado, idapplication, comentario) {
        const { candidateDetails, skills, references } = data;

        // Nombre completo y edad
        const fullName = `${candidateDetails.primernombre} ${candidateDetails.segundonombre || ''} ${candidateDetails.apellidopaterno} ${candidateDetails.apellidomaterno || ''}`;
        const age = calculateAge(candidateDetails.fechanacimiento);

        // Lista de Habilidades
        const skillsList = skills.map(skill => `<li>${skill.nombrehabilidad}</li>`).join('');
        const skillsHTML = skillsList ? `<ul>${skillsList}</ul>` : '<p>No hay habilidades disponibles</p>';

        // Lista de Referencias
        const referencesList = references.map(ref =>
            `<li><strong>${ref.nombrereferencia}</strong>: ${ref.telefonoreferencia} (${ref.relacionreferencia})</li>`
        ).join('');
        const referencesHTML = referencesList ? `<ul>${referencesList}</ul>` : '<p>No hay referencias disponibles</p>';

        // Contenido del Modal
        modalContent.innerHTML = `
            <img src="${candidateDetails.imagenperfil || '../imagenes/Default_Profile.png'}" alt="Profile Picture">
            <h3>${fullName}</h3>
            <p><strong>Edad:</strong> ${age}</p>
            <p><strong>Correo:</strong> ${candidateDetails.correo}</p>
            <p><strong>Teléfono :</strong> ${candidateDetails.telefono}</p>
            <p><strong>DNI:</strong> ${candidateDetails.dni}</p>
            <p><strong>Género :</strong> ${candidateDetails.genero}</p>
            <p><strong>Nivel Educativo:</strong> ${candidateDetails.niveleducativo}</p>
            <button id="viewCurriculum" data-cv="${candidateDetails.curriculum}">Ver Currículo</button>
            <h4>Habilidades:</h4>
            ${skillsHTML}
            <h4>Referencias:</h4>
            ${referencesHTML}
            <div id="ultimocomentario"></div>
            <div id="applicationActions"></div>
        `;

        const applicationActions = document.getElementById('applicationActions');
        const ultimoComentario = document.getElementById('ultimocomentario');

        // Revisar el estado de la apliacion
        if (idestado === 3) {
            applicationActions.innerHTML = `
            <button id="startProcessButton">Iniciar Proceso</button>
        `;
            const startProcessButton = document.getElementById('startProcessButton');
            startProcessButton.addEventListener('click', async () => {
                const response = await fetch(`http://localhost:3000/api/application/application-start`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify({
                        id: idapplication,
                        email: candidateDetails.correo
                    })
                });

                if (response.ok) {
                    alert('Proceso iniciado con éxito.');
                    location.reload(true);
                } else {
                    alert('Hubo un error al iniciar el proceso.');
                }
            });
        } else if (idestado === 8) { // En Proceso
            ultimoComentario.innerHTML = `
            <p><strong>Último comentario:</strong> ${comentario}</p>
            `;

            applicationActions.innerHTML = `
            <textarea id="commentField" placeholder="Agregar comentario"></textarea>
            <button id="updateCommentButton">Actualizar Comentarios</button>
        `;

            const updateCommentButton = document.getElementById('updateCommentButton');
            const commentField = document.getElementById('commentField');

            updateCommentButton.addEventListener('click', async () => {
                const newComment = commentField.value.trim();
                if (newComment) {
                    const response = await fetch(`http://localhost:3000/api/application/application-comment`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                        body: JSON.stringify({
                            comentario: newComment,
                            id: idapplication
                        })
                    });

                    if (response.ok) {
                        alert('Comentario actualizado con éxito.');
                        location.reload(true);
                    } else {
                        alert('Hubo un error al actualizar el comentario.');
                    }
                } else {
                    alert('El comentario no puede estar vacío.');
                }
            });
        }

        // Boton para el curriculo
        const viewCurriculumButton = document.getElementById('viewCurriculum');
        viewCurriculumButton.addEventListener('click', () => {
            const curriculumUrl = viewCurriculumButton.getAttribute('data-cv');
            if (curriculumUrl) {
                window.open(curriculumUrl, '_blank'); // Abrir curriculo en una nueva ventana
            } else {
                alert('Currículo no disponible.');
            }
        });

        applicationModal.style.display = 'flex';
    }

    // Funcion para abrir el modal
    async function openModal(candidateId, idestado, idapplication, comentario) {
        const candidateData = await fetchCandidateDetails(candidateId);
        if (candidateData) {
            renderCandidateDetails(candidateData, idestado, idapplication, comentario);
        } else {
            alert('Error al cargar los detalles del candidato.');
        }
    }

    // Cerrar modal
    closeBtn.addEventListener('click', () => {
        applicationModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === applicationModal) {
            applicationModal.style.display = 'none';
        }
    });

    // Funcion principal para iniciar la pagina
    async function initialize() {
        const { pending, dynamic } = await fetchApplications();

        // Aplicaciones pendientes
        pending.forEach(application => {
            pendingApplications.appendChild(renderApplicationCard(application));
        });

        // Crear encabezado para las aplicaciones en proceso
        const processHeader = document.createElement('h2');
        processHeader.textContent = 'Aplicaciones en Proceso';
        vacancySections.appendChild(processHeader);

        // Organizar aplicaciones dinamicas por ID de vacante
        const applicationsByVacancy = {};

        dynamic.forEach(application => {
            // Agrupar aplicaciones por ID de vacante
            if (!applicationsByVacancy[application.vacancyname]) {
                applicationsByVacancy[application.vacancyname] = [];
            }
            applicationsByVacancy[application.vacancyname].push(application);
        });

        // Renderizar aplicaciones organizadas
        Object.keys(applicationsByVacancy).forEach(vacancyName => {
            // Crear contenedor para cada grupo de aplicaciones por vacante
            const vacancyTitleSection = document.createElement('div');
            const vacancySection = document.createElement('div');
            vacancyTitleSection.classList.add('vacancy-title-section');
            vacancySection.classList.add('vacancy-section');

            // Titulo de la vacante
            const vacancyTitle = document.createElement('h3');
            vacancyTitle.textContent = `Vacante: ${vacancyName}`;
            vacancyTitle.id = 'vacancyTitle';
            vacancyTitleSection.appendChild(vacancyTitle);

            // Añadir aplicaciones a este contenedor
            applicationsByVacancy[vacancyName].forEach(application => {
                vacancySection.appendChild(renderApplicationCard(application));
            });

            // Agregar sección al contenedor principal
            vacancySections.appendChild(vacancyTitleSection);
            vacancySections.appendChild(vacancySection);
        });
    }

    initialize();
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


