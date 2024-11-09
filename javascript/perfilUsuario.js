// Obtener informacion de perfil de usuario
const token = localStorage.getItem('token');

const getUserInfo = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/users/profileUsuario', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userInfo = await response.json();
            
            document.getElementById('recruiterName').textContent = userInfo.nombre;
            document.getElementById('employeeId').innerHTML= `<strong>ID de Empleado: </strong> ${userInfo.nombre}`;
            document.getElementById('recruiterEmail').innerHTML = `<strong>Correo: </strong> ${userInfo.correo}`;
            await getProfileImage();
            //document.getElementById('registrationDate').textContent = userInfo.fecharegistro;
        } else {
            console.error('Failed to fetch user info:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
};

//Funcion para obtener la imagen
const getProfileImage = async () => {
    try {
        const token = localStorage.getItem('token'); // Get the JWT token from localStorage
        const response = await fetch('http://localhost:3000/api/images/getImage', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Send the token in the Authorization header
            }
        });

        if (response.ok) {
            const imageBlob = await response.blob();
            const imageObjectUrl = URL.createObjectURL(imageBlob);

            // Coloca la imagen
            recruiterProfilePicture.src = imageObjectUrl;
        } else {
            menuProfilePicture.src = '../imagenes/Default_Profile.png';
            console.error('Failed to fetch image: ', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching image:', error);
    }
};


document.addEventListener('DOMContentLoaded', () => {
    getUserInfo();
});
