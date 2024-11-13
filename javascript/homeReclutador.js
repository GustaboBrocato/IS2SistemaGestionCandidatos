document.addEventListener("DOMContentLoaded", async () => {
    const loggedIn = await isUserLoggedIn();

    if(!loggedIn){
        window.location.href = '/IS2SistemaGestionCandidatos/html/login.html';
    }
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

        const response = await fetch('http://localhost:3000/authenticate', {
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
        console.error('Error checking login status:', error);
        return false;
    }
}