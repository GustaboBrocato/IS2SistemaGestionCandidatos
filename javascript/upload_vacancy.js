document.addEventListener('DOMContentLoaded', () => {
    // Obtener informacion de perfil de usuario
    const token = localStorage.getItem('token');
    const form = document.getElementById('vacancyForm');
    const imageSelect = document.getElementById('imageSelect');
    const thumbnail = document.getElementById('thumbnail');

    // Mostrar la imagen seleccionada
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

    // Funcion para enviar el formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Collect form data
        const formData = {
            titulo: document.getElementById('titulo').value,
            descripcion: document.getElementById('descripcion').value,
            remuneracion: document.getElementById('remuneracion').value,
            departamento: document.getElementById('departamento').value,
            ubicacion: document.getElementById('ubicacion').value,
            id_imagen: imageSelect.selectedIndex,
        };

        try {
            const response = await fetch('http://localhost:3000/api/vacancy/add-vacancy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Vacante agregada exitosamente');
                form.reset();
                thumbnail.src = '';
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error al agregar la vacante:', error);
            alert('Error al agregar la vacante.');
        }
    });
});