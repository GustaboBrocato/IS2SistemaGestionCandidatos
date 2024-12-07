import BASE_URL from '../javascript/config.js';

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
            const endpoint = "/api/application/get-applications";
            const url = `${BASE_URL}${endpoint}`;
            const response = await fetch(url, {
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
        card.addEventListener('click', () => openModal(application.idcandidato, application.idestado, application.id, application.comentario, application.imagen));
        return card;
    }

    // Funcion para obtener la informacion detallada del candidato
    async function fetchCandidateDetails(candidateId, idapplication) {
        try {
            const endpoint = "/api/application/application-details";
            const url = `${BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ id: candidateId, idapplicacion: idapplication })
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
    function renderCandidateDetails(data, idestado, idapplication, comentario, imagen) {
        const token = localStorage.getItem('token');
        const { candidateDetails, skills, references, evaluations, interviews } = data;

        // Nombre completo y edad
        const fullName = `${candidateDetails.primernombre} ${candidateDetails.segundonombre || ''} ${candidateDetails.apellidopaterno} ${candidateDetails.apellidomaterno || ''}`;
        const age = calculateAge(candidateDetails.fechanacimiento);

        // Revisión de evaluaciones
        evaluations.habilidades_tecnicas = evaluations.habilidades_tecnicas ?? 'No evaluado';
        evaluations.habilidades_blandas = evaluations.habilidades_blandas ?? 'No evaluado';
        evaluations.habilidades_liderazgo = evaluations.habilidades_liderazgo ?? 'No evaluado';
        evaluations.Experiencia = evaluations.Experiencia ?? 'No evaluado';

        // Lista de Habilidades
        const skillsList = skills.map(skill => `<li>${skill.nombrehabilidad}</li>`).join('');
        const skillsHTML = skillsList ? `<ul>${skillsList}</ul>` : '<p>No hay habilidades disponibles</p>';

        // Lista de Referencias
        const referencesList = references.map(ref =>
            `<li><strong>${ref.nombrereferencia}</strong>: ${ref.telefonoreferencia} (${ref.relacionreferencia})</li>`
        ).join('');
        const referencesHTML = referencesList ? `<ul>${referencesList}</ul>` : '<p>No hay referencias disponibles</p>';

        // Lista de Entrevistas
        const interviewsList = interviews.map(ref =>
            `<li><strong>${formatDate(ref.fecha_entrevista)}</strong>: ${formatTo12Hour(ref.hora_entrevista)} (${ref.nombreestado})</li>`
        ).join('');
        const interviewsHTML = interviewsList ? `<ul>${interviewsList}</ul>` : '<p>No hay entrevistas disponibles</p>';

        // Contenido del Modal
        modalContent.innerHTML = `
        <img src="${imagen || '../imagenes/Default_Profile.png'}" alt="Profile Picture">
        <h3>${fullName}</h3>
        <p><strong>Edad:</strong> ${age}</p>
        <p><strong>Correo:</strong> ${candidateDetails.correo}</p>
        <p><strong>Teléfono :</strong> ${candidateDetails.telefono}</p>
        <p><strong>DNI:</strong> ${candidateDetails.dni}</p>
        <p><strong>Género :</strong> ${candidateDetails.genero}</p>
        <p><strong>Nivel Educativo:</strong> ${candidateDetails.niveleducativo}</p>
        <button class="buttonDownload" id="viewCurriculum" data-cv="${candidateDetails.curriculum}>Download</button>
        <button class="Btn" id="viewCurriculum" data-cv="${candidateDetails.curriculum}>
        <svg class="svgIcon" viewBox="0 0 384 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path></svg>
        <span class="icon2"></span>
        <span class="tooltip">Ver Currículo</span>
        </button>
        <h4>Habilidades:</h4>
        ${skillsHTML}
        <h4>Referencias:</h4>
        ${referencesHTML}
        ${idestado === 8 ? `
        <h4>Evaluaciones:</h4>
        <ul>
            <li><strong>Habilidades Técnicas:</strong> ${evaluations.habilidades_tecnicas}</li>
            <li><strong>Habilidades Blandas:</strong> ${evaluations.habilidades_blandas}</li>
            <li><strong>Habilidades de Liderazgo:</strong> ${evaluations.habilidades_liderazgo}</li>
            <li><strong>Experiencia:</strong> ${evaluations.Experiencia}</li>
        </ul>` : ''}
        <h4>Entrevistas:</h4>
        ${interviewsHTML}
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
                const endpoint = "/api/application/application-start";
                const url = `${BASE_URL}${endpoint}`;
                const response = await fetch(url, {
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

            let verCurriculumBtn = document.getElementById('viewCurriculum');

            verCurriculumBtn.addEventListener("click", () => {
                viewCurriculum(candidateDetails.id);
            });

        } else if (idestado === 8) { // En Proceso
            ultimoComentario.innerHTML = `
            <p><strong>Último comentario:</strong> ${comentario}</p>
            `;

            applicationActions.innerHTML = `
            <textarea id="commentField" placeholder="Agregar comentario"></textarea>
            <button class="sendButton" id="updateCommentButton">
            <div class="svg-wrapper-1">
                <div class="svg-wrapper">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24">
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path
                    fill="currentColor"
                    d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                    ></path>
                </svg>
                </div>
            </div>
            <span>Enviar</span>
            </button>
        `;

            const updateCommentButton = document.getElementById('updateCommentButton');
            const commentField = document.getElementById('commentField');

            updateCommentButton.addEventListener('click', async () => {
                const newComment = commentField.value.trim();
                if (newComment) {
                    const endpoint = "/api/application/application-comment";
                    const url = `${BASE_URL}${endpoint}`;
                    const response = await fetch(url, {
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

            let verCurriculumBtn = document.getElementById('viewCurriculum');

            //Funcion para ver curriculo
            verCurriculumBtn.addEventListener("click", () => {
                viewCurriculum(candidateDetails.id);  // Call the function with the candidate id
            });
        }

        applicationModal.style.display = 'flex';
    }

    //Funcion para ver curriculo
    async function viewCurriculum(candidateId) {
        try {
            const endpoint = "/api/curriculum/view";
            const url = `${BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ id: candidateId }),
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
    }

    // Funcion para abrir el modal
    async function openModal(candidateId, idestado, idapplication, comentario, imagen) {
        const candidateData = await fetchCandidateDetails(candidateId, idapplication);
        if (candidateData) {
            renderCandidateDetails(candidateData, idestado, idapplication, comentario, imagen);
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

    function formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Fecha inválida";
        }
        return date.toLocaleString("es-HN", {
            timeZone: "America/Tegucigalpa",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    function formatTo12Hour(timeString) {
        const [hour, minute] = timeString.split(':').map(Number);

        const period = hour >= 12 ? 'PM' : 'AM';

        const hour12 = hour % 12 || 12;

        return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
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


