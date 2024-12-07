import BASE_URL from '../javascript/config.js';
const vacancyList = document.getElementById("vacancyList");
const candidateCards = document.getElementById("candidateCards");
const evaluationModal = document.getElementById("evaluationModal");
const closeModal = document.getElementById("closeModal");
const updateButton = document.getElementById("updateEvaluation");
const evaluationInputs = document.querySelectorAll('#evaluationForm input[type="number"]');
const chartModal = document.getElementById('chartModal');
const modalChartCanvas = document.getElementById('modalChart');
const closeChartModal = document.querySelector('.closeChart');
let chart;
let modalChartInstance;

// Informacion de Candidato
const candidateImage = document.getElementById("candidateImage");
const candidateName = document.getElementById("candidateName");

document.addEventListener("DOMContentLoaded", async () => {
    const loggedIn = await isUserLoggedIn();

    if (!loggedIn) {
        window.location.href = '/IS2SistemaGestionCandidatos/html/login.html';
    }

    await loadVacancies();

});

// Cargar Vacantes
async function loadVacancies() {
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
}

// Cargar Candidates
async function loadCandidates(vacancyId) {
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

    // Muestra las tarjetas de los candidatos
    applicants.forEach((cand) => {
        let imgSrc = "../imagenes/Default_Profile.png";
        if(cand.imagen){
            imgSrc = cand.imagen;
        };
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
        <img src="${cand.imagen || '../imagenes/Default_Profile.png'}" alt="Profile Picture">
        <h3>${cand.primernombre} ${cand.apellidopaterno}</h3>
        <p>DNI: ${cand.dni}</p>`;
        card.onclick = () => openModal(cand.idcandidato, cand.primernombre, cand.apellidopaterno, imgSrc, cand.id, cand.idvacante);
        candidateCards.appendChild(card);
    });

    await refreshChart(vacancyId);
}

//Genera el grafico tipo radar
function generateChart(labels, technical, soft, leadership, experience, overall) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');

    // Destruye instancia previa si existe una
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Habilidades Técnicas', 'Habilidades Blandas', 'Liderazgo', 'Experiencia', 'Puntaje General'],
            datasets: labels.map((candidate, index) => ({
                label: candidate,
                data: [
                    technical[index],
                    soft[index],
                    leadership[index],
                    experience[index],
                    overall[index]
                ],
                backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
                borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
                borderWidth: 1
            }))
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'point',
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
}



// Abrir modal
async function openModal(candidateId, firstName, lastName, imageSrc, idAplicacion, idVacante) {
    candidateImage.src = imageSrc;
    candidateName.textContent = `${firstName} ${lastName}`;

    try {
        const endpoint = "/api/evaluation/getEvaluation";
        const url = `${BASE_URL}${endpoint}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ candidatoId: candidateId, aplicationId: idAplicacion })
        });

        if (res.ok) {
            const { evaluation } = await res.json();

            if (evaluation) {
                document.getElementById("technicalSkills").value = evaluation[0].habilidades_tecnicas ?? 0;
                document.getElementById("softSkills").value = evaluation[0].habilidades_blandas ?? 0;
                document.getElementById("leadershipSkills").value = evaluation[0].habilidades_liderazgo ?? 0;
                document.getElementById("experience").value = evaluation[0].experiencia ?? 0;
            } else {
                // If no evaluation exists, set all inputs to 0
                setEvaluationInputsToDefault();
            }
        } else {
            console.error("No se pudo recuperar la evaluación. Estado de respuesta:", res.status);
            setEvaluationInputsToDefault();
        }
    } catch (error) {
        console.error("Error al recuperar la evaluación:", error);
        setEvaluationInputsToDefault();
    }

    // Mostral el modal
    evaluationModal.style.display = "flex";

    updateButton.onclick = () => updateEvaluation(candidateId, idAplicacion, idVacante);
}

// Funcion para reestablecer valores
function setEvaluationInputsToDefault() {
    document.getElementById("technicalSkills").value = 0;
    document.getElementById("softSkills").value = 0;
    document.getElementById("leadershipSkills").value = 0;
    document.getElementById("experience").value = 0;
}

// Cerrar Modal
closeModal.onclick = () => (evaluationModal.style.display = "none");

// Actualizar evaluación
async function updateEvaluation(candidateId, idAplicacion, vacancyId) {
    const technicalSkills = parseInt(document.getElementById("technicalSkills").value) || 0;
    const softSkills = parseInt(document.getElementById("softSkills").value) || 0;
    const leadershipSkills = parseInt(document.getElementById("leadershipSkills").value) || 0;
    const experience = parseInt(document.getElementById("experience").value) || 0;

    const evaluationData = {
        candidatoId: candidateId,
        applicationId: idAplicacion,
        habilidadesTecnicas: technicalSkills,
        habilidadesBlandas: softSkills,
        habilidadesLiderazgo: leadershipSkills,
        experiencia: experience
    };

    try {
        const endpoint = "/api/evaluation/updateEvaluation";
        const url = `${BASE_URL}${endpoint}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(evaluationData)
        });

        if (res.ok) {
            alert("Evaluación guardada con éxito");
            // Vuelva a buscar las evaluaciones y actualice el gráfico.
            await refreshChart(vacancyId);

            evaluationModal.style.display = "none";
        } else {
            alert("Error al guardar la evaluación");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Ocurrió un error al guardar la evaluación");
    }
}

// Funcion para actualizar la grafica
async function refreshChart(vacancyId) {
    try {
        // Obtiene la informacion para las graficas
        const endpoint = "/api/evaluation/getEvaluations";
        const url = `${BASE_URL}${endpoint}`;
        const evaluationRes = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ vacanteid: vacancyId })
        });

        const { success, evaluations } = await evaluationRes.json();

        if (!success) {
            console.error("No se pudieron recuperar las evaluaciones:", evaluations);
            return;
        }

        // Arrays utilizados para guardar la informacion para las graficas
        const labels = [];
        const technicalSkills = [];
        const softSkills = [];
        const leadershipSkills = [];
        const experience = [];
        const overall = [];

        evaluations.forEach(e => {

            labels.push(`${e.firstname} ${e.lastname}`);
            technicalSkills.push(e.technicalskills || 0);
            softSkills.push(e.softskills || 0);
            leadershipSkills.push(e.leadershipskills || 0);
            experience.push(e.experience || 0);

            // Calcula el indice total
            const totalScore = (
                (e.technicalskills || 0) +
                (e.softskills || 0) +
                (e.leadershipskills || 0) +
                (e.experience || 0)
            );
            const averageScore = totalScore / 4;
            overall.push(averageScore);
        });

        // Crea la grafica
        generateChart(labels, technicalSkills, softSkills, leadershipSkills, experience, overall);
    } catch (error) {
        console.error("Error al actualizar el gráfico:", error);
        alert("No se pudo actualizar el gráfico");
    }
}


// Validaciones para los cuadros de evaluacion
evaluationInputs.forEach(input => {
    input.addEventListener('input', () => {
        const value = parseInt(input.value, 10);

        //Si el valor es menos que 1, ponerlo en 1
        if (value < 0) {
            input.value = 0;
        }

        // Si el valor es mayor a 10 ponerlo en 10
        if (value > 10) {
            input.value = 10;
        }

        // Si es 0 o un valor negativo ponerlo en null
        if (value === 0 || isNaN(value)) {
            input.value = '';
        }
    });
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
        console.error('Error al comprobar el estado de inicio de sesión:', error);
        return false;
    }
}

// Función para abrir modal y duplicar el gráfico.
document.getElementById('comparisonChart').addEventListener('click', () => {
    chartModal.style.display = 'flex';

    if (modalChartInstance) {
        modalChartInstance.destroy();
    }

    // Obtenga los datos del gráfico del gráfico original
    const originalChart = chart;
    const chartData = originalChart.data;
    const chartOptions = JSON.parse(JSON.stringify(originalChart.options));

    // Crea un nuevo grafico
    const ctx = modalChartCanvas.getContext('2d');
    modalChartInstance = new Chart(ctx, {
        type: originalChart.config.type,
        data: chartData,
        options: chartOptions,
    });
});

// Cerrar usando el boton
closeChartModal.addEventListener('click', () => {
    chartModal.style.display = 'none';
    if (modalChartInstance) {
        modalChartInstance.destroy();
    }
});

// Cerrar dando click afuera
window.addEventListener('click', (event) => {
    if (event.target === chartModal) {
        chartModal.style.display = 'none';
        if (modalChartInstance) {
            modalChartInstance.destroy();
        }
    }
});
