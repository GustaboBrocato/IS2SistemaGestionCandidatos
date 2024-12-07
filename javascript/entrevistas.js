import BASE_URL from '../javascript/config.js';

document.addEventListener("DOMContentLoaded", async () => {
    const vacancyList = document.getElementById("vacancy-list");
    const candidateCards = document.getElementById("candidate-cards");
    const interviewList = document.getElementById("interview-list");
    const modal = document.getElementById("interview-modal");
    const closeModal = document.getElementById("closeModal");
    const form = document.getElementById("interview-form");

    // Revisar si el usuario ha iniciado sesion
    const loggedIn = await isUserLoggedIn();
    if (!loggedIn) {
        window.location.href = '/IS2SistemaGestionCandidatos/html/login.html';
        return;
    }

    // Cargar las Vacantes
    await loadVacancies();

    // Funcion para cargar las vacantes
    async function loadVacancies() {
        try {
            const endpoint = "/api/vacancy/available-recruiter";
            const url = `${BASE_URL}${endpoint}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const vacancies = await res.json();
            vacancies.forEach((vac) => {
                const li = document.createElement("li");
                li.textContent = vac.titulo;
                li.onclick = () => loadCandidates(vac.id);
                vacancyList.appendChild(li);
            });
        } catch (error) {
            console.error('Error al cargar candidatos:', error);
        }
    }

    // Cargar candidatos para una vacante
    async function loadCandidates(vacancyId) {
        try {
            candidateCards.innerHTML = "";
            const endpoint = "/api/application/get-applicants";
            const url = `${BASE_URL}${endpoint}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ vacanteid: vacancyId })
            });

            const { applicants } = await res.json();

            // Mostrar las tarjetas de los candidatos
            applicants.forEach((cand) => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                <img src="${cand.imagen || '../imagenes/Default_Profile.png'}" alt="Profile Picture">
                <h3>${cand.primernombre} ${cand.apellidopaterno}</h3>
                <p>DNI: ${cand.dni}</p>
                <button class="interview-btn">Ver Entrevistas</button>
            `;

                // Open modal when card is clicked
                card.onclick = () =>
                    openModal(
                        cand.idcandidato,
                        cand.primernombre,
                        cand.apellidopaterno,
                        cand.imagen || "../imagenes/Default_Profile.png",
                        cand.id,
                        cand.idvacante,
                        cand.correo
                    );

                // Agrega evento al boton
                const interviewButton = card.querySelector(".interview-btn");
                interviewButton.onclick = (event) => {
                    event.stopPropagation(); // Previene abrir la tarjeta
                    loadInterviews(cand.idcandidato, cand.id, cand.correo);
                };

                candidateCards.appendChild(card);
            });

        } catch (error) {
            console.error('Error al cargar candidatos:', error);
        }
    }


    // Cargar entrevistas programadas de un candidato
    async function loadInterviews(id_candidato, id_aplicacion, correo) {
        try {
            interviewList.innerHTML = "";
            const endpoint = "/api/interviews/getInterviews";
            const url = `${BASE_URL}${endpoint}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ idcandidato: id_candidato, idaplicacion: id_aplicacion })
            });

            if (!res.ok) {
                throw new Error(`Error en la respuesta del servidor: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            const { interviews } = data;

            // Configuración para formatear fechas en español
            const formatter = new Intl.DateTimeFormat('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            // Mostrar las tarjetas de las entrevistas
            interviews.forEach((interview) => {
                // Parsear y formatear la fecha
                const formattedDate = formatter.format(new Date(interview.fecha_entrevista));

                const card = document.createElement("div");
                card.className = "card";

                // Construir el contenido de la tarjeta
                let buttonGroup = '';
                
                if (interview.idestado !== 12 && interview.idestado !== 7) {
                    buttonGroup = `
                    <div class="button-group">
                        <button class="btn-cancelar">Cancelar</button>
                        <button class="btn-reprogramar">Reprogramar</button>
                        <button class="btn-finalizar">Finalizar</button>
                    </div>
                `;
                }

                card.innerHTML = `
                <h3>Fecha: ${formattedDate}</h3>
                <p>Hora: ${interview.hora_entrevista}</p>
                <p>Medio: ${interview.medio}</p>
                <p>Ubicación/Enlace: ${interview.ubicacion}</p>
                ${buttonGroup}
                <p class="estado">Estado: ${interview.estado}</p>
            `;

                // Agregar eventos a los botones solo si los botones están visibles
                if (interview.idestado !== 12 && interview.idestado !== 7) {
                    card.querySelector('.btn-cancelar').addEventListener('click', () => cancelInterview(interview.id, id_aplicacion));
                    card.querySelector('.btn-reprogramar').addEventListener('click', () => reprogramInterview(interview, id_aplicacion, correo));
                    card.querySelector('.btn-finalizar').addEventListener('click', () => finalizeInterview(interview.id, id_aplicacion));
                }

                interviewList.appendChild(card);
            });
        } catch (error) {
            console.error('Error al cargar las entrevistas:', error);
        }
    }


    // Función para cancelar una entrevista con confirmación
    async function cancelInterview(idInterview, idAplicacion) {
        // Mostrar confirmación antes de cancelar
        const confirmCancel = confirm("¿Está seguro que desea cancelar esta entrevista?");

        if (!confirmCancel) {
            // Si el usuario selecciona "Cancelar", salir de la función
            return;
        }

        try {
            const endpoint = "/api/interviews/cancelInterview";
            const url = `${BASE_URL}${endpoint}`;
            const res = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ idinterview: idInterview, idaplicacion: idAplicacion })
            });

            if (res.ok) {
                alert("¡La entrevista ha sido cancelada!");
                window.location.reload();
            } else {
                alert("No se pudo cancelar la entrevista.");
            }
        } catch (error) {
            console.error('Error al cancelar la entrevista:', error);
            alert("Ocurrió un error al intentar cancelar la entrevista.");
        }
    }

    // Funcion para reprogramar una entrevista
    function reprogramInterview(interview, id_aplicacion, correo) {
        if (interview) {
            openReprogramModal(interview, id_aplicacion, correo);
        } else {
            alert("Entrevista no encontrada.");
        }
    }

    // Abrir modal de entrevista
    function openModal(candidateId, firstName, lastName, profileImg, applicationId, vacancyId, correo) {
        // Actualizar el nombre del candidato y la imagen de perfil
        document.getElementById("candidate-name").textContent = `${firstName} ${lastName}`;
        document.getElementById("profile-image").src = profileImg;

        setMinDateTimeForModal("interview-modal");

        // Establecer valores de entrada ocultos en el formulario
        form["candidate-id"].value = candidateId;
        form["application-id"].value = applicationId;
        form["vacancy-id"].value = vacancyId;
        form["correo"].value = correo;

        // Mostrar el modal
        modal.style.display = "block";
    }

    // Cerrar Modal Agendar Entrevista
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Cerrar dando click afuera
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Manejar el envío del formulario de entrevista
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const interviewData = {
            candidateId: formData.get("candidate-id"),
            applicationId: formData.get("application-id"),
            vacancyId: formData.get("vacancy-id"),
            date: formData.get("interview-date"),
            time: formData.get("interview-time"),
            medium: formData.get("interview-medium"),
            location: formData.get("interview-location"),
            email: formData.get("correo"),
        };

        try {
            const endpoint = "/api/interviews/saveInterview";
            const url = `${BASE_URL}${endpoint}`;
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(interviewData),
            });

            if (res.ok) {
                alert("¡Entrevista programada con éxito!");
                modal.style.display = "none";
                clearInterviewFields();
            } else {
                alert("No se pudo programar la entrevista.");
            }
        } catch (error) {
            console.error('Error al programar la entrevista:', error);
        }
    });

    // Función para finalizar una entrevista
    async function finalizeInterview(idInterview, idAplicacion) {
        // Mostrar confirmación antes de finalizar
        const confirmCancel = confirm("¿Está seguro que desea finalizar esta entrevista?");

        if (!confirmCancel) {
            // Si el usuario selecciona "Cancelar", salir de la función
            return;
        }

        try {
            const endpoint = "/api/interviews/finalizeInterview";
            const url = `${BASE_URL}${endpoint}`;
            const res = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ idinterview: idInterview, idaplicacion: idAplicacion })
            });

            if (res.ok) {
                alert("¡La entrevista ha sido finalizada!");
                window.location.reload();
            } else {
                alert("No se pudo finalizar la entrevista.");
            }
        } catch (error) {
            console.error('Error al finalizar la entrevista:', error);
            alert("Ocurrió un error al intentar finalizar la entrevista.");
        }
    }

    // Abrir modal para reprogramar entrevista
    function openReprogramModal(interview, id_aplicacion, correo) {
        const reprogramModal = document.getElementById("reprogram-modal");
        const reprogramForm = document.getElementById("reprogram-form");

        setMinDateTimeForModal("reprogram-modal");

        reprogramForm["interview-id"].value = interview.id;
        reprogramForm["application-id"].value = id_aplicacion;
        reprogramForm["correo"].value = correo;
        reprogramForm["reprogram-date"].value = interview.fecha_entrevista.split('T')[0];
        reprogramForm["reprogram-time"].value = interview.hora_entrevista;
        reprogramForm["reprogram-medium"].value = interview.medio;
        reprogramForm["reprogram-location"].value = interview.ubicacion;

        // Mostrar
        reprogramModal.style.display = "flex";
    }

    // Cerrar modal boton
    document.getElementById("close-reprogram-modal").addEventListener("click", () => {
        document.getElementById("reprogram-modal").style.display = "none";
    });

    // Cerrar dando click afuera
    window.addEventListener("click", (event) => {
        const reprogramModal = document.getElementById("reprogram-modal");
        if (event.target === reprogramModal) {
            reprogramModal.style.display = "none";
        }
    });

    // Manejar el envío del formulario de reprogramación
    document.getElementById("reprogram-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const reprogramData = {
            interviewId: formData.get("interview-id"),
            applicationId: formData.get("application-id"),
            date: formData.get("reprogram-date"),
            time: formData.get("reprogram-time"),
            medium: formData.get("reprogram-medium"),
            location: formData.get("reprogram-location"),
            email: formData.get("correo")
        };

        try {
            const endpoint = "/api/interviews/updateInterview";
            const url = `${BASE_URL}${endpoint}`;
            const res = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(reprogramData),
            });

            if (res.ok) {
                alert("¡Entrevista reprogramada con éxito!");
                document.getElementById("reprogram-modal").style.display = "none";
                loadInterviews(reprogramData.candidateId, reprogramData.applicationId);
            } else {
                alert("No se pudo reprogramar la entrevista.");
            }
        } catch (error) {
            console.error("Error al reprogramar la entrevista:", error);
        }
    });



    // Revisar el estado de session
    async function isUserLoggedIn() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;

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
                const data = await response.json();
                return data.loggedIn; // true or false
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }

    // Funcion para colocar la fecha y hora minima
    function setMinDateTimeForModal(modalId) {
        const now = new Date();

        // Formato de Fecha YYYY-MM-DD
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const minDate = `${year}-${month}-${date}`;

        // Formato de Hora HH:MM
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const minTime = `${hours}:${minutes}`;

        // Coloca minimos
        const modal = document.getElementById(modalId);
        if (modal) {
            const dateInput = modal.querySelector('input[type="date"]');
            const timeInput = modal.querySelector('input[type="time"]');

            if (dateInput) {
                dateInput.min = minDate;

                // Revisa si la fecha seleccionada es la actual
                dateInput.addEventListener('change', () => {
                    const selectedDate = new Date(dateInput.value);
                    const currentDate = new Date();

                    if (selectedDate.toDateString() === currentDate.toDateString()) {
                        // Si es la fecha actual, coloca el tiempo actual
                        if (timeInput) {
                            timeInput.min = minTime;
                        }
                    } else {
                        // Si la fecha es futura deja seleccionar cualquier hora
                        if (timeInput) {
                            timeInput.min = "00:00";
                        }
                    }
                });
            }

            if (timeInput) {
                timeInput.min = minTime;
            }
        }
    }

    //Funcion para limpiar campos de entrevista
    function clearInterviewFields() {
        // Clear the input fields by selecting them by their IDs or names
        document.getElementById("interview-date").value = "";
        document.getElementById("interview-time").value = "";
        document.getElementById("interview-medium").value = "";
        document.getElementById("interview-location").value = "";
    }
});
