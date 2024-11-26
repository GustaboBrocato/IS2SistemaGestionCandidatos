document.addEventListener("DOMContentLoaded", () => {
    const createBtn = document.getElementById("create-btn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalContainer = document.getElementById("modalContainer-createRole");
    const profileBtn = document.getElementById('profile-btn'); // Botón Perfil
    const profileModal = document.getElementById('modalContainer-profile'); // Modal Perfil
    const closeProfileModal = document.getElementById('closeProfileModal'); // Botón Cerrar Modal
    const searchBtn = document.getElementById('search-btn'); // Botón Búsqueda Usuarios
    const searchModal = document.getElementById('modalContainer-searchUsers'); // Modal Búsqueda Usuarios
    const closeSearchModal = document.getElementById('closeSearchModal'); // Botón Cerrar Modal
    const logBtn = document.getElementById('log-btn'); // Botón Bitácora
    const logModal = document.getElementById('modalContainer-log'); // Modal Bitácora
    const closeLogModal = document.getElementById('closeLogModal'); // Botón Cerrar Modal


    // Abre el modal
    createBtn.addEventListener("click", () => {
        modalContainer.classList.add("show-modal");
    });

    // Cierra el modal
    closeModalBtn.addEventListener("click", () => {
        modalContainer.classList.remove("show-modal");
    });

    // Cierra el modal al hacer clic fuera de él
    window.addEventListener("click", (event) => {
        if (event.target === modalContainer) {
            modalContainer.classList.remove("show-modal");
        }
    });



    //Buscar usuarios
    searchBtn.addEventListener('click', () => {
        searchModal.classList.add('show-modal');
    });
    
    closeSearchModal.addEventListener('click', () => {
        searchModal.classList.remove('show-modal');
    });
    
    // Lógica para buscar usuarios (simulada)
    const searchUsersBtn = document.getElementById('searchUsersBtn');
    const searchResults = document.getElementById('searchResults');
    
    searchUsersBtn.addEventListener('click', () => {
    const searchValue = document.getElementById('searchInput').value;
    searchResults.innerHTML = `<p>Resultados para: ${searchValue}</p>`;
    // Aquí integrar la base de datos.
    });





    //modal Perfil
    profileBtn.addEventListener('click', () => {
        profileModal.classList.add('show-modal');
    });
    
    closeProfileModal.addEventListener('click', () => {
        profileModal.classList.remove('show-modal');
    });



    /* Abre el modal de bitácora
    logBtn.addEventListener('click', () => {
    logModal.classList.add('show-modal');
});

// Cierra el modal de bitácora
closeLogModal.addEventListener('click', () => {
    logModal.classList.remove('show-modal');
});

// Cierra el modal al hacer clic fuera de él
window.addEventListener('click', (event) => {
    if (event.target === logModal) {
        logModal.classList.remove('show-modal');
    }
});*/

});