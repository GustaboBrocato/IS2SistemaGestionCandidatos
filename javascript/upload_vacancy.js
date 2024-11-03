document.addEventListener('DOMContentLoaded', () => {
    const vacancyForm = document.getElementById('vacancyForm');
    const imageSelect = document.getElementById('imageSelect');
    const thumbnail = document.getElementById('thumbnail');

    // Display image preview based on selected option
    imageSelect.addEventListener('change', () => {
        const selectedOption = imageSelect.options[imageSelect.selectedIndex];
        const imageUrl = selectedOption.getAttribute('data-image');

        if (imageUrl) {
            thumbnail.src = imageUrl;
            thumbnail.style.display = 'block';
        } else {
            thumbnail.style.display = 'none';
        }
    });

    vacancyForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Collect form data
        const title = document.getElementById('titulo').value.trim();
        const description = document.getElementById('descripcion').value.trim();
        const remuneration = document.getElementById('remuneracion').value.trim();
        const department = document.getElementById('departamento').value.trim();
        const location = document.getElementById('ubicacion').value.trim();
        const selectedImage = imageSelect.value.trim();

        // Simple validation
        if (!title || !description || !remuneration || !department || !location || !selectedImage) {
            alert('Please fill in all fields.');
            return;
        }

        alert(`Vacancy Uploaded:
        - Title: ${title}
        - Description: ${description}
        - Remuneration: ${remuneration}
        - Department: ${department}
        - Location: ${location}
        - Image: ${selectedImage}`);

        vacancyForm.reset();
        thumbnail.style.display = 'none'; // Hide thumbnail after reset
    });
});
