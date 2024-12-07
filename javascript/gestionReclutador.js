import BASE_URL from '../javascript/config.js';

document.addEventListener("DOMContentLoaded", async () => {
    const loggedIn = await isUserLoggedIn();

    if (!loggedIn) {
        window.location.href = '/IS2SistemaGestionCandidatos/html/login.html';
        return;
    }

    const addRecruiterBtn = document.getElementById("addRecruiterBtn");
    const viewRecruitersBtn = document.getElementById("viewRecruitersBtn"); // Ensure this element exists
    const mainContent = document.getElementById("mainContent"); // Ensure this element exists
    const token = localStorage.getItem('token');

    if (!mainContent || !addRecruiterBtn || !viewRecruitersBtn) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    // Show the Add Recruiter Form
    addRecruiterBtn.addEventListener("click", () => {
        mainContent.innerHTML = `
            <h2>Agregar Reclutador</h2>
            <div class="vacancy-form-container">
                <form id="addRecruiterForm">
                    <label for="idEmpleado">Id Empleado</label>
                    <input type="text" id="idEmpleado" name="idEmpleado" placeholder="Ingrese el ID del empleado" required>
    
                    <label for="nombreCompleto">Nombre Completo</label>
                    <input type="text" id="nombreCompleto" name="nombreCompleto" placeholder="Ingrese el nombre completo" required>
    
                    <label for="correo">Correo</label>
                    <input type="email" id="correo" name="correo" placeholder="Ingrese el correo electrónico" required>
    
                    <button type="submit" class="button">
                        <span class="button__text">Agregar</span>
                        <span class="button__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </span>
                    </button>
                </form>
            </div>
        `;

        const addRecruiterForm = document.getElementById("addRecruiterForm");

        addRecruiterForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const idEmpleado = document.getElementById("idEmpleado").value;
            const nombreCompleto = document.getElementById("nombreCompleto").value;
            const correo = document.getElementById("correo").value;

            try {
                const endpoint = "/api/users/saveRecruiter";
                const url = `${BASE_URL}${endpoint}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ idEmpleado, nombreCompleto, correo }),
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Reclutador agregado exitosamente.");
                    mainContent.innerHTML = ""; // Clear form
                } else {
                    alert("Error: " + result.message);
                }
            } catch (error) {
                console.error("Error al agregar reclutador:", error);
                alert("Hubo un problema al agregar el reclutador.");
            }
        });
    });

    // View Recruiters
    viewRecruitersBtn.addEventListener("click", async () => {
        try {
            const endpoint = "/api/users/recruiters";
            const url = `${BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                const recruiters = result.data;

                mainContent.innerHTML = `
                    <h2>Lista de Reclutadores</h2>
                    <div class="recruiters-container">
                        ${recruiters.map(recruiter => `
                        <div class="card">
                            <div class="card-photo">
                                <img src="${recruiter.imagen || '../imagenes/Default_Profile.png'}" alt="Profile Picture">
                            </div>
                            <div class="card-title">${recruiter.nombre}<br>
                                <span>ID Empleado: ${recruiter.idempleado}</span>
                                <span>Usuario: ${recruiter.nombreusuario}</span><br>
                                <span 
                                    class="estado" 
                                    style="color: ${recruiter.idestado === "Activo" ? 'green' : 'red'};">
                                    ${recruiter.idestado === "Activo" ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div class="card-socials">
                                <button class="closeButton" data-id="${recruiter.id}">
                                <span class="X"></span>
                                <span class="Y"></span>
                                <div class="close">Eliminar</div>
                            </button>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                `;

                // Add event listeners for close buttons
                document.querySelectorAll('.closeButton').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const userId = button.getAttribute('data-id');

                        // Show confirmation dialog
                        const confirmed = confirm("¿Está seguro de que desea eliminar este usuario?");

                        if (!confirmed) {
                            // Exit if the user cancels
                            return;
                        }

                        try {
                            const endpoint = "/api/users/deleteUsuario";
                            const url = `${BASE_URL}${endpoint}`;
                            const response = await fetch(url, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ newStatus: 2, id: userId }),
                            });

                            const result = await response.json();
                            if (response.ok) {
                                alert(result.message);
                                viewRecruitersBtn.click(); // Refresh recruiters list
                            } else {
                                alert("Error updating user status: " + result.message);
                            }
                        } catch (error) {
                            console.error("Error updating user status:", error);
                            alert("Failed to update user status.");
                        }
                    });
                });

            } else {
                alert("Error al cargar los reclutadores: " + result.message);
            }
        } catch (error) {
            console.error("Error al cargar los reclutadores:", error);
            alert("Hubo un problema al cargar los reclutadores.");
        }
    });

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
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                return data.loggedIn;
            }
            return false;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }
});
