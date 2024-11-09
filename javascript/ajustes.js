document.addEventListener("DOMContentLoaded", () => {
    const createBtn = document.getElementById("create-btn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalContainer = document.getElementById("modalContainer-createRole");

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
});