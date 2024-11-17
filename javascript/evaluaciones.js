const vacancyList = document.getElementById("vacancyList");
const candidateCards = document.getElementById("candidateCards");
const evaluationModal = document.getElementById("evaluationModal");
const closeModal = document.getElementById("closeModal");
const updateButton = document.getElementById("updateEvaluation");

// Load Vacancies
async function loadVacancies() {
    const res = await fetch("http://localhost:3000/api/vacancy/available-recruiter", {
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

// Load Candidates
async function loadCandidates(vacancyId) {
    candidateCards.innerHTML = "";
    const res = await fetch(`/api/candidates/${vacancyId}`);
    const candidates = await res.json();
    candidates.forEach((cand) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="../imagenes/Default_Profile.png">
            <h3>${cand.primernombre} ${cand.apellidopaterno}</h3>
            <p>DNI: ${cand.dni}</p>`;
        card.onclick = () => openModal(cand.id);
        candidateCards.appendChild(card);
    });
}

// Open Evaluation Modal
function openModal(candidateId) {
    evaluationModal.style.display = "flex";
    updateButton.onclick = () => updateEvaluation(candidateId);
}

// Close Modal
closeModal.onclick = () => (evaluationModal.style.display = "none");

async function updateEvaluation(candidateId) {
    // Update Evaluation Backend Logic Here
    evaluationModal.style.display = "none";
}

window.onload = () => loadVacancies();
