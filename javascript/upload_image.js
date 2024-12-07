import BASE_URL from '../javascript/config.js';
const changePictureButton = document.getElementById('changePictureButton');
const uploadPictureInput = document.getElementById('uploadPictureInput');
const recruiterProfilePicture = document.getElementById('recruiterProfilePicture');
const candidateProfilePicture = document.getElementById('candidateProfilePicture');

// Abrir el selector de imágenes
changePictureButton.addEventListener('click', () => {
    uploadPictureInput.click();
});

// Manejo de selección de imagen
uploadPictureInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('token');

        try {
            const endpoint = "/api/images/uploadCandidato";
            const url = `${BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (response.ok) {
                showToastMessage("¡Foto de perfil actualizada exitosamente!");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showToastMessage("No se pudo cargar la imagen:" + result.message);
            }
        } catch (error) {
            console.error("Error al cargar la imagen:", error);
            showToastMessage("Error al cargar la imagen. Por favor inténtalo de nuevo.");
        }
    }
});

// Función para mostrar mensaje
function showToastMessage(message) {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toastMessage.style.display = 'block';

    // Hide the toast message after 3 seconds
    setTimeout(() => {
        toastMessage.style.display = 'none';
    }, 3000);
}




