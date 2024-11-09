const changePictureButton = document.getElementById('changePictureButton');
const uploadPictureInput = document.getElementById('uploadPictureInput');
const recruiterProfilePicture = document.getElementById('recruiterProfilePicture');

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

        // Get the JWT token from localStorage or a cookie (depending on how you store it)
        const token = localStorage.getItem('token'); // Or get from cookies

        try {
            const response = await fetch('http://localhost:3000/api/images/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                }
            });

            const result = await response.json();
            if (response.ok) {
                // Update the profile picture with the new image URL
                showToastMessage("Profile picture updated successfully!");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showToastMessage("Failed to upload image: " + result.message);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            showToastMessage("Error uploading image. Please try again.");
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




