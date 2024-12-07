document.addEventListener('DOMContentLoaded', () => {
    const sentApplications = document.getElementById('sentApplications');
    const applicationModal = document.getElementById('applicationModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.querySelector('.close-btn');

    // Funcion para obtenener las aplicaciones
    async function fetchApplications() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3000/api/application/getApplicantApplications', {
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
            return { applications: [] }; // Return empty arrays if there's an error
        }
    }


    // Funcion para obtener la informacion detallada del candidato
    async function fetchCandidateDetails(candidateId, idapplication) {
        try {
            const response = await fetch(`http://localhost:3000/api/application/application-details2`, {
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

    // Función para renderizar una tarjeta de aplicación.
    function renderApplicationCard(application) {
        const card = document.createElement('div');
        card.classList.add('application-card');

        // Convertir fecha
        const formattedDate = formatDate(application.fechaaplicacion);

        card.innerHTML = `
        <h3>${application.vacancyname} </h3>
        <p>${formattedDate}</p>
        <span class="tag">${application.estado}</span>
    `;

        // Para obtener la información detallada del candidato al dar click
        card.addEventListener('click', () => openModal(application.idcandidato, application.idestado, application.id, application.comentario, application.vacancyname));
        return card;
    }

    // Funcion para mostrar los detalles del candidato en el modal
    function renderCandidateDetails(data, idestado, idapplication, comentario, vacancy) {
        const token = localStorage.getItem('token');
        const { candidateDetails, skills, references, evaluations } = data;

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

        // Contenido del Modal
        modalContent.innerHTML = `
        <h3>${vacancy}</h3>
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
        <div id="ultimocomentario"></div>
        <div id="applicationActions"></div>
    `;
        const ultimoComentario = document.getElementById('ultimocomentario');

        ultimoComentario.innerHTML = `
            <p><strong>Último comentario:</strong> ${comentario}</p>
            `;

        let verCurriculumBtn = document.getElementById('viewCurriculum');

        //Funcion para ver curriculo
        verCurriculumBtn.addEventListener("click", () => {
            viewCurriculum(candidateDetails.id);  // Call the function with the candidate id
        });

        applicationModal.style.display = 'flex';
    }

    // Funcion principal para iniciar la pagina
    async function initialize() {
        const { applications } = await fetchApplications();

        // Aplicaciones pendientes
        applications.forEach(application => {

            sentApplications.appendChild(renderApplicationCard(application));
        });

    }

    // Funcion para abrir el modal
    async function openModal(candidateId, idestado, idapplication, comentario, vacancy) {
        const candidateData = await fetchCandidateDetails(candidateId, idapplication);
        if (candidateData) {
            renderCandidateDetails(candidateData, idestado, idapplication, comentario, vacancy);
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

    //Funcion para ver curriculo
    async function viewCurriculum(candidateId) {
        try {
            const response = await fetch("http://localhost:3000/api/curriculum/view", {
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

    initialize();
});

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
